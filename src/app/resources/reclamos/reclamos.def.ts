import { CrudDef } from "@fwk/model/component-def/crud-def";
import { RECLAMOS_I18N_DEF } from "./i18n/reclamos.i18n";
import { RECLAMOS_NAV_DEF } from "./navigation/reclamos.nav";
import { RECLAMOS_GRID_DEF } from "./grid/reclamos.grid";
import { RECLAMOS_FILTER_FORM_FIELDS_DEF } from "./form/reclamos.filter.fields";
import { RECLAMOS_CREATE_FORM_FIELDS_DEF, RECLAMOS_CREATE_BEHAVIOR_DEF } from "./form/reclamos.create.fields";
import { RECLAMOS_UPDATE_FORM_FIELDS_DEF } from "./form/reclamos.update.fields";
import { RECLAMOS_READ_FORM_FIELDS_DEF } from "./form/reclamos.read.fields";
import { RECLAMOS_MOCK_DATA } from "./api-mock/reclamos.mock";
import { CONDITION_COMPARE } from "@fwk/model/dynamic-form/dynamic-field-condition-if";

export const RECLAMOS_DEF: CrudDef = {
    name: 'RECLAMOS',
    i18n: RECLAMOS_I18N_DEF,
    mock: true,
    mockData: RECLAMOS_MOCK_DATA,
    grid: RECLAMOS_GRID_DEF,
    dialogConfig: {
        width: '800px'
    },
    readCondition: { key: 'estado', compare: CONDITION_COMPARE.EQUALS, value: 'Cerrado' },
    forms: {
        filter: RECLAMOS_FILTER_FORM_FIELDS_DEF,
        create: RECLAMOS_CREATE_FORM_FIELDS_DEF,
        createBehavior: RECLAMOS_CREATE_BEHAVIOR_DEF,
        update: RECLAMOS_UPDATE_FORM_FIELDS_DEF,
        read: RECLAMOS_READ_FORM_FIELDS_DEF
    },
    security: {
        createAccess: 'AGREGAR_RECLAMO'
    },
    navigation: RECLAMOS_NAV_DEF,
    filterInMemory: true,
    serverPagination: false,
    cancelInitSearch: false,
    pagination: {
        page: 0,
        pageSize: 10
    }
};
