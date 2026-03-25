import { DynamicFieldBehavior } from "@fwk/model/dynamic-form/dynamic-field-behavior";
import { CONDITION_COMPARE } from "@fwk/model/dynamic-form/dynamic-field-condition-if";
import { PREFIX_DOMAIN_API } from "environments/environment";

export const RECLAMOS_CREATE_BEHAVIOR_DEF: DynamicFieldBehavior[] = [
    {
        fieldKey: 'maquina',
        condition: {
            if: [{ key: 'maquina', compare: CONDITION_COMPARE.HAS_VALUE }],
            then: [
                {
                    key: 'maquina', validationWs: {
                        url: PREFIX_DOMAIN_API + 'customer/equipment/validate',
                        param: 'internalSerialNum',
                        valueProperty: 'InternalSerialNum',
                        assignResultToField: 'maquina_valida',
                        showModalOnFail: true,
                        errorMessage: 'La máquina seleccionada no es válida para generar reclamos'
                    }
                } as any
            ],
            else: [
                { key: 'tipo', disabled: true, value: null } as any,
                { key: 'maquina_tipo', value: null } as any,
                { key: 'maquina_valida', value: null } as any,
                { key: 'asunto', disabled: true, value: null } as any,
                { key: 'descripcion', disabled: true, value: null } as any,
                { key: 'equipmentCardNum', value: null } as any,
                { key: 'internalSerialNum', value: null } as any,
                { key: 'itemCode', value: null } as any,
                { key: 'manufacturerSerialNum', value: null } as any
            ]
        }
    },
    {
        fieldKey: 'maquina_valida',
        condition: {
            if: [
                { key: 'maquina_valida', compare: CONDITION_COMPARE.EQUALS, value: true },
                { key: 'maquina_tipo', compare: CONDITION_COMPARE.EQUALS, value: 'SIN_TIPO' }
            ],
            then: [
                {
                    key: 'maquina',
                    showErrorMsg: 'No es posible determinar el tipo de máquina seleccionada. Por favor, póngase en contacto con Premec'
                } as any,
                { key: 'tipo', disabled: true, value: null } as any,
                { key: 'subtipo', disabled: true, value: null } as any,
                { key: 'asunto', disabled: true, value: null } as any,
                { key: 'descripcion', disabled: true, value: null } as any
            ]
        }
    },
    {
        fieldKey: 'maquina_valida',
        condition: {
            if: [
                { key: 'maquina_valida', compare: CONDITION_COMPARE.EQUALS, value: true },
                { key: 'maquina_tipo', compare: 'NOTEQUALS', value: 'SIN_TIPO' }
            ],
            then: [
                { key: 'tipo', disabled: false } as any,
                { key: 'asunto', disabled: false } as any,
                { key: 'descripcion', disabled: false } as any
            ],
            else: [
                { key: 'tipo', disabled: true, value: null } as any,
                { key: 'asunto', disabled: true, value: null } as any,
                { key: 'descripcion', disabled: true, value: null } as any
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
                { key: 'subtipo', disabled: true, value: null } as any,
                { key: 'idTipoProblema', value: null } as any
            ]
        }
    },
    {
        fieldKey: 'prioridad',
        condition: {
            if: [
                {
                    key: 'prioridad',
                    compare: CONDITION_COMPARE.EQUALS,
                    value: 'scp_Low'
                }
            ],
            then: [
                {
                    key: 'feedback_prioridad',
                    controlType: 'alert',
                    label: 'Te asistiremos en la proxima semana.',
                    options: { type: 'info' },
                    showModal: {
                        message: 'Te asistiremos en la proxima semana.',
                        buttonLabel: 'Entendido'
                    }
                } as any
            ]
        }
    },
    {
        fieldKey: 'prioridad',
        condition: {
            if: [
                {
                    key: 'prioridad',
                    compare: CONDITION_COMPARE.EQUALS,
                    value: 'scp_High'
                }
            ],
            then: [
                {
                    key: 'feedback_prioridad',
                    controlType: 'alert',
                    label: 'Atenderemos tu reclamo en las proximas 48 hs.',
                    options: { type: 'info' },
                    showModal: {
                        message: 'Atenderemos tu reclamo en las proximas 48 hs.',
                        buttonLabel: 'Entendido'
                    }
                } as any
            ]
        }
    }
];
