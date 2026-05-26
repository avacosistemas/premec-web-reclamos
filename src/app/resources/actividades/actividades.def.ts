import { CrudDef } from "@fwk/model/component-def/crud-def";
import { PREFIX_DOMAIN_API } from "environments/environment";
import { ACTIVIDADES_GRID_DEF } from "./grid/actividades.grid";
import { ACTIVIDADES_I18N_DEF } from "./i18n/actividades.i18n";
import { ACTIVIDADES_NAV_DEF } from "./navigation/actividades.nav";
import { ACTIVIDADES_SECURITY_DEF } from "./security/actividades.security";
import { ACTIVIDADES_FILTER_FORM_FIELDS_DEF } from "./form/actividades.filter.fields";
import { ACTIVIDADES_READ_FORM_FIELDS_DEF } from "./form/actividades.read.fields";

export const ACTIVIDADES_DEF: CrudDef = {
    name: 'ACTIVIDADES',
    i18n: ACTIVIDADES_I18N_DEF,
    ws: { url: PREFIX_DOMAIN_API + 'reclamo/actividades', key: 'data' },
    grid: ACTIVIDADES_GRID_DEF,
    navigation: ACTIVIDADES_NAV_DEF,
    security: ACTIVIDADES_SECURITY_DEF,
    forms: {
        filter: ACTIVIDADES_FILTER_FORM_FIELDS_DEF,
        read: ACTIVIDADES_READ_FORM_FIELDS_DEF,
    },
    filterInMemory: false,
    serverPagination: false,
    cancelInitSearch: false,
    backButton: true,
        dialogConfig: {
        width: '800px'
    },
    pagination: {
        page: 0,
        pageSize: 10,
    },
};
