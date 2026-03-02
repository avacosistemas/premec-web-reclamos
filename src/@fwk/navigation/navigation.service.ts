import { inject, Injectable } from '@angular/core';
import { from, Observable, ReplaySubject, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { CrudDef } from '@fwk/model/component-def/crud-def';
import { Navigation, NavigationGroup } from './navigation.types';
import { FWK_CRUD_MODULES_LOADER, FWK_NAVIGATION_GROUPS } from './navigation.tokens';
import { AbstractAuthService } from '@fwk/auth/abstract-auth.service';

interface ExtendedNavigationItem extends FuseNavigationItem {
    order?: number;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    private crudModulesLoader = inject(FWK_CRUD_MODULES_LOADER);
    private navigationGroups = inject(FWK_NAVIGATION_GROUPS);
    private authService = inject(AbstractAuthService);

    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    get(): Observable<Navigation> {
        return from(this.buildDynamicNavigation()).pipe(
            switchMap(dynamicDefaultNav => {
                const navigationData: Navigation = {
                    compact: [],
                    default: dynamicDefaultNav,
                    futuristic: [],
                    horizontal: [],
                };
                return of(navigationData);
            }),
            tap((navigation) => {
                this._navigation.next(navigation);
            }),
        );
    }

    private async loadAllCrudDefs(): Promise<CrudDef[]> {
        const crudModules = await this.crudModulesLoader();
        const loaderPromises = crudModules.map(moduleDef => moduleDef.loader());
        const loadedModules = await Promise.all(loaderPromises);

        return loadedModules.map(module => {
            const defKey = Object.keys(module).find(key => key.endsWith('_DEF'));
            return defKey ? module[defKey] : null;
        }).filter(Boolean) as CrudDef[];
    }

    private sortNavigationItems = (a: ExtendedNavigationItem, b: ExtendedNavigationItem): number => {
        if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
        }
        if (a.order !== undefined && b.order === undefined) {
            return -1;
        }
        if (b.order !== undefined && a.order === undefined) {
            return 1;
        }

        const typeWeights = {
            'group': 1,
            'collapsable': 2,
            'basic': 3
        };

        const aWeight = typeWeights[a.type] || 10;
        const bWeight = typeWeights[b.type] || 10;

        if (aWeight !== bWeight) {
            return aWeight - bWeight;
        }

        return (a.title || '').localeCompare(b.title || '');
    };

    private async buildDynamicNavigation(): Promise<FuseNavigationItem[]> {
        const crudDefs = await this.loadAllCrudDefs();

        const menuGeneralGroup: ExtendedNavigationItem = {
            id: 'menu-general',
            title: 'Menú General',
            type: 'group',
            children: [],
            order: 0
        };

        const collapsibleMenus = new Map<string, ExtendedNavigationItem>();
        
          this.navigationGroups.forEach((groupDef: NavigationGroup) => {
            collapsibleMenus.set(groupDef.id, {
                id: groupDef.id,
                title: groupDef.title,
                type: groupDef.type || 'collapsable', 
                icon: groupDef.icon,
                children: [],
                order: (groupDef as any).order 
            });
        });

        crudDefs.forEach(def => {
            const navDef = def.navigation;
            const readPermission = def.security?.readAccess;

            if (!this.authService.hasPermission(readPermission) || !navDef || navDef.showInMenu === false) {
                return;
            }

            let translatedTitle = navDef.translateKey;
            if (def.i18n && navDef.translateKey) {
                const dictionary = def.i18n.words || def.i18n.dictionary;
                if (dictionary && dictionary[navDef.translateKey]) {
                    translatedTitle = dictionary[navDef.translateKey];
                }
            }

            const navItem: ExtendedNavigationItem = {
                id: navDef.id,
                title: translatedTitle,
                type: 'basic',
                icon: navDef.icon,
                link: navDef.url,
                order: navDef.order
            };

            if (navDef.group) {
                const groupParts = navDef.group.split('.');
                const rootGroupId = groupParts[0];
                let parentMenu = collapsibleMenus.get(rootGroupId);

                if (!parentMenu) {
                    console.warn(`[NavigationService] Grupo '${rootGroupId}' no encontrado para ${navDef.id}.`);
                    menuGeneralGroup.children?.push(navItem);
                    return;
                }

                for (let i = 1; i < groupParts.length; i++) {
                    const subGroupId = groupParts.slice(0, i + 1).join('.');
                    let subGroup = parentMenu.children?.find(child => child.id === subGroupId);
                    if (!subGroup) {
                        subGroup = {
                            id: subGroupId,
                            title: groupParts[i].charAt(0).toUpperCase() + groupParts[i].slice(1),
                            type: 'collapsable',
                            children: []
                        };
                        parentMenu.children?.push(subGroup);
                    }
                    parentMenu = subGroup as ExtendedNavigationItem;
                }
                parentMenu.children?.push(navItem);

            } else {
                menuGeneralGroup.children?.push(navItem);
            }
        });

        const rootItems: ExtendedNavigationItem[] = [];

        collapsibleMenus.forEach(menu => {
            if (menu.children && menu.children.length > 0) {
                menu.children.sort(this.sortNavigationItems);
                rootItems.push(menu);
            }
        });

        if (menuGeneralGroup.children && menuGeneralGroup.children.length > 0) {
            menuGeneralGroup.children.sort(this.sortNavigationItems);
            rootItems.push(menuGeneralGroup);
        }

        rootItems.sort(this.sortNavigationItems);

        return rootItems;
    }
}