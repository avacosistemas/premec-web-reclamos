import { DynamicField, TEXTBOX, TEXTAREA } from "@fwk/model/dynamic-form/dynamic-field";

export const ACTIVIDADES_READ_FORM_FIELDS_DEF: DynamicField<any>[] = [
    {
        key: 'activityCode',
        labelKey: 'cl_codigo',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 1
    },
    {
        key: 'fecha',
        labelKey: 'cl_fecha',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 1
    },
    {
        key: 'empleadoAsignado',
        labelKey: 'cl_empleado',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 2
    },
    {
        key: 'estado',
        labelKey: 'cl_estado',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 1
    },
    {
        key: 'horaInicio',
        labelKey: 'cl_hora_inicio',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 1
    },
    {
        key: 'horaFin',
        labelKey: 'cl_hora_fin',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 1
    },
    {
        key: 'valoracion',
        labelKey: 'cl_valoracion',
        controlType: TEXTBOX,
        disabled: true,
        colSpan: 1
    },
    {
        key: 'resolucion',
        labelKey: 'cl_resolucion',
        controlType: TEXTAREA,
        disabled: true,
        colSpan: 4
    },
];
