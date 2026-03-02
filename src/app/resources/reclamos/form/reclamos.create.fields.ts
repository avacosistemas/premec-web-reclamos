import { DynamicField, AUTOCOMPLETE, SELECT, TEXTBOX, TEXTAREA, FILE } from "@fwk/model/dynamic-form/dynamic-field";
import { DynamicFieldBehavior } from "@fwk/model/dynamic-form/dynamic-field-behavior";
import { CONDITION_COMPARE } from "@fwk/model/dynamic-form/dynamic-field-condition-if";
import { MAQUINAS_MOCK_DATA, TIPO_PROBLEMA_MOCK_DATA, PROBLEMA_MOCK_DATA } from "../api-mock/reclamos.mock";

export const RECLAMOS_CREATE_FORM_FIELDS_DEF: DynamicField<any>[] = [
    {
        key: 'maquina',
        labelKey: 'f_maquina',
        controlType: AUTOCOMPLETE,
        options: {
            fromData: MAQUINAS_MOCK_DATA,
            elementLabel: 'name',
            elementValue: 'id',
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
            fromData: TIPO_PROBLEMA_MOCK_DATA,
            elementLabel: 'name',
            elementValue: 'id'
        },
        required: true,
        colSpan: 2,
        disabled: true // Se habilita por comportamiento
    },
    {
        key: 'subtipo',
        labelKey: 'f_subtipo',
        controlType: SELECT,
        options: {
            fromData: PROBLEMA_MOCK_DATA,
            elementLabel: 'name',
            elementValue: 'id'
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
                { key: 'subtipo', disabled: false } as any
            ],
            else: [
                { key: 'subtipo', disabled: true, value: null } as any
            ]
        }
    }
];
