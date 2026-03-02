import { InjectionToken } from '@angular/core';
import { CrudModuleDefinition } from 'app/core/registries/crud.registry';
import { NavigationGroup } from './navigation.types';

export const FWK_CRUD_MODULES_LOADER = new InjectionToken<() => Promise<CrudModuleDefinition[]>>('FWK_CRUD_MODULES_LOADER');
export const FWK_NAVIGATION_GROUPS = new InjectionToken<NavigationGroup[]>('FWK_NAVIGATION_GROUPS');