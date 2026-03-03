import { InjectionToken } from '@angular/core';

export interface FwkConfig {
    appName: string;
    appLogo: string;
    appLogoSmall?: string;
    welcomeTitleLine1?: string;
    welcomeTitleLine2?: string;
    showWelcome?: boolean;
    urlToRedirect?: string;
    showSearchButton?: boolean;
    showCollapseSidebarIcon?: boolean;
    sidebarOpened?: boolean;
}

export const DEFAULT_FWK_CONFIG: FwkConfig = {
    appName: 'FRAMEWORK',
    appLogo: 'assets/images/logo/logo.png',
    welcomeTitleLine1: 'Gesto de',
    welcomeTitleLine2: 'Reclamos',
    showWelcome: true,
    urlToRedirect: '/dashboard',
    showSearchButton: true,
    showCollapseSidebarIcon: true,
    sidebarOpened: true
};

export const FWK_CONFIG = new InjectionToken<FwkConfig>('FWK_CONFIG', {
    providedIn: 'root',
    factory: () => DEFAULT_FWK_CONFIG
});