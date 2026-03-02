import { WelcomeSection } from './welcome.types';

export const WELCOME_DATA: WelcomeSection[] = [
    {
        title: 'Gestión de RRHH',
        items: [
            {
                title: 'Recibos',
                description: 'Consulta y descarga de recibos de sueldo.',
                icon: 'heroicons_outline:currency-dollar',
                route: '/recibos',
                color: 'green',
                permission: 'RECIBOS_SECURITY_READ'
            },
            {
                title: 'Procesar Recibos',
                description: 'Carga y procesamiento masivo de recibos.',
                icon: 'heroicons_outline:document-arrow-up',
                route: '/recibos-procesamiento',
                color: 'teal',
                permission: 'RECIBOS_PROCESAMIENTO_READ'
            },
            {
                title: 'Cierre de Mes',
                description: 'Gestión y control del cierre mensual.',
                icon: 'heroicons_outline:calendar-days',
                route: '/cierre-mes',
                color: 'blue',
                permission: 'CIERRE_MES_READ'
            },
            {
                title: 'Procesar Fichados',
                description: 'Importación y análisis de fichadas.',
                icon: 'heroicons_outline:clock',
                route: '/fichado-procesamiento',
                color: 'indigo',
                permission: 'FICHADO_PROCESAMIENTO_READ'
            },
            {
                title: 'Novedades Contador',
                description: 'Reporte de novedades para liquidación.',
                icon: 'heroicons_outline:calculator',
                route: '/novedades-contador',
                color: 'purple',
                permission: 'NOVEDADES_CONTADOR_READ'
            }
        ]
    },
    {
        title: 'Gestión de Actividades',
        items: [
            {
                title: 'Grupos de Actividad',
                description: 'Configuración de grupos por tipo de actividad.',
                icon: 'heroicons_outline:list-bullet',
                route: '/gruposTipoActividad',
                color: 'orange',
                permission: 'GRUPOS_TIPO_ACTIVIDAD_READ'
            },
            {
                title: 'Reporte Horas Máquina',
                description: 'Informe detallado de horas máquina.',
                icon: 'heroicons_outline:document-text',
                route: '/reporteHorasMaquina',
                color: 'cyan',
                permission: 'REPORTE_HORAS_MAQUINA_READ'
            },
            {
                title: 'Generar QR',
                description: 'Generación de códigos QR de servicio.',
                icon: 'heroicons_outline:qr-code',
                route: '/generar-qr',
                color: 'slate',
                permission: 'GENERAR_QR_READ'
            }
        ]
    },
    {
        title: 'Tableros de Gestión',
        items: [
            {
                title: 'Mis Indicadores',
                description: 'Tablero de rendimiento y objetivos mensuales.',
                icon: 'heroicons_outline:chart-bar',
                route: '/indicadores-mensuales',
                color: 'amber',
                permission: 'INDICADORES_MENSUALES_READ'
            },
            {
                title: 'Indicadores Generales',
                description: 'Vista global de indicadores y estadísticas.',
                icon: 'heroicons_outline:chart-pie',
                route: '/indicadores-mensuales-general',
                color: 'indigo',
                permission: 'INDICADORES_GENERAL_READ'
            }
        ]
    },
    {
        title: 'Seguridad y Usuarios',
        items: [
            {
                title: 'Usuarios',
                description: 'Administración de usuarios del sistema.',
                icon: 'heroicons_outline:users',
                route: '/users',
                color: 'rose',
                permission: 'USUARIOS_READ'
            },
            {
                title: 'Grupos de Seguridad',
                description: 'Definición de roles y grupos.',
                icon: 'heroicons_outline:user-group',
                route: '/seguridadgrupo',
                color: 'red',
                permission: 'SEGURIDAD_GRUPO_READ'
            },
            {
                title: 'Permisos',
                description: 'Catálogo de permisos del sistema.',
                icon: 'heroicons_outline:key',
                route: '/permiso',
                color: 'pink',
                permission: 'PERMISOS_READ'
            },
        ]
    }
];