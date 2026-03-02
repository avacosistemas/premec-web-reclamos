export const RECLAMOS_MOCK_DATA = [
    {
        id: 1,
        numero: 'REC-001',
        asunto: 'Falla en motor hidráulico',
        maquina: 'Máquina 1',
        tipo: 'Mecánico',
        subtipo: 'Hidráulica',
        fechaCreacion: '2024-02-10T10:00:00',
        fechaAsignacion: '2024-02-11T09:00:00',
        fechaInicio: '2024-02-12T08:30:00',
        fechaFin: null,
        estado: 'Pendiente',
        detalle: 'El motor hace un ruido extraño al operar a plena carga.',
        comentario: '',
        fotos: []
    },
    {
        id: 2,
        numero: 'REC-002',
        asunto: 'Pérdida de aceite',
        maquina: 'Máquina 2',
        tipo: 'Mecánico',
        subtipo: 'Motor',
        fechaCreacion: '2024-02-15T14:30:00',
        fechaAsignacion: '2024-02-16T10:00:00',
        fechaInicio: null,
        fechaFin: null,
        estado: 'Asignado',
        detalle: 'Se observa goteo constante en el retén trasero.',
        comentario: 'Repuesto solicitado.',
        fotos: []
    },
    {
        id: 3,
        numero: 'REC-003',
        asunto: 'Error en sensor de temperatura',
        maquina: 'Máquina 3',
        tipo: 'Eléctrico',
        subtipo: 'Sensores',
        fechaCreacion: '2024-02-20T08:15:00',
        fechaAsignacion: '2024-02-20T09:00:00',
        fechaInicio: '2024-02-21T07:00:00',
        fechaFin: '2024-02-21T16:00:00',
        estado: 'Cerrado',
        detalle: 'La pantalla muestra alerta de sobrecalentamiento errónea.',
        comentario: 'Sensor reemplazado.',
        fotos: []
    }
];

export const MAQUINAS_MOCK_DATA = [
    { id: 101, name: 'Máquina 1', tipoMaquina: 'Tipo 1' },
    { id: 102, name: 'Máquina 2', tipoMaquina: 'Tipo 2' },
    { id: 103, name: 'Máquina 3', tipoMaquina: 'Tipo 3' },
    { id: 104, name: 'Máquina 4', tipoMaquina: 'Tipo 4' },
    { id: 105, name: 'Máquina 5', tipoMaquina: 'Tipo 5' },
    { id: 106, name: 'Máquina 6', tipoMaquina: 'Tipo 6' },
    { id: 107, name: 'Máquina 7', tipoMaquina: 'Tipo 7' },
    { id: 108, name: 'Máquina 8', tipoMaquina: 'Tipo 8' },
    { id: 109, name: 'Máquina 9', tipoMaquina: 'Tipo 9' },
    { id: 110, name: 'Máquina 10', tipoMaquina: 'Tipo 10' }
];

export const TIPO_PROBLEMA_MOCK_DATA = [
    { id: 1, name: 'Mecánico', tipoMaquina: 'Tipo 1' },
    { id: 2, name: 'Eléctrico', tipoMaquina: 'Tipo 2' },
    { id: 3, name: 'Hidráulico', tipoMaquina: 'Tipo 3' },
    { id: 4, name: 'Motor', tipoMaquina: 'Tipo 4' }
];

export const PROBLEMA_MOCK_DATA = [
    { id: 11, name: 'Bomba', parentId: 1 },
    { id: 12, name: 'Cilindro', parentId: 1 },
    { id: 21, name: 'Sensor', parentId: 2 },
    { id: 31, name: 'Fuga', parentId: 3 }
];

