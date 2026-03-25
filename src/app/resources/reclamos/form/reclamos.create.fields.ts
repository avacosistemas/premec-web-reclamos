import { DynamicField, AUTOCOMPLETE, AUTOCOMPLETE_DESPLEGABLE, SELECT, TEXTBOX, TEXTAREA, FILE, RADIO_BUTTON } from "@fwk/model/dynamic-form/dynamic-field";
import { PREFIX_DOMAIN_API } from "environments/environment";

export const RECLAMOS_CREATE_FORM_FIELDS_DEF: DynamicField<any>[] = [
    {
        key: 'maquina_tipo',
        controlType: 'hidden',
        colSpan: 0
    },
    {
        key: 'maquina_valida',
        controlType: 'hidden',
        colSpan: 0
    },
    {
        key: 'idTipoProblema',
        controlType: 'hidden',
        colSpan: 0
    },
    {
        key: 'idProblema',
        controlType: 'hidden',
        colSpan: 0
    },
    {
        key: 'equipmentCardNum',
        controlType: 'hidden',
        colSpan: 0
    },
    {
        key: 'internalSerialNum',
        controlType: 'hidden',
        colSpan: 0
    },
    {
        key: 'itemCode',
        controlType: 'hidden',
        colSpan: 0
    },
    {
        key: 'manufacturerSerialNum',
        controlType: 'hidden',
        colSpan: 0
    },
    {
        key: 'maquina',
        labelKey: 'f_maquina',
        controlType: AUTOCOMPLETE_DESPLEGABLE,
        options: {
            fromWs: {
                key: 'customer_equipment',
                url: PREFIX_DOMAIN_API + 'customer/equipment'
            },
            elementLabel: 'label',
            elementValue: 'tipo',
            transferIdToField: 'maquina_tipo',
            transferMap: {
                equipmentCardNum: 'EquipmentCardNum',
                internalSerialNum: 'InternalSerialNum',
                itemCode: 'ItemCode',
                manufacturerSerialNum: 'ManufacturerSerialNum'
            },
            minTermLength: 1,
            searchOnFocus: true
        },
        required: true,
        colSpan: 4
    },
    {
        key: 'tipo',
        labelKey: 'f_tipo',
        controlType: AUTOCOMPLETE_DESPLEGABLE,
        options: {
            elementLabel: 'nombre',
            elementValue: 'id',
            transferIdToField: 'idTipoProblema',
            searchOnFocus: true
        },
        apiOptions: {
            url: PREFIX_DOMAIN_API + 'tipoProblemaMaquina',
            queryString: {
                tipo: 'maquina_tipo'
            }
        },
        required: true,
        colSpan: 2,
        disabled: true
    },
    {
        key: 'subtipo',
        labelKey: 'f_subtipo',
        controlType: AUTOCOMPLETE_DESPLEGABLE,
        options: {
            elementLabel: 'nombre',
            elementValue: 'id',
            transferIdToField: 'idProblema',
            useNativeFilter: false,
            searchOnFocus: true,
        },
        apiOptions: {
            url: PREFIX_DOMAIN_API + 'problemaMaquina',
            queryString: {
                id: 'idTipoProblema',
                nombre: 'subtipo'
            }
        },
        required: true,
        colSpan: 2,
        disabled: true
    },
    {
        key: 'asunto',
        labelKey: 'f_asunto',
        controlType: TEXTBOX,
        required: true,
        colSpan: 4
    },
    {
        key: 'descripcion',
        labelKey: 'f_detalle',
        controlType: TEXTAREA,
        required: true,
        colSpan: 4
    },
    {
        key: 'feedback_prioridad',
        controlType: 'hidden',
        colSpan: 4
    },
    {
        key: 'prioridad',
        labelKey: 'f_prioridad',
        controlType: RADIO_BUTTON,
        options: {
            options: [
                { label: 'Funciona', value: 'scp_Low' },
                { label: 'No Funciona', value: 'scp_High' }
            ]
        },
        required: true,
        colSpan: 4
    },
    {
        key: 'fotos',
        labelKey: 'f_fotos',
        controlType: FILE,
        options: {
            acceptTypes: 'image/*',
            multiple: true,
            maxFiles: 3,
            outputFormat: 'object'
        },
        colSpan: 4
    }
];
