import { DynamicField, AUTOCOMPLETE, AUTOCOMPLETE_DESPLEGABLE, SELECT, TEXTBOX, TEXTAREA, FILE } from "@fwk/model/dynamic-form/dynamic-field";
import { DynamicFieldBehavior } from "@fwk/model/dynamic-form/dynamic-field-behavior";
import { CONDITION_COMPARE } from "@fwk/model/dynamic-form/dynamic-field-condition-if";
import { PREFIX_DOMAIN_API } from "environments/environment";

export const RECLAMOS_CREATE_FORM_FIELDS_DEF: DynamicField<any>[] = [
    {
        key: 'maquina',
        labelKey: 'f_maquina',
        controlType: AUTOCOMPLETE,
        options: {
            fromWs: {
                key: 'customer_equipment',
                url: PREFIX_DOMAIN_API + 'customer/equipment'
            },
            elementLabel: 'label',
            elementValue: 'internalSerialNum',
            minTermLength: 1,
            searchOnFocus: true
        },
        required: true,
        colSpan: 4
    },
    {
        key: 'tipo',
        labelKey: 'f_tipo',
        controlType: SELECT,
        options: {
            fromWs: {
                key: 'tipo_problema',
                url: PREFIX_DOMAIN_API + 'tipoProblemaMaquina'
            },
            elementLabel: 'nombre',
            elementValue: 'id',
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
            useNativeFilter: false,
            searchOnFocus: true,
        },
        apiOptions: {
            url: PREFIX_DOMAIN_API + 'problemaMaquina',
            queryString: {
                id: 'tipo',
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
        key: 'detalle',
        labelKey: 'f_detalle',
        controlType: TEXTAREA,
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
            maxFiles: 3
        },
        colSpan: 4
    }
];

export const RECLAMOS_CREATE_BEHAVIOR_DEF: DynamicFieldBehavior[] = [
    {
        fieldKey: 'maquina',
        condition: {
            if: [{ key: 'maquina', compare: CONDITION_COMPARE.HAS_VALUE }],
            then: [
                { key: 'tipo', disabled: false } as any
            ],
            else: [
                { key: 'tipo', disabled: true, value: null } as any
            ]
        }
    },
    {
        fieldKey: 'tipo',
        condition: {
            if: [{ key: 'tipo', compare: CONDITION_COMPARE.HAS_VALUE }],
            then: [
                { key: 'subtipo', disabled: false, value: null } as any
            ],
            else: [
                { key: 'subtipo', disabled: true, value: null } as any
            ]
        }
    }
];
