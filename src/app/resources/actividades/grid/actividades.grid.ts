import { GridDef } from "@fwk/model/component-def/grid-def";
import { FILTER_TYPE } from "@fwk/services/filter-service/filter.service";

export const ACTIVIDADES_GRID_DEF: GridDef = {
    columnsDef: [
        { columnDef: 'activityCode', columnNameKey: 'cl_codigo', id: true },
        { columnDef: 'fecha', columnNameKey: 'cl_fecha' },
        { columnDef: 'resolucion', columnNameKey: 'cl_resolucion' },
        { columnDef: 'horaInicio', columnNameKey: 'cl_hora_inicio' },
        { columnDef: 'horaFin', columnNameKey: 'cl_hora_fin' },
        { columnDef: 'empleadoAsignado', columnNameKey: 'cl_empleado' },
        { columnDef: 'estado', columnNameKey: 'cl_estado' },
        { columnDef: 'valoracion', columnNameKey: 'cl_valoracion' },
    ],
    displayedColumns: ['activityCode', 'fecha', 'resolucion', 'horaInicio', 'horaFin', 'empleadoAsignado', 'valoracion'],
    actions: [
        {
            actionNameKey: 'action_descargar_informe',
            actionType: 'file_download',
            icon: 'heroicons_outline:arrow-down-tray',
            fileName: 'Informe_Actividad_{{activityCode}}.pdf',
            ws: {
                key: 'data',
                url: 'http://premec.ddns.net:48080/ws-rest/descargarreporte',
                method: 'GET',
                querystring: { idActividad: 'activityCode' },
            },
        }
    ],
    displayedActionsCondition: [
        {
            key: 'action_descargar_informe',
            expression: { key: 'estado', compare: FILTER_TYPE.EQUALS, value: 'Enviado' }
        }
    ],
    groupActions: false,
    sortAllColumns: true,
};
