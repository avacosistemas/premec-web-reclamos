export const PREFIX_DOMAIN_API = 'http://premec.ddns.net:48080/ws-reclamos/';
export const PREFIX_DOMAIN_WEB = 'http://localhost:4200/';
export const PREFIX_STATS_API = PREFIX_DOMAIN_API + 'estadisticas/';  // Reservado prefijo y endpoint para dashboards
export const PREFIX_SWAGGER_API = 'http://premec.ddns.net:48080/ws-reclamos/v2/api-docs';

export const environment = {
    appId: 'reclamosApp',
    localAuth: true,
    useMocks: false,
    production: true,
    security: true,
    dummyServices: false,
    hmr: false,

    apiBaseUrl: PREFIX_DOMAIN_API,
    SITE_DOMAIN_WEB: PREFIX_DOMAIN_WEB,

    auth: {
        signIn: PREFIX_DOMAIN_API + 'auth',
        signOut: PREFIX_DOMAIN_API + 'user/logout',
        refreshToken: PREFIX_DOMAIN_API + 'refresh',
        forgotPassword: PREFIX_DOMAIN_API + 'password/reset',
        changePassword: PREFIX_DOMAIN_API + 'password/update/',
        resetPassword: PREFIX_DOMAIN_API + 'password/reset',
        signUp: PREFIX_DOMAIN_API + 'auth/sign-up'
    },

    AUTOCOMPLETE_WAITING_TIME: 700,

    appConfig: {
        appName: 'PREMEC',
        appLogo: 'assets/images/logo/logo_premec.png',
        appLogoSmall: 'assets/images/logo/logo_premec.png',
        welcomeTitleLine1: 'Gestor de Reclamos',
        welcomeTitleLine2: '',
        showWelcome: false,
        urlToRedirect: '/reclamos',
        showSearchButton: false,
        showCollapseSidebarIcon: false,
        sidebarOpened: false,
        signInWelcomeSubtitle: '¡Bienvenido! Desde aquí podrás gestionar tus reclamos.',
        urlToRedirectOnLogout: '/sign-in',
    },

    customRoutes: [
        // { path: 'welcome', loadChildren: () => import('app/modules/welcome/welcome.routes') }
    ]
};