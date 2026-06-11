import { CrudDef } from "@fwk/model/component-def/crud-def";
import { RECLAMOS_I18N_DEF } from "./i18n/reclamos.i18n";
import { RECLAMOS_NAV_DEF } from "./navigation/reclamos.nav";
import { RECLAMOS_GRID_DEF } from "./grid/reclamos.grid";
import { RECLAMOS_FILTER_FORM_FIELDS_DEF } from "./form/reclamos.filter.fields";
import { RECLAMOS_CREATE_FORM_FIELDS_DEF } from "./form/reclamos.create.fields";
import { RECLAMOS_CREATE_BEHAVIOR_DEF } from "./form/reclamos.create.behavior";
import { RECLAMOS_UPDATE_FORM_FIELDS_DEF } from "./form/reclamos.update.fields";
import { RECLAMOS_READ_FORM_FIELDS_DEF } from "./form/reclamos.read.fields";
import { RECLAMOS_MOCK_DATA } from "./api-mock/reclamos.mock";
import { CONDITION_COMPARE } from "@fwk/model/dynamic-form/dynamic-field-condition-if";
import { PREFIX_DOMAIN_API } from "environments/environment";

import { DialogService } from "@fwk/services/dialog-service/dialog.service";
import { I18nService } from "@fwk/services/i18n-service/i18n.service";
import { Injector } from "@angular/core";

export const RECLAMOS_DEF: CrudDef = {
    name: 'RECLAMOS',
    i18n: RECLAMOS_I18N_DEF,
    mock: false,
    mockData: RECLAMOS_MOCK_DATA,
    ws: {
        key: 'reclamo',
        url: PREFIX_DOMAIN_API + 'reclamo'
    },
    grid: RECLAMOS_GRID_DEF,
    dialogConfig: {
        width: '800px'
    },
    forceGetDetail: false,
    readCondition: { key: 'estadoReclamo', compare: CONDITION_COMPARE.EQUALS, value: 'Cerrado' },
    forms: {
        filter: RECLAMOS_FILTER_FORM_FIELDS_DEF,
        create: RECLAMOS_CREATE_FORM_FIELDS_DEF,
        createBehavior: RECLAMOS_CREATE_BEHAVIOR_DEF,
    },
    security: {
        createAccess: 'AGREGAR_RECLAMO'
    },
    deniedCreateAlerts: [
        {
            messageKey: 'create_access_denied_message',
            type: 'warning'
        },
    ],
    navigation: RECLAMOS_NAV_DEF,
    filterInMemory: false,
    serverPagination: true,
    cancelInitSearch: false,
    pagination: {
        page: 0,
        pageSize: 10
    },
    onAddSuccess: (entity: any, response: any, injector: Injector) => {
        if (entity.feedback_prioridad) {
            const dialogService = injector.get(DialogService);
            const i18nService = injector.get(I18nService);
            const message = i18nService.translate(entity.feedback_prioridad, 'RECLAMOS');

            dialogService.showQuestionModal({
                title: 'Aviso',
                message: message,
                onSubmit: () => { },
                actions: {
                    confirm: {
                        label: 'Entendido'
                    },
                    cancel: { show: false }
                }
            });
        }
    },
};
