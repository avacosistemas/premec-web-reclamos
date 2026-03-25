import { DynamicField, TEXTBOX, TEXTAREA, FILE } from "@fwk/model/dynamic-form/dynamic-field";

export const RECLAMOS_READ_FORM_FIELDS_DEF: DynamicField<any>[] = [
    {
        key: 'serviceCallID',
        labelKey: 'fl_numero',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 2
    },
    {
        key: 'estadoReclamo',
        labelKey: 'cl_estado',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 2
    },
    {
        key: 'internalSN',
        labelKey: 'f_maquina',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 4
    },
    {
        key: 'asunto',
        labelKey: 'f_asunto',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 4
    },
    {
        key: 'descripcion',
        labelKey: 'f_detalle',
        controlType: TEXTAREA,
        disabled: true,
        colSpan: 4
    },
    {
        key: 'comentario',
        labelKey: 'f_comentario',
        controlType: TEXTAREA,
        disabled: true,
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
        disabled: true,
        colSpan: 4
    }
];
