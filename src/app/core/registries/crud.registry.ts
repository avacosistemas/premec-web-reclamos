import { CrudDef } from "@fwk/model/component-def/crud-def";

export interface CrudModuleDefinition {
    path: string;
    loader: () => Promise<any>;
}

export const CRUD_MODULES: CrudModuleDefinition[] = [
    {
        path: 'actividades',
        loader: () => import('app/resources/actividades/actividades.def')
    },
    {
        path: 'estadisticas',
        loader: () => import('app/resources/estadisticas/estadisticas.def')
    },
    {
        path: 'reclamos',
        loader: () => import('app/resources/reclamos/reclamos.def')
    },
];

export async function loadAllCrudDefs(): Promise<CrudDef[]> {
    const loaderPromises = [
        import('app/resources/actividades/actividades.def'),
        import('app/resources/estadisticas/estadisticas.def'),
        import('app/resources/reclamos/reclamos.def'),
    ];
    
    const loadedModules = await Promise.all(loaderPromises);

    return loadedModules.map(module => {
        const defKey = Object.keys(module).find(key => key.endsWith('_DEF'));
        return defKey ? module[defKey] : null;
    }).filter(Boolean) as CrudDef[];
}

export async function loadCrudDefByPath(path: string): Promise<CrudDef | null> {
    const moduleDefinition = CRUD_MODULES.find(m => m.path === path);
    if (!moduleDefinition) {
        return null;
    }
    const loadedModule = await moduleDefinition.loader();
    const defKey = Object.keys(loadedModule).find(key => key.endsWith('_DEF'));
    return defKey ? loadedModule[defKey] : null;
}
