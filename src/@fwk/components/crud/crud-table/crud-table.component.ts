import { Component, OnInit, Input, ViewChild, Output, EventEmitter, Injector, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Params, RouterModule } from '@angular/router';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AbstractComponent } from '../../abstract-component.component';
import { GenericHttpService } from '../../../services/generic-http-service/generic-http.service';
import { BasicModalComponent } from '../basic-modal/basic-modal.component';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';
import { SpinnerService } from '../../../modules/spinner/service/spinner.service';
import { ACTION_TYPES, ActionDef } from '../../../model/component-def/action-def';
import { FileService } from '../../../services/file/file.service';
import { DialogService } from '../../../services/dialog-service/dialog.service';
import { GridDef } from '../../../model/component-def/grid-def';
import { ExpressionService } from '../../../services/expression-service/expression.service';
import { ActionDefService } from '../../../services/action-def-service/action-def.service';
import { DisplayActionsCondition } from '../../../model/display-actions-condition';
import { DynamicFieldConditionIf } from '../../../model/dynamic-form/dynamic-field-condition-if';
import { FilterService } from '../../../services/filter-service/filter.service';
import { ComponentDefService } from '@fwk/services/component-def-service/component-def.service';
import { TranslatePipe } from '../../../pipe/translate.pipe';
import { Row, StatusTable } from './crud-table.model';
import { AuthService } from '@fwk/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { FormService } from '@fwk/services/dynamic-form/form.service';

const ACTION_COLUMN = '_action';
const GENERAL_ACTION_COLUMN = '_general_action';

@Component({
    selector: 'fwk-crud-table',
    templateUrl: './crud-table.component.html',
    styleUrls: ['./crud-table.component.scss'],
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatTableModule, MatSortModule, MatPaginatorModule,
        MatCheckboxModule, MatButtonModule, MatIconModule, MatTooltipModule,
        MatProgressSpinnerModule, SlicePipe, TranslatePipe, MatMenuModule
    ],
    animations: [
        trigger('groupButtons', [
            state('true', style({ width: '*', opacity: 1 })),
            state('false', style({ width: '0px', opacity: 0, margin: '0px' })),
            transition('true <=> false', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrudTableComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() isLoading: boolean = false;
    @Input() crud: any;
    @Input() grid!: GridDef;
    @Input() onClickRow: any;
    @Input() urlDelete: any;
    @Input() selectable!: boolean;
    @Input() hasActiveFilters: boolean = false;
    @Input() canAdd: boolean = false;
    @Input() canDelete: boolean = false;
    @Input() containerClass: string = '';
    @Input() searchPerformed: boolean = false;

    @ViewChild('tableContainer') tableContainer!: ElementRef;

    canScrollLeft: boolean = false;
    canScrollRight: boolean = false;
    private scrollInterval: any;

    private readonly SCROLL_SPEED = 15;
    private readonly SCROLL_STEP_TIME = 20;

    public repeatSkeleton = new Array(9).fill(0);

    @Input()
    set datasource(data: any[]) {
        if (data) {
            this._datasource = new MatTableDataSource(data);
            this.wireUpDataSource();

            if (this.crud && this.crud.crudDef) {
                this.totalSize = this.crud.crudDef.serverPagination ? this.filterService.totalReg : data.length;
            } else {
                this.totalSize = data.length;
            }
            this.openActionsArray = new Array(data.length).fill(false);

            this.statustable.statusChanges.subscribe((statustable) => {
                this.status.emit(statustable);
            });

            this.rows = data.map((element, index) => {
                const isSelectable = this.isRowSelectable(element, this.grid.selectCondition);
                return new Row(element, index, false, isSelectable);
            });
            this.statustable.rows = this.rows;

            this._cdr.markForCheck();

            setTimeout(() => {
                this.checkScrollVisibility();
            }, 100);
        }
    }
    get datasource(): MatTableDataSource<any> {
        return this._datasource;
    }

    @Input()
    set tabledef(tabledef: GridDef) {
        this.grid = tabledef;
    }

    @Output() status = new EventEmitter<StatusTable<any>>();
    @Output() onChangePagination = new EventEmitter<void>();
    @Output() onAddClicked = new EventEmitter<void>();
    @Output() onClearFiltersClicked = new EventEmitter<void>();
    @Output() onRowClicked = new EventEmitter<any>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    statustable: StatusTable<any>;
    _datasource!: MatTableDataSource<any>;
    selectedRowIndex: number | null = null;
    rows: Row[] = [];
    initOk: boolean = false;
    pageSize: number;
    currentPage: number;
    totalSize = 0;
    openActionsArray: boolean[] = [];

    protected genericHttpService: GenericHttpService;
    private localStorageService: LocalStorageService;
    private spinnerService: SpinnerService;
    private spinnerGeneralControl: any;
    private fileService: FileService;
    private columnDefId: string | undefined;
    private dialogService: DialogService;
    private expressionService: ExpressionService;
    private actionDefService: ActionDefService;
    private filterService: FilterService;
    private _selects: boolean = false;
    private resetSelects: boolean = false;
    private authService: AuthService;
    private formService: FormService;

    constructor(
        public injector: Injector,
        private _cdr: ChangeDetectorRef,
    ) {
        super(injector);
        this.authService = injector.get(AuthService);
        this.genericHttpService = injector.get(GenericHttpService);
        this.localStorageService = injector.get(LocalStorageService);
        this.spinnerService = injector.get(SpinnerService);
        this.fileService = injector.get(FileService);
        this.dialogService = injector.get(DialogService);
        this.expressionService = injector.get(ExpressionService);
        this.actionDefService = injector.get(ActionDefService);
        this.componentDefService = injector.get(ComponentDefService);
        this.filterService = injector.get(FilterService);
        this.formService = injector.get(FormService);
        this.pageSize = this.crud?.crudDef?.pagination?.pageSize ?? 10;
        this.currentPage = this.crud?.crudDef?.pagination?.page ?? 0;

        this.setUpI18n({
            name: 'crud_table', lang: 'es',
            words: {
                itemsPerPageLabel: 'Items por página',
                boolean_true: 'Sí', boolean_false: 'No',
                action_delete: 'Eliminar', grid_action_button_delete: 'Eliminar',
            }
        });
        this.statustable = new StatusTable<any>();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.onInit();
    }

    ngOnDestroy(): void {
        this.stopScrolling();
        super.ngOnDestroy();
    }

    ngAfterViewInit(): void {
        if (this.paginator) {
            this.paginator._intl = new MatPaginatorIntl();
            this.paginator._intl.itemsPerPageLabel = this.translate('table_items_per_page');
        }
        this.wireUpDataSource();

        setTimeout(() => {
            this.checkScrollVisibility();
        }, 500);
    }

    checkScrollVisibility(): void {
        if (!this.tableContainer) return;
        const el = this.tableContainer.nativeElement;

        if (el.scrollWidth <= el.clientWidth) {
            this.canScrollLeft = false;
            this.canScrollRight = false;
        } else {
            this.canScrollLeft = el.scrollLeft > 0;
            this.canScrollRight = Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth;
        }

        this._cdr.markForCheck();
    }

    startScrolling(direction: 'left' | 'right'): void {
        this.stopScrolling();

        this.scrollInterval = setInterval(() => {
            if (!this.tableContainer) return;
            const el = this.tableContainer.nativeElement;

            if (direction === 'left') {
                el.scrollLeft -= this.SCROLL_SPEED;
            } else {
                el.scrollLeft += this.SCROLL_SPEED;
            }

            this.checkScrollVisibility();
        }, this.SCROLL_STEP_TIME);
    }

    stopScrolling(): void {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
    }

    onInit(): void {
        this.spinnerGeneralControl = this.spinnerService.getControlGlobalSpinner();

        const hasGeneral = this.hasGeneralActions();
        const hasRegularActions = this.hasActions();

        if (hasGeneral && !this.grid.displayedColumns.includes(GENERAL_ACTION_COLUMN)) {
            this.grid.displayedColumns.unshift(GENERAL_ACTION_COLUMN);
        }

        if (hasRegularActions && !this.grid.displayedColumns.includes(ACTION_COLUMN)) {
            const insertIndex = hasGeneral ? 1 : 0;
            this.grid.displayedColumns.splice(insertIndex, 0, ACTION_COLUMN);
        }

        const columnDefId = this.grid.columnsDef.find(c => c.id);
        if (columnDefId) {
            this.columnDefId = columnDefId.columnDef;
        }
        this.initOk = true;
    }

    private wireUpDataSource(): void {
        if (this._datasource) {
            if (this.crud && this.crud.crudDef && this.crud.crudDef.serverPagination === false) {
                this._datasource.paginator = this.paginator;
            } else {
                this._datasource.paginator = null;
            }
            this._datasource.sort = this.sort;
        }
    }

    groupActionButton(index: number): void {
        const currentState = this.openActionsArray[index];
        this.openActionsArray.fill(false);
        this.openActionsArray[index] = !currentState;
    }

    hasActions(): boolean {
        if (!this.grid.actions) {
            return false;
        }

        const hasVisibleActions = this.grid.actions.some(action =>
            this.authService.hasPermission(action.actionSecurity)
        );

        return hasVisibleActions;
    }

    getGeneralActionsColumnName(): string {
        return GENERAL_ACTION_COLUMN;
    }

    getActionsColumnName(): string {
        return ACTION_COLUMN;
    }

    hasGeneralActions(): boolean {
        if (this.selectable) {
            return true;
        }
        return !!(this.grid?.deleteAction || this.grid?.deleteColumn) && this.canDelete;
    }

    getActionsByElement(element: any): ActionDef[] {
        const conditions = this.grid.displayedActionsCondition as DisplayActionsCondition[] | undefined;
        let actions = this.actionDefService.getActions(conditions || [], this.grid.actions || [], element);

        actions = actions.filter(action => this.authService.hasPermission(action.actionSecurity!));

        return actions;
    }

    submitAction(action: ActionDef, entity: any, $event: MouseEvent): void {
        $event.stopPropagation();
        if (this.columnDefId) {
            entity.id = entity[this.columnDefId];
        }
        if (action.gridModal) {
            this.dialogService.showGridModal({
                title: action.actionName,
                entities: entity[action.gridModal.fromArrayField],
                gridDef: action.gridModal.gridDef
            });
        } else if (action.confirm) {
            this.actionDefService.submitAction(action, entity, this.crud.i18nCurrentCrudComponent, undefined)
                .subscribe(r => {
                    this.spinnerGeneralControl.hide();
                    if ((r && r.success === true) || r === true) {
                        this.crud.findAll();
                        this.notificationService.notifySuccess(this.crud.translate('success_message'));
                    } else if (r && r.success === false && r.message) {
                        this.notificationService.notifyError(r.message);
                    }
                });
        } else if (action.form || action.formDef) {
            const actionClone = this.localStorageService.clone(action);
            const dictionaryName = this.crud.crudDef?.i18n?.name;
            const i18n = dictionaryName ? this.i18nService.getDictionary(dictionaryName) : undefined;

            if (actionClone.formDef) {
                this.formService.setUpFormDef(i18n, actionClone.formDef);
            }
            if (actionClone.form) {
                this.formService.setUpFieldTextFromI18n(i18n, actionClone.form);
            }

            const data = {
                entity: entity,
                config: actionClone,
                formDef: actionClone.formDef,
                fields: actionClone.form || actionClone.formDef?.fields,
                i18n: this.crud.i18nCurrentCrudComponent,
            };


            const dialogRef = this.injector.get(MatDialog).open(BasicModalComponent, {
                width: this.crud.crudDef.dialogConfig?.width || '320px',
                maxWidth: '95vw',
                panelClass: 'control-mat-dialog',
                data: data
            });
            dialogRef.afterClosed().subscribe(() => this.crud.findAll());
        } else {
            if (ACTION_TYPES.file_download === action.actionType) {
                this.spinnerGeneralControl.show();
                this.fileService.downloadFileByAction(action, entity).subscribe({
                    complete: () => { this.spinnerGeneralControl.hide(); }
                });
            } else if (ACTION_TYPES.file_preview === action.actionType) {
                this.spinnerGeneralControl.show();
                this.fileService.previewFileByAction(action, entity).subscribe({
                    complete: () => { this.spinnerGeneralControl.hide(); }
                });
            } else if (ACTION_TYPES.redirect === action.actionType) {
                this.handleRedirectAction(action, entity, $event);
            } else {
                this.spinnerGeneralControl.show();
                this.genericHttpService.callWs(action.ws, entity).subscribe({
                    next: () => {
                        this.crud.findAll();
                        this.notificationService.notifySuccess(this.crud.translate('success_message'));
                    },
                    complete: () => { this.spinnerGeneralControl.hide(); }
                });
            }
        }
    }

    private handleRedirectAction(action: any, entity: any, $event: MouseEvent): void {
        this.spinnerGeneralControl.show();
        let url: string = action.redirect.url;
        const queryParams: Params = this.getQueryParams(action.redirect.querystring, entity);

        if (queryParams['externalUrl']) {
            url = queryParams['externalUrl'];
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'http://' + url;
            }
            delete queryParams['externalUrl'];
        }

        if (action.redirect.openTab || $event.ctrlKey) {
            let queryParamsString = "";
            if (Object.keys(queryParams).length > 0) {
                const paramsStr = new URLSearchParams(queryParams).toString();
                if (paramsStr) {
                    queryParamsString = (url.includes('?') ? '&' : '?') + paramsStr;
                }
            }
            this.spinnerGeneralControl.hide();
            window.open(url + queryParamsString, '_blank')?.focus();
        } else {
            this.router.navigate([url], { queryParams }).finally(() => this.spinnerGeneralControl.hide());
        }
    }

    getQueryParams(querystring: any, entity: any): Params {
        const queryParams: Params = {};
        if (querystring && entity) {
            Object.keys(querystring).forEach(key => {
                const entityKey = querystring[key];
                if (entity[entityKey] !== undefined && entity[entityKey] !== null) {
                    queryParams[key] = entity[entityKey];
                }
            });
        }
        return queryParams;
    }

    onClickRowEvent(row: any): void {
        this.onRowClicked.emit(row);
    }

    getValue(element: any, attribute: string, def: any = null): any {
        if (def?.cellRender) {
            return def.cellRender(element);
        }
        let obj = attribute.split('.').reduce((acc, part) => acc && acc[part], element);

        if (def?.columnType && obj != null && obj !== '') {
            if (def.columnType === 'datehour') {
                const date = new Date(Date.parse(obj));
                return date.toLocaleDateString('es-ES') + " " + date.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" });
            } else if (def.columnType === 'date') {
                return new Date(Date.parse(obj)).toLocaleDateString('es-ES');
            }
        }
        if (typeof obj === 'boolean' || obj === 'true' || obj === 'false') {
            return this.translate(JSON.parse(String(obj)) ? 'boolean_true' : 'boolean_false');
        }
        if (def?.translate && obj) {
            const key = `grid_column_value_translate_${attribute.replace('.', '_').toLowerCase()}_${String(obj).toLowerCase()}`;
            return this.translate(key);
        }
        return obj;
    }

    override translate(key: string): string {
        const value = this.crud?.i18nComponent?.translate(key);
        return (value && value !== key) ? value : super.translate(key);
    }

    isRowSelectable(element: any, displaySelectCondition: DynamicFieldConditionIf | undefined): boolean {
        return !displaySelectCondition || this.expressionService.evaluate(displaySelectCondition, element);
    }

    getRowId(row: any): any {
        const idDef = this.grid.columnsDef.find(c => c.id);
        const idKey = idDef ? idDef.columnDef : 'id';
        return row[idKey];
    }

    getRow(element: any): Row | undefined {
        return this.rows.find(e => e.obj === element);
    }

    isDisableSort(columnKey: string): boolean {
        const def = this.grid.columnsDef.find(x => x.columnDef === columnKey);
        return def?.sort?.disabled ?? !(this.grid.sortAllColumns ?? false);
    }

    restartActionButtons(): void {
        this.openActionsArray.fill(false);
    }

    orderStart(columnKey: string): 'asc' | 'desc' {
        const def = this.grid.columnsDef.find(x => x.columnDef === columnKey);
        return def?.sort?.type || 'asc';
    }

    resetSelectAll(): void {
        this.resetSelects = true;
        this._selects = false;
    }

    override getI18nName(): string {
        return 'crud_table';
    }

    get selects(): boolean {
        const selectableRows = this.rows.filter(r => r.selectable);
        if (!selectableRows.length) return false;
        return this._selects && selectableRows.every(r => r.select);
    }

    set selects(value: boolean) {
        this._selects = value;
        if (this.resetSelects) {
            this.resetSelects = false;
        } else {
            this.rows.forEach(r => {
                if (r.selectable) r.select = value;
            });
        }
    }

    masterToggle(): void {
        if (this.isAllSelected() || this.statustable.selects.length >= 10) {
            this.rows.forEach(r => {
                if (r.selectable) r.select = false;
            });
        } else {
            let count = 0;
            const maxSelection = 10;

            this.rows.forEach(r => {
                if (r.selectable && count < maxSelection) {
                    r.select = true;
                    count++;
                } else {
                    r.select = false;
                }
            });

            if (this.rows.length > maxSelection) {
                this.notificationService.notify('Se han seleccionado los primeros 10 elementos (máximo permitido).');
            }
        }
    }

    isAllSelected(): boolean {
        const selectableRows = this.rows.filter(r => r.selectable);
        if (!selectableRows.length) return false;

        const allSelected = selectableRows.every(r => r.select);
        const maxSelected = this.statustable.selects.length >= 10;

        return allSelected || maxSelected;
    }

    onPageFired(event: any): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        if (this.crud.crudDef.pagination) {
            this.crud.crudDef.pagination.page = event.pageIndex;
            this.crud.crudDef.pagination.pageSize = event.pageSize;
        }
        this.onChangePagination.emit();
    }

    triggerAdd(): void {
        this.onAddClicked.emit();
    }

    triggerClearFilters(): void {
        this.onClearFiltersClicked.emit();
    }

    getColumnStyles(def: any): string {
        const classes = [];

        if (def.fitContent || def.ajustarContenido) classes.push('fit-content');

        if (def.wrapText || def.multiline) {
            classes.push('text-wrap');
        } else {
            classes.push('text-nowrap');
        }

        const alignment = def.textAlign || def.aligntext;
        if (alignment) classes.push(`text-${alignment}`);

        return classes.join(' ').trim();
    }
}