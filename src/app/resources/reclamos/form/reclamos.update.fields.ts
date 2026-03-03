import { DynamicField, TEXTBOX, TEXTAREA, FILE } from "@fwk/model/dynamic-form/dynamic-field";

export const RECLAMOS_UPDATE_FORM_FIELDS_DEF: DynamicField<any>[] = [
    {
        key: 'numero',
        labelKey: 'cl_numero',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 2
    },
    {
        key: 'estado',
        labelKey: 'cl_estado',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 2
    },
    {
        key: 'maquina',
        labelKey: 'cl_maquina',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 4
    },
    {
        key: 'asunto',
        labelKey: 'cl_asunto',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 4
    },
    {
        key: 'detalle',
        labelKey: 'cl_detalle',
        controlType: TEXTAREA,
        disabled: true,
        colSpan: 4
    },
    {
        key: 'comentario',
        labelKey: 'f_comentario',
        controlType: TEXTAREA,
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