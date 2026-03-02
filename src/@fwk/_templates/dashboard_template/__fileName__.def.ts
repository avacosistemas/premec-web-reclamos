import { __constName___SECURITY_DEF } from './security/__fileName__.security';
import { __constName___I18N_DEF } from './i18n/__fileName__.i18n';
import { __constName___NAV_DEF } from './navigation/__fileName__.nav';
import { __constName___LAYOUT_DEF } from './layout/__fileName__.layout';
import { CrudDef } from '@fwk/model/component-def/crud-def';

export const __constName___DEF: CrudDef = { 
    name: '__constName__',
    i18n: __constName___I18N_DEF,
    navigation: __constName___NAV_DEF,
    security: __constName___SECURITY_DEF,
    dashboardConfig: __constName___LAYOUT_DEF,
};