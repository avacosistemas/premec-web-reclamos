import { GridDef } from "@fwk/model/component-def/grid-def";
import { RECLAMOS_UPDATE_FORM_FIELDS_DEF } from "../form/reclamos.update.fields";
import { FILTER_TYPE } from "@fwk/services/filter-service/filter.service";

export const RECLAMOS_GRID_DEF: GridDef = {
    columnsDef: [
        { columnDef: 'serviceCallID', columnNameKey: 'cl_numero', id: true },
        {
            columnDef: 'estadoReclamo',
            columnNameKey: 'cl_estado',
            cellRender: (row: any) => {
                const status = row.estadoReclamo || 'Pendiente';
                let colorClasses = '';
                switch (status) {
                    case 'Pendiente':
                    case 'Abierto': colorClasses = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500'; break;
                    case 'Asignado': colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500'; break;
                    case 'Iniciado':
                    case 'En Proceso': colorClasses = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-500'; break;
                    case 'Cerrado': colorClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500'; break;
                    case 'Rechazado': colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'; break;
                    default: colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500';
                }
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}">${status}</span>`;
            }
        },
        { columnDef: 'asunto', columnNameKey: 'cl_asunto' },
        { columnDef: 'internalSN', columnNameKey: 'cl_maquina' },
        { columnDef: 'fechaCreacion', columnNameKey: 'cl_fecha_creacion' },
        { columnDef: 'fechaInicioActividad', columnNameKey: 'cl_fecha_inicio' },
        { columnDef: 'fechaFinActividad', columnNameKey: 'cl_fecha_fin' },
        { columnDef: 'customerCode', columnNameKey: 'cl_customer_code' },
        { columnDef: 'estadoServiceCall', columnNameKey: 'cl_estado_service_call' },
        { columnDef: 'horaCreacion', columnNameKey: 'cl_hora_creacion' },
        { columnDef: 'equipmentCardNum', columnNameKey: 'cl_equipment_card_num' },
        { columnDef: 'manufacturerSerialNum', columnNameKey: 'cl_manufacturer_serial_num' },
        { columnDef: 'itemCode', columnNameKey: 'cl_item_code' },
        { columnDef: 'itemName', columnNameKey: 'cl_item_name' },
        { 
            columnDef: 'motivoRechazo', 
            columnNameKey: 'cl_motivo_rechazo',
            cellRender: (row: any) => row.estadoReclamo === 'Rechazado' ? (row.motivoRechazo || '-') : ''
        }
    ],

    displayedColumns: ['serviceCallID', 'estadoReclamo', 'asunto', 'internalSN', 'fechaCreacion', 'fechaInicioActividad', 'fechaFinActividad', 'motivoRechazo'],
    actions: [
        // {
        //     actionNameKey: 'action_editar',
        //     actionType: 'form_modal',
        //     icon: 'heroicons_outline:pencil-square',
        //     form: RECLAMOS_UPDATE_FORM_FIELDS_DEF
        // }
    ],
    displayedActionsCondition: [
        {
            key: 'action_editar',
            expression: { key: 'estadoReclamo', compare: FILTER_TYPE.NOTEQUALS, value: 'Cerrado' }
        }
    ],
    groupActions: false,
    sortAllColumns: true
};
