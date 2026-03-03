import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ViewEncapsulation, Injector, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { switchMap, finalize, map, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';

import { AbstractCrudComponent } from './abstract-crud.component';
import { StatusTable } from './crud-table/crud-table.model';
import { CrudModalComponent } from './crud-modal/crud-modal.component';
import { I18n } from '../../model/i18n';
import { CrudDef } from '../../model/component-def/crud-def';
import { FormDef } from '../../model/form-def';
import { ActionDef } from '../../model/component-def/action-def';
import { AuthService } from '@fwk/auth/auth.service';

import { SearchComponent } from './crud-search/search.component';
import { CrudTableComponent } from './crud-table/crud-table.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../pipe/translate.pipe';
import { FormGridModalComponent } from '../form-grid-dialog/form-grid.dialog.component';
import { BackButtonComponent } from '../back-button/backbutton.component'; 

@Component({
  selector: 'fwk-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    SearchComponent,
    CrudTableComponent,
    TranslatePipe,
    BackButtonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrudComponent extends AbstractCrudComponent<any, any> implements OnInit, OnDestroy {
  @ViewChild(SearchComponent) searchComponent!: SearchComponent;

  @Input() title: string = '';
  @Input() handlerFieldSourceData?: (key: string, entity: any, injector: Injector) => Observable<any[]>;
  @Input() onClickRow?: (row: any) => void;

  @Input()
  set componentName(name: string) {
    if (name) {
      this.name = name;
      if (this._isInitialized) {
        super.ngOnInit();
      }
    }
  }

  @Input('service')
  set injectService(service: any) {
    this.service = service;
  }

  @Input()
  set crudDefinition(def: CrudDef) {
    if (def) {
      this.i18nName = def.i18n?.name || 'fwk';
      this.setUpCRUDDef(def);
    }
  }

  @Output() onChangeSearchEntity = new EventEmitter<any>();

  display = {
    deleteButton: false,
    selects: false
  };
  selects: any[] = [];
  hasActiveFilters: boolean = false;
  actionLoadingStates = new Map<string, boolean>();

  private authService: AuthService;
  private _isInitialized = false;
  private _injector: Injector;

  constructor(
    injector: Injector,
  ) {
    super(injector);
    this._injector = injector;
    this.authService = injector.get(AuthService);
  }


  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  override postSetUpCrud(crudDef: CrudDef): void {
    if (!crudDef.forms?.filter) {
      // this.findAll();
    }
    this.display.deleteButton = !!crudDef.grid?.deleteAction || !!crudDef.grid?.deleteColumn;
    this._cdr.markForCheck();
  }

  statusChanged(status: StatusTable<any>): void {
    this.displayGlobalButtons(status.existSelectedItems());
    this.selects = status.selects;
    this._cdr.markForCheck();
  }

  onDisplayedColumnsChange(newDataColumns: string[]): void {
    if (this.crudDef && this.crudDef.grid) {
      const currentColumns = this.crudDef.grid.displayedColumns;
      const specialColumns = currentColumns.filter(col => col.startsWith('_'));

      const finalDisplayedColumns = [...specialColumns, ...newDataColumns];

      this.crudDef.grid = {
        ...this.crudDef.grid,
        displayedColumns: finalDisplayedColumns
      };

      this._cdr.markForCheck();
    }
  }

  displayGlobalButtons(hasElementsSelected: boolean): void {
    this.display.selects = hasElementsSelected;
  }

  openAddDialog(): void {
    this.getFormCreate(this.crudDef).pipe(
      switchMap((formCreate: FormDef) => {
        const dialogRef = this.dialog.open(CrudModalComponent, {
          width: this.crudDef.dialogConfig?.width ?? '500px',
          panelClass: 'control-mat-dialog',
          data: {
            isAdd: true,
            formDef: this.clone(formCreate),
            translate: (key: string) => this.translate(key),
            funcName: this.crudDef.name ?? '',
            handlerFieldSourceData: this.handlerFieldSourceData,
            crud: this,
            i18n: this.i18nComponent,
          }
        });
        return dialogRef.afterClosed();
      })
    ).subscribe(result => {
      if (result) {
        this.findAll();
      }
    });
  }

  handleRowClick(row: any): void {
    if (this.onClickRow) {
      this.onClickRow(row);
      return;
    }
    this.processRowClick(row);
  }

  private processRowClick(row: any): void {
    if (!this.crudDef) return;

    this.spinnerControl.show();
    const idDef = this.crudDef.grid.columnsDef.find(c => c.id);
    const idKey = idDef ? idDef.columnDef : 'id';

    if (this.crudDef.forceGetDetail) {
      this.genericHttpService.basicGet(this.crudDef.wsGetDetail, { id: row[idKey] }, undefined, { id: 'id' }).pipe(
        finalize(() => this.spinnerControl.hide())
      ).subscribe(r => {
        if (r) this.openEditOrReadDialog(r);
      });
    } else {
      this.openEditOrReadDialog(row);
      this.spinnerControl.hide();
    }
  }

  private openEditOrReadDialog(entity: any): void {
    const formUpdate = this.getFormUpdate(this.crudDef);
    const formRead = this.getFormRead(this.crudDef);
    const nameFunc = this.crudDef.name || '';
    let data: any;

    const canUpdate = this.authService.hasPermission(this.crudDef.security?.updateAccess);

    const forceRead = this.crudDef.readCondition
      ? this.expressionService.evaluate(this.crudDef.readCondition, entity)
      : false;

    if (formUpdate && canUpdate && !forceRead) {
      data = {
        isEdit: true, entity: entity, formDef: formUpdate, formName: 'formUpdate',
        funcName: nameFunc, fields: this.localStorageService.clone(formUpdate.fields),
        handlerFieldSourceData: this.handlerFieldSourceData, crud: this
      };
      this.displayCrudModal(data, '-modal update-modal');
    } else if (formRead) {
      data = {
        isRead: true, entity: entity, formDef: formRead, formName: 'formRead',
        funcName: nameFunc, fields: this.localStorageService.clone(formRead.fields)
      };
      this.displayCrudModal(data, '-modal read-modal');
    } else if (this.crudDef.dialogs?.read) {
      this.displayCustomDialog(entity, nameFunc);
    }
  }

  private displayCrudModal(data: any, modalName: string): void {
    if (data) {
      data.funcName = (data.funcName || '') + modalName;
      const dialogRef = this.dialog.open(CrudModalComponent, {
        width: this.crudDef.dialogConfig?.width || '320px',
        panelClass: 'control-mat-dialog',
        data: data
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.findAll();
        }
      });
    }
  }

  private displayCustomDialog(entity: any, nameFunc: string): void {
    const data = {
      isEdit: false, dialog: this.crudDef.dialogs.read, entity: entity, formName: 'customFormRead',
      funcName: nameFunc,
      onSubmitActions: (actionDef: any, submittedEntity: any) => {
        const dialogRef = this.dialog.getDialogById('customDialog');
        this.actionDefService.submitAction(actionDef, submittedEntity, this.i18nComponent, this.crudDef.dialogConfig)
          .subscribe({
            next: () => this.notificationService.notifySuccess(this.translate('success_message')),
            complete: () => dialogRef?.close()
          });
      },
    };

    const dialogRef = this.dialog.open(FormGridModalComponent, {
      id: 'customDialog', width: 'auto', panelClass: 'control-mat-dialog', data: data
    });

    dialogRef.afterClosed().subscribe(() => { this.findAll(); });
  }

  private getFormRead(crudDef: CrudDef): FormDef | undefined {
    if (crudDef.forms?.read) {
      return { fields: crudDef.forms.read };
    }
    return crudDef.formsDef?.read;
  }

  private getFormUpdate(crudDef: CrudDef): FormDef | undefined {
    if (crudDef.formsDef?.update) {
      return crudDef.formsDef.update;
    }
    if (crudDef.forms?.update) {
      return { fields: crudDef.forms.update };
    }
    return undefined;
  }

  showCrudActions(): boolean {
    return this.display.selects;
  }

  executeCrudAction(action: ActionDef): void {
    if (!this.i18nComponent) return;

    const actionKey = action.actionNameKey || action.actionName || 'default';
    if (this.actionLoadingStates.get(actionKey)) return;

    this.actionLoadingStates.set(actionKey, true);
    this._cdr.markForCheck();

    const wsCall$ = action.ws ? this.genericHttpService.callWs(action.ws, this.selects) : of(undefined);

    wsCall$.pipe(
      finalize(() => {
        this.actionLoadingStates.set(actionKey, false);
        this._cdr.markForCheck();
      })
    ).subscribe(entity => {
      if (action.formDef) {
        this.callCrudDialog(action, entity);
      } else {
        this.actionDefService.submitAction(action, this.selects, this.i18nComponent, undefined).subscribe(() => {
          this.findAll();
          this.notificationService.notifySuccess(this.translate('success_message'));
        });
      }
    });
  }

  private callCrudDialog(action: ActionDef, entity: any): void {
    if (!this.i18nComponent) return;

    const dialogRef = this.dialog.open(CrudModalComponent, {
      width: this.crudDef.dialogConfig?.width ?? '500px',
      panelClass: 'control-mat-dialog',
      data: {
        entity: entity,
        translate: (key: string) => this.translate(key),
        submitActions: (actionDef: ActionDef) => {
          if (!this.i18nComponent) return;
          this.actionDefService.submitAction(actionDef, this.selects, this.i18nComponent, this.crudDef.dialogConfig)
            .pipe(finalize(() => dialogRef.close()))
            .subscribe(() => {
              this.findAll();
              this.notificationService.notifySuccess(this.translate('success_message'));
            });
        },
        formDef: this.localStorageService.clone(action.formDef),
        funcName: this.crudDef.name ?? ''
      }
    });
  }

  getCrudActions(): ActionDef[] {
    return this.actionDefService.filterActionsByCondition(this.crudDef.crudActions ?? [], this.crudDef.displayGlobalActions ?? [], this.selects);
  }

  getFormCreate(crudDef: CrudDef): Observable<FormDef> {
    const formDef: FormDef = (crudDef.formsDef?.create) ?? {
      fields: crudDef.forms?.create,
      fieldsBehavior: crudDef.forms?.createBehavior,
    };

    if (formDef.initWs?.url) {
      return this.genericHttpService.basicGet(formDef.initWs.url, null, null, {}).pipe(
        map((response: any[]) => {
          const initData = Array.isArray(response) ? response[0] : response;
          if (initData && formDef.fields) {
            Object.keys(initData).forEach(attribute => {
              const field = formDef.fields?.find(f => f.key === attribute);
              if (field) {
                field.value = initData[attribute];
              }
            });
          }
          return formDef;
        })
      );
    }
    return of(formDef);
  }

  clone(obj: any): any {
    return this.localStorageService.clone(obj);
  }

  delete(): Observable<any> {
    return this.deleteAll(this.selects).pipe(
      tap(() => {
        this.findAll();
        this.notificationService.notifySuccess(this.translate('success_message'));
      })
    );
  }

  openDeleteDialog(): void {
    const count = this.selects.length;
    let message: string;

    if (count === 1) {
      message = this.translate('modal_delete_message_single');
    } else {
      const pluralMessage = this.translate('modal_delete_message_plural');
      message = pluralMessage.replace('{0}', count.toString());
    }

    this.dialogService.showQuestionModal({
      title: this.translate('modal_delete_title'),
      message: message,
      actions: {
        confirm: {
          label: this.translate('modal_delete_button_accept'),
          color: 'warn'
        }
      },
      onSubmit: () => this.delete(),
    });
  }

  exportCsv(): void {
    const exportConfig = this.crudDef.exportCsv;
    if (!exportConfig) return;

    if (exportConfig.ws) {
      const params = this.service.getParametersToUrl(this.appliedFilterEntity);
      this.service.downloadCsv(exportConfig.ws, params)
        .subscribe((res: any) => this.fileService.downloadFileOctectStream(res));
    } else if (exportConfig.csvExportFileName) {
      const data = this.entities.map(e => {
        const reg: { [key: string]: any } = {};
        this.crudDef.grid?.columnsDef.forEach((column: any) => {
          if (e[column.columnDef] !== undefined) {
            reg[column.columnName] = e[column.columnDef];
          }
        });
        return reg;
      });
      this.fileService.downloadCsv(data, exportConfig.csvExportFileName);
    }
  }

  override getI18nName(): string {
    return this.crudDef?.i18n?.name ?? 'crud';
  }

  getCRUDName(): string {
    return this.name;
  }

  newObjectEntity(): any {
    return {};
  }

  showDeleteButton(): boolean {
    if (!this.crudDef.security?.deleteAccess) {
      return this.display.deleteButton;
    }
    return this.display.deleteButton && this.authService.hasPermission(this.crudDef.security.deleteAccess);
  }

  showAddButton(): boolean {
    const hasForm = !!this.crudDef?.forms?.create || !!this.crudDef?.formsDef?.create;
    if (!this.crudDef.security?.createAccess) return hasForm;
    return hasForm && this.authService.hasPermission(this.crudDef.security.createAccess);
  }

  handlePageChange(): void {
    if (this.crudDef?.serverPagination === true) {
      this.findAll();
    }
  }

  override translate(key: string): string {
    const word = super.translate(key);
    if (word === key && key === 'page_title' && this.title) {
      return this.title;
    }
    return word;
  }

  downloadBoleta(): void {
    const contactId = this.appliedFilterEntity?.['idContact'];
    if (contactId && this.service) {
      (this.service as any).downloadBoleta(contactId);
    } else {
      console.error("No se pudo descargar la boleta: idContact no encontrado en el filtro aplicado.");
    }
  }

  goToLink(url: string | undefined): void {
    if (url) {
      window.open(url, "_blank");
    }
  }

  override filterSearchEntity(filterEntity: any): void {
    this.hasActiveFilters = Object.values(filterEntity).some(v => v !== null && v !== undefined && v !== '');
    super.filterSearchEntity(filterEntity);
  }

  clearFilters(): void {
    if (this.searchComponent) {
      this.searchComponent.clearForm();
    }
  }
}