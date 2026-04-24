import { inject, Injectable } from '@angular/core';
import { from, Observable, ReplaySubject, of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { FuseNavigationItem, FuseNavigationService } from '@fuse/components/navigation';
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
    private router = inject(Router);
    private _fuseNavigationService = inject(FuseNavigationService);

    private _allCrudDefs: CrudDef[] = [];
    private _currentNavigation: Navigation | null = null;
    private _routerSubscription: any;

    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    get allCrudDefs(): CrudDef[] {
        return this._allCrudDefs;
    }

    get(): Observable<Navigation> {
        if (!this._routerSubscription) {
            this._routerSubscription = this.router.events.pipe(
                filter(event => event instanceof NavigationEnd)
            ).subscribe(() => {
                this._updateActiveItemId();
            });
        }

        return from(this.buildDynamicNavigation()).pipe(
            switchMap(dynamicDefaultNav => {
                const navigationData: Navigation = {
                    compact: [],
                    default: dynamicDefaultNav,
                    futuristic: [],
                    horizontal: [],
                };
                this._currentNavigation = navigationData;
                this._updateActiveItemId();
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
        this._allCrudDefs = crudDefs;

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

    private _updateActiveItemId() {
        if (!this._currentNavigation) return;

        const url = this.router.url;
        const urlWithoutParams = url.split('?')[0].split('#')[0];

        const activeNavDef = this._allCrudDefs
            .map(d => d.navigation)
            .filter(n => !!n)
            .find(n => {
                if (!n.url) return false;
                const navUrlWithoutParams = n.url.split('?')[0].split('#')[0];
                return urlWithoutParams === navUrlWithoutParams || urlWithoutParams.startsWith(navUrlWithoutParams + '/');
            });

        this._resetActiveForced(this._currentNavigation.default);
        this._resetActiveForced(this._currentNavigation.compact);
        this._resetActiveForced(this._currentNavigation.futuristic);
        this._resetActiveForced(this._currentNavigation.horizontal);

        if (activeNavDef?.activeItemId) {
            this._setActiveById(this._currentNavigation.default, activeNavDef.activeItemId);
            this._setActiveById(this._currentNavigation.compact, activeNavDef.activeItemId);
            this._setActiveById(this._currentNavigation.futuristic, activeNavDef.activeItemId);
            this._setActiveById(this._currentNavigation.horizontal, activeNavDef.activeItemId);
        }

        this._navigation.next({
            default: [...(this._currentNavigation.default || [])],
            compact: [...(this._currentNavigation.compact || [])],
            futuristic: [...(this._currentNavigation.futuristic || [])],
            horizontal: [...(this._currentNavigation.horizontal || [])]
        });

    this._refreshFuseNavigation();
    }

    public getCrudDefByUrl(url: string): CrudDef | undefined {
        const urlWithoutParams = url.split('?')[0].split('#')[0].toLowerCase();
        
        const matches = this._allCrudDefs.filter(d => {
            if (!d.navigation?.url) return false;
            const navUrlWithoutParams = d.navigation.url.split('?')[0].split('#')[0].toLowerCase();
            return urlWithoutParams === navUrlWithoutParams || urlWithoutParams.startsWith(navUrlWithoutParams + '/');
        });

        if (matches.length === 0) return undefined;

        return matches.reduce((prev, curr) => {
            const prevUrl = prev.navigation?.url || '';
            const currUrl = curr.navigation?.url || '';
            return currUrl.length > prevUrl.length ? curr : prev;
        });
    }

    public getNavigationItemByUrl(url: string, items?: FuseNavigationItem[]): FuseNavigationItem | undefined {
        const navigationItems = items || this._currentNavigation?.default || [];
        const urlWithoutParams = url.split('?')[0].toLowerCase();

        for (const item of navigationItems) {
            if (item.link) {
                const itemLink = item.link.split('?')[0].toLowerCase();
                if (itemLink === urlWithoutParams) {
                    return item;
                }
            }
            if (item.children) {
                const found = this.getNavigationItemByUrl(url, item.children);
                if (found) return found;
            }
        }
        return undefined;
    }

    private _refreshFuseNavigation() {
        ['mainNavigation', 'default', 'compact', 'futuristic', 'horizontal'].forEach(name => {
            const component = this._fuseNavigationService.getComponent<any>(name);
            if (component && typeof component.refresh === 'function') {
                component.refresh();
            }
        });
    }

    private _resetActiveForced(items: FuseNavigationItem[]) {
        items.forEach(item => {
            item.active = false;
            if (item.children) {
                this._resetActiveForced(item.children);
            }
        });
    }

    private _setActiveById(items: FuseNavigationItem[], id: string) {
        items.forEach(item => {
            if (item.id === id) {
                item.active = true;
            }
            if (item.children) {
                this._setActiveById(item.children, id);
            }
        });
    }
}