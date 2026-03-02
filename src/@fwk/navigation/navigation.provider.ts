import { EnvironmentProviders, Provider } from '@angular/core';
import { FWK_CRUD_MODULES_LOADER, FWK_NAVIGATION_GROUPS } from '@fwk/navigation/navigation.tokens';
import { CRUD_MODULES } from 'app/core/registries/crud.registry';
import { NAVIGATION_GROUPS_MAP } from 'app/resources/navigation.groups';

export const provideAppNavigation = (): Array<Provider | EnvironmentProviders> =>
{
    return [
        {
            provide: FWK_CRUD_MODULES_LOADER,
            useValue: () => Promise.resolve(CRUD_MODULES)
        },
        {
            provide: FWK_NAVIGATION_GROUPS,
            useValue: NAVIGATION_GROUPS_MAP
        }
    ];
};