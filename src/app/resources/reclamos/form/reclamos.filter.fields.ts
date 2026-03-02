import { DynamicField, SELECT, AUTOCOMPLETE, NUMBER, DATEPICKER } from "@fwk/model/dynamic-form/dynamic-field";
import { MAQUINAS_MOCK_DATA } from "../api-mock/reclamos.mock";

export const RECLAMOS_FILTER_FORM_FIELDS_DEF: DynamicField<any>[] = [
    {
        key: 'numero',
        labelKey: 'fl_numero',
        controlType: NUMBER,
        colSpan: 1
    },
    {
        key: 'maquina',
        labelKey: 'fl_maquina',
        controlType: AUTOCOMPLETE,
        options: {
            fromData: MAQUINAS_MOCK_DATA,
            elementLabel: 'name',
            elementValue: 'name'
        },
        colSpan: 1
    },
    {
        key: 'fechaDesde',
        labelKey: 'fl_desde',
        controlType: DATEPICKER,
        colSpan: 1
    },
    {
        key: 'fechaHasta',
        labelKey: 'fl_hasta',
        controlType: DATEPICKER,
        colSpan: 1
    },
    {
        key: 'tipoFecha',
        labelKey: 'fl_tipo_fecha',
        controlType: SELECT,
        options: {
            fromData: [
                { id: 'creacion', name: 'Creación' },
                { id: 'asignacion', name: 'Asignación' },
                { id: 'inicio', name: 'Inicio' },
                { id: 'fin', name: 'Fin' }
            ],
            elementLabel: 'name',
            elementValue: 'id'
        },
        colSpan: 1
    }
];
