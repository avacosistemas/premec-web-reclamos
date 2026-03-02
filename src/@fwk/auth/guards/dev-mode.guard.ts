import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from 'environments/environment';

export const DevModeGuard: CanActivateFn = () => {
    const router = inject(Router);

    if (environment.production) {
        return router.parseUrl('/404');
    }

    return true;
};