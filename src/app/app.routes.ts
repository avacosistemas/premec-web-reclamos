import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from '@fwk/auth/guards/auth.guard';
import { NoAuthGuard } from '@fwk/auth/guards/noAuth.guard';
import { LayoutComponent } from '@fwk/layout/layout.component';
import { InitialRedirectComponent } from '@fwk/auth/guards/initial-redirect.component';
import { CRUD_MODULES } from 'app/core/registries/crud.registry';
import { generateFwkPageRoutes } from '@fwk/utils/crud-route-generator';
import { DevModeGuard } from '@fwk/auth/guards/dev-mode.guard';

export const appRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        canActivate: [NoAuthGuard],
        component: InitialRedirectComponent
    },
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'welcome' },

    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('@fwk/auth/components/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('@fwk/auth/components/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('@fwk/auth/components/reset-password/reset-password.routes') },
            { path: 'sign-in', loadChildren: () => import('@fwk/auth/components/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('@fwk/auth/components/sign-up/sign-up.routes') }
        ]
    },

    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: { initialData: initialDataResolver },
        children: [
            {
                path: 'dev-tools',
                canActivate: [DevModeGuard],
                data: { layout: 'dense' },
                loadChildren: () => import('@fwk/modules/dev-tools/dev-tools.routes')
            },
            { path: 'unlock-session', data: { layout: 'empty' }, loadChildren: () => import('@fwk/auth/components/unlock-session/unlock-session.routes') },
            { 
                path: 'change-password', 
                data: { layout: 'empty' },
                loadChildren: () => import('@fwk/auth/components/change-password/change-password.routes') 
            },
            { path: 'welcome', loadChildren: () => import('app/modules/welcome/welcome.routes') },
            ...CRUD_MODULES.map(crudModule => ({
                path: crudModule.path,
                data: {
                    //
                },
                loadChildren: () => Promise.resolve(generateFwkPageRoutes(crudModule.loader))
            })),
        ]
    },

    {
        path: '',
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            { path: 'sign-out', loadChildren: () => import('@fwk/auth/components/sign-out/sign-out.routes') },
            { path: '403', loadChildren: () => import('@fwk/modules/error/error-403/error-403.routes') },
            { path: '404', loadChildren: () => import('@fwk/modules/error/error-404/error-404.routes') },
        ]
    },

    { path: '**', redirectTo: '/404' }
];