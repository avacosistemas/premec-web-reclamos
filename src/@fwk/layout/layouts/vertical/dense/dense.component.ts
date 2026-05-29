import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { Observable, Subject, takeUntil, of, tap } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from '@fwk/navigation/navigation.types';
import { NavigationService } from '@fwk/navigation/navigation.service';
import { User } from '@fwk/auth/user.types';
import { UserService } from '@fwk/auth/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UserComponent } from '../../../common/user/user.component';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { environment, PREFIX_DOMAIN_API } from 'environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchButtonComponent } from '../../../common/search-button/search-button.component';
import { LogoComponent } from '@fwk/components/logo/logo.component';
import { FWK_CONFIG } from '@fwk/model/fwk-config';

import { GenericHttpService } from '@fwk/services/generic-http-service/generic-http.service';
import { ActionDefService } from '@fwk/services/action-def-service/action-def.service';
import { AuthService } from '@fwk/auth/auth.service';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@fwk/services/dialog-service/dialog.service';
import { loadCrudDefByPath } from 'app/core/registries/crud.registry';
import { BasicModalComponent } from '@fwk/components/crud/basic-modal/basic-modal.component';
import { I18n } from '@fwk/model/i18n';
import { ClusterContextService } from '@fwk/services/cluster-context.service';
import { NotificationService } from '@fwk/services/notification/notification.service';

@Component({
    selector: 'dense-layout',
    templateUrl: './dense.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        FuseLoadingBarComponent,
        FuseVerticalNavigationComponent,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        UserComponent,
        MatTooltipModule,
        SearchButtonComponent,
        LogoComponent
    ],
})
export class DenseLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall?: boolean;
    navigation?: Navigation;
    navigationAppearance: 'default' | 'dense' = 'default';
    user$?: Observable<User>;
    isDevMode: boolean = !environment.production;
    showCollapseSidebarIcon: boolean = true;
    sidebarOpened: boolean = true;

    showClusterSidebar: boolean = false;
    clusterCollapsed: boolean = false;
    currentIdContact: string | null = null;
    currentParentTitle: string | null = null;
    activePath: string = '';
    contactData: any = null;
    clusterConfig: any = null;
    clusterItems: any[] = [];
    clusterActions: any[] = [];
    clusterActionsConditions: any[] = [];

    private cdr = inject(ChangeDetectorRef);

    private _fwkConfig = inject(FWK_CONFIG);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    private _genericHttpService = inject(GenericHttpService);
    private _actionDefService = inject(ActionDefService);
    private _authService = inject(AuthService);
    private _i18nService = inject(I18nService);
    private _dialog = inject(MatDialog);
    private _dialogService = inject(DialogService);
    private _clusterContextService = inject(ClusterContextService);
    private _notificationService = inject(NotificationService);

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    ) {
    }

    ngOnInit(): void {
        this.showCollapseSidebarIcon = this._fwkConfig.showCollapseSidebarIcon !== false;
        this.sidebarOpened = this._fwkConfig.sidebarOpened !== false;
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        this.user$ = this._userService.user$;

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._updateClusterState();
            });

        this._updateClusterState();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    get currentYear(): number {
        return new Date().getFullYear();
    }

    toggleNavigation(name: string): void {
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);
        if (navigation) {
            navigation.toggle();
        }
    }

    toggleNavigationAppearance(): void {
        this.navigationAppearance = this.navigationAppearance === 'default' ? 'dense' : 'default';
    }

    private _updateClusterState(): void {
        const urlTree = this._router.parseUrl(this._router.url);
        const queryParams = urlTree.queryParams;
        
        const newIdContact = queryParams['idContact'] || null;
        this.currentParentTitle = queryParams['parentTitle'] || null;

        const primarySegment = urlTree.root.children['primary'];
        if (primarySegment && primarySegment.segments.length > 0) {
            this.activePath = primarySegment.segments[0].path;
        } else {
            this.activePath = '';
        }

        if (newIdContact) {
            loadCrudDefByPath('perfilIdentificacion').then(parentDef => {
                if (parentDef && parentDef.clusterConfig) {
                    this.clusterConfig = parentDef.clusterConfig;
                    const actionsItems = parentDef.clusterConfig.actionsItems || [];
                    if (actionsItems.length > 0) {
                        this.clusterItems = actionsItems.filter((item: any) => item.displayType === 'menu' || item.displayType === 'sidebar');
                        this.clusterActions = actionsItems.filter((item: any) => item.displayType === 'action');
                    } else {
                        this.clusterItems = parentDef.clusterConfig.navigationItems || [];
                        this.clusterActions = parentDef.clusterConfig.actions || [];
                    }
                    this.clusterActionsConditions = parentDef.clusterConfig.displayedActionsCondition || [];

                    const isClusterPath = this.clusterItems.some(item =>
                        item.path === this.activePath || (!item.path && this.activePath === 'perfilIdentificacion')
                    );
                    this.showClusterSidebar = !!isClusterPath;
                    this._clusterContextService.setClusterActive(this.showClusterSidebar);

                    if (this.showClusterSidebar) {
                        if (this.currentIdContact !== newIdContact) {
                            this.currentIdContact = newIdContact;
                            this._loadContactData();
                        }
                    } else {
                        this.currentIdContact = null;
                        this.contactData = null;
                    }
                    this.cdr.markForCheck();
                }
            }).catch(err => {
                console.error('[DenseLayout] Error loading dynamic cluster config:', err);
            });
        } else {
            this.showClusterSidebar = false;
            this.currentIdContact = null;
            this.contactData = null;
            this._clusterContextService.setClusterActive(false);
            this.cdr.markForCheck();
        }
    }

    private _loadContactData(): void {
        if (!this.currentIdContact) return;

        const url = PREFIX_DOMAIN_API + 'admin/personas';
        this._genericHttpService.basicGet(url, { idContact: this.currentIdContact }, null, { idContact: 'idContact' })
            .subscribe({
                next: (res) => {
                    const array = Array.isArray(res) ? res : [res];
                    if (array.length > 0) {
                        this.contactData = array[0];
                        if (this.contactData.apellido) {
                            this.currentParentTitle = this.contactData.apellido;
                        }
                    }
                },
                error: (err) => console.error('[DenseLayout] Error loading contact data:', err)
            });
    }

    navigateTo(item: any): void {
        const queryParams: any = {
            idContact: this.currentIdContact,
            parentTitle: this.currentParentTitle
        };
        if (item.actionNameKey !== 'cluster_details_title' && (item.form || item.actionType || item.ws)) {
            queryParams.action = item.actionNameKey;
        }
        const targetPath = item.path || 'perfilIdentificacion';
        this._router.navigate([targetPath], {
            queryParams: queryParams
        });
    }

    isItemActive(item: any): boolean {
        const urlTree = this._router.parseUrl(this._router.url);
        const queryAction = urlTree.queryParams['action'];
        const targetPath = item.path || 'perfilIdentificacion';
        
        const isActionItem = !!(item.form || item.actionType || item.ws);

        if (queryAction) {
            return isActionItem && queryAction === item.actionNameKey;
        } else {
            if (isActionItem) {
                return false;
            }
            if (item.actionNameKey === 'cluster_details_title') {
                return this.activePath === 'perfilIdentificacion';
            }
            return this.activePath === targetPath;
        }
    }

    toggleClusterCollapse(): void {
        this.clusterCollapsed = !this.clusterCollapsed;
    }

    translate(key: string): string {
        if (!key) return '';
        return this._i18nService.translate(key);
    }

    private _prepareAction(action: any): any {
        const cloned = JSON.parse(JSON.stringify(action));
        
        if (cloned.actionNameKey) {
            cloned.actionName = this._i18nService.translate(cloned.actionNameKey);
        }
        
        if (cloned.confirm) {
            if (typeof cloned.confirm === 'object') {
                if (cloned.confirm.messageKey) {
                    const trans = this._i18nService.translate(cloned.confirm.messageKey);
                    cloned.confirm.message = trans !== cloned.confirm.messageKey ? trans : (cloned.confirm.message || '¿Está seguro de que desea realizar esta operación?');
                }
            } else if (cloned.confirm === true) {
                const confirmKey = cloned.confirmMessageKey || cloned.confirmMessage;
                let transMsg = '¿Está seguro de que desea realizar esta operación?';
                if (confirmKey) {
                    const trans = this._i18nService.translate(confirmKey);
                    transMsg = trans !== confirmKey ? trans : (cloned.confirmMessage || transMsg);
                }
                cloned.confirm = {
                    message: transMsg
                };
            }
        }
        
        if (cloned.form) {
            cloned.form.forEach((field: any) => {
                if (field.labelKey) {
                    field.label = this._i18nService.translate(field.labelKey);
                }
            });
        }
        
        return cloned;
    }

    get activeSidebarItems(): any[] {
        if (!this.clusterConfig) return [];
        const items = this.clusterItems || [];
        
        return items.filter(item => {
            if (item.actionSecurity && !this._authService.hasPermission(item.actionSecurity)) {
                return false;
            }
            if (this.contactData) {
                const cond = (this.clusterActionsConditions || []).find(c => c.key === item.actionNameKey);
                if (cond && cond.expression) {
                    const expr = cond.expression;
                    const valueToCompare = this.contactData[expr.key];
                    return valueToCompare === expr.value;
                }
            }
            return true;
        });
    }

    get activeProfileActions(): any[] {
        if (!this.contactData || !this.clusterConfig) return [];
        
        const actions = this.clusterActions || [];
        
        return actions.filter(action => {
            if (action.actionSecurity && !this._authService.hasPermission(action.actionSecurity)) {
                return false;
            }
            
            const cond = (this.clusterActionsConditions || []).find(c => c.key === action.actionNameKey);
            if (cond && cond.expression) {
                const expr = cond.expression;
                const valueToCompare = this.contactData[expr.key];
                return valueToCompare === expr.value;
            }
            
            return true;
        });
    }

    executeAction(action: any): void {
        if (!this.contactData) return;

        const preparedAction = this._prepareAction(action);
        const row = { ...this.contactData };
        
        const idKey = 'idContact';
        row.id = row[idKey];

        const i18nObj = this._i18nService.getDictionary('perfil_identificacion_i18n_def') || 
                        this._i18nService.getDictionary('fwk') || 
                        new I18n();

        if (preparedAction.form || preparedAction.formDef) {
            const data = {
                entity: row,
                config: preparedAction,
                formDef: preparedAction.formDef,
                fields: preparedAction.form || preparedAction.formDef?.fields,
                i18n: i18nObj
            };

            const dialogRef = this._dialog.open(BasicModalComponent, {
                width: '600px',
                maxWidth: '95vw',
                panelClass: 'control-mat-dialog',
                data: data
            });

            dialogRef.afterClosed().subscribe(() => {
                this._loadContactData();
            });
        } else {
            this._actionDefService.submitAction(preparedAction, row, i18nObj, undefined)
                .subscribe({
                    next: (res) => {
                        if (res === null) {
                            return;
                        }
                        if (res && res.hasOwnProperty('ok') && !res.ok) {
                            const errorMsg = preparedAction.ws?.messageError || res.error?.message || 'Error al intentar realizar la acción.';
                            this._notificationService.notifyError(errorMsg);
                            return;
                        }
                        const successMsg = preparedAction.ws?.messageSuccess || this.translate('success_message') || 'Acción ejecutada con éxito.';
                        this._notificationService.notifySuccess(successMsg);
                        const redirectPath = preparedAction.redirectToSuccess || preparedAction.redirectTo;
                        if (redirectPath) {
                            this._router.navigateByUrl(redirectPath);
                        } else {
                            this._loadContactData();
                        }
                    },
                    error: (err) => {
                        console.error('[DenseLayout] Error submitting action:', err);
                        const msg = preparedAction.ws?.messageError || err?.error?.message || err?.message || 'Error al intentar realizar la acción.';
                        this._notificationService.notifyError(msg);
                    }
                });
        }
    }
}