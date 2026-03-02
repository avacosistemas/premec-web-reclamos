import { __constName___CREATE_FORM_FIELDS_DEF } from './form/__fileName__.create.fields';
import { __constName___UPDATE_FORM_FIELDS_DEF } from './form/__fileName__.update.fields';
import { __constName___READ_FORM_FIELDS_DEF } from './form/__fileName__.read.fields';
import { __constName___FILTER_FORM_FIELDS_DEF } from './form/__fileName__.filter.fields';
import { __constName___CREATE_FORM_BEHAVIOR_DEF } from './form/__fileName__.create.behavior';
import { __constName___UPDATE_FORM_BEHAVIOR_DEF } from './form/__fileName__.update.behavior';
import { __constName___FILTER_FORM_BEHAVIOR_DEF } from './form/__fileName__.filter.behavior';
import { __constName___SECURITY_DEF } from './security/__fileName__.security';
import { __constName___GRID_DEF } from './grid/__fileName__.grid';
import { __constName___I18N_DEF } from './i18n/__fileName__.i18n';
import { __constName___NAV_DEF } from './navigation/__fileName__.nav';
import { CrudDef } from '@fwk/model/component-def/crud-def';
import { PREFIX_DOMAIN_API } from 'environments/environment';

export const __constName___DEF: CrudDef = { 
    name: '__constName__',
    i18n: __constName___I18N_DEF,
    grid: __constName___GRID_DEF, 
    forms: {
        filter: __constName___FILTER_FORM_FIELDS_DEF, 
        __filterBehavior__
        __formCreate__
        __createBehavior__
        __formUpdate__
        __updateBehavior__
        __formRead__
    },
    navigation: __constName___NAV_DEF,
    security: __constName___SECURITY_DEF,
    ws: {
        key: '__constName___CRUD_URL',
        url: PREFIX_DOMAIN_API + '__apiEndpoint__'
    },
    dialogConfig: {
        width: '600px'
    },
    __exportCsv__
    filterInMemory: __filterInMemory__,
    serverPagination: __serverPagination__,
    pagination: {
        page: 0,
        pageSize: __pageSize__
    },
    cancelInitSearch: __cancelInitSearch__
};