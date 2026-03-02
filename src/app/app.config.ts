import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common'; 
import localeEsAr from '@angular/common/locales/es';

import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { appRoutes } from 'app/app.routes';
import { provideFuse } from '@fuse';
import { Scheme } from '@fuse/services/config';

import { provideFwkAuth, provideAppAuth } from '@fwk/auth/auth.provider';
import { provideFwkCore } from '@fwk/providers/core.provider';
import { provideAppNavigation } from '@fwk/navigation/navigation.provider';
import { provideFwkBranding } from '@fwk/providers/config.provider';

registerLocaleData(localeEsAr, 'es-AR');

function getInitialScheme(): Scheme {
    const storedScheme = localStorage.getItem('fuse-theme-scheme');
    if (storedScheme === 'light' || storedScheme === 'dark' || storedScheme === 'auto') {
        return storedScheme;
    }
    return 'light';
}

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: LOCALE_ID, useValue: 'es-AR' },

        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
            withComponentInputBinding(),
            withRouterConfig({ onSameUrlNavigation: 'reload' })
        ),
        importProvidersFrom(MatDialogModule),

        provideFwkBranding({
            appName: 'PREMEC',
            appLogo: 'assets/images/logo/logo_premec.png',
            appLogoSmall: 'assets/images/logo/logo_premec.png',
            welcomeTitleLine1: 'Administrador de',
            welcomeTitleLine2: 'Contenidos PREMEC'
        }),

        provideFwkCore(),
        provideFwkAuth(),
        provideAppAuth(),
        provideAppNavigation(),

        provideFuse({
            mockApi: undefined,
            fuse: {
                layout: 'dense',
                scheme: getInitialScheme(), 
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme: 'theme-default',
                themes: [
                    {
                        id: 'theme-default',
                        name: 'Default',
                    },
                ],
            },
        }),
    ],
};