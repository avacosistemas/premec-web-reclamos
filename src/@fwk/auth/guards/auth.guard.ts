import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { NotificationService } from '@fwk/services/notification/notification.service';
import { AbstractAuthService } from '../abstract-auth.service';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';
import { CrudDef } from '@fwk/model/component-def/crud-def';
import { PageComponentDef } from '@fwk/model/component-def/page-component-def';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> => {
    const authService = inject(AbstractAuthService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);
    const i18nService = inject(I18nService);

    const noPermissionMessage = i18nService.getDictionary('fwk')?.translate?.('guard_no_permission') ?? 'guard_no_permission';

    if (state.url === '/sign-out') {
        return of(true);
    }
    
    return authService.check().pipe(
        switchMap((authenticated) => {
            if (!authenticated) {
                const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                return of(router.parseUrl(`sign-in?${redirectURL}`));
            }

            const definition: CrudDef | PageComponentDef | null = route.firstChild?.data['definition'];

            if (definition) {
                const requiredPermission = definition.security?.readAccess;
                if (requiredPermission && !authService.hasPermission(requiredPermission)) {
                    notificationService.notifyError(noPermissionMessage);
                    return of(router.parseUrl('/403'));
                }
            }

            const staticPermission = route.data['requiredPermission'];
            if (staticPermission && !authService.hasPermission(staticPermission)) {
                notificationService.notifyError(noPermissionMessage);
                return of(router.parseUrl('/403'));
            }

            return of(true);
        }),
    );
};