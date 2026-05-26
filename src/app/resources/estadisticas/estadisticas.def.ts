import { PageComponentDef } from '@fwk/model/component-def/page-component-def';
import { EstadisticasComponent } from './component/estadisticas.component';
import { ESTADISTICAS_I18N_DEF } from './i18n/estadisticas.i18n';
import { ESTADISTICAS_NAV_DEF } from './navigation/estadisticas.nav';
import { ESTADISTICAS_SECURITY_DEF } from './security/estadisticas.security';

export const ESTADISTICAS_DEF: PageComponentDef = {
    name: 'ESTADISTICAS',
    i18n: ESTADISTICAS_I18N_DEF,
    navigation: ESTADISTICAS_NAV_DEF,
    security: ESTADISTICAS_SECURITY_DEF,
    component: EstadisticasComponent,
};
