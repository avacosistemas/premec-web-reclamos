import { Component, Inject, ViewChild, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AbstractFormComponent } from '../../abstract-form.component';
import { DynamicField } from '../../../model/dynamic-form/dynamic-field';
import { DynamicFormComponent } from '../../dynamic-form/dynamic-form.component';
import { Entity } from '../../../model/entity';
import { I18n } from '../../../model/i18n';
import { FormDef } from '../../../model/form-def';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { A11yModule } from '@angular/cdk/a11y';
import { TranslatePipe } from '../../../pipe/translate.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HTTP_METHODS } from '@fwk/model/ws-def';

@Component({
    selector: 'fwk-basic-modal-component',
    templateUrl: './basic-modal.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        DynamicFormComponent,
        A11yModule,
        TranslatePipe,
        MatTooltipModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicModalComponent extends AbstractFormComponent implements OnInit {
    @ViewChild('dynamicForm') dynamicForm!: DynamicFormComponent;

    entity: any;
    config: any;
    fields: DynamicField<any>[] = [];
    form: FormGroup;
    isObjectModified: boolean = false;
    i18nComponent: I18n | undefined;
    submit: any;
    formKey: string;
    notShowButton: boolean;
    formDef: FormDef | undefined;
    _submitting: boolean = false;
    currentUrl: string = '';

    private flattenObject(ob: any, prefix = ''): any {
        const toReturn: any = {};

        for (const i in ob) {
            if (!ob.hasOwnProperty(i)) continue;

            if (Array.isArray(ob[i])) {
                toReturn[prefix + i] = ob[i];
                continue;
            }

            if ((typeof ob[i]) === 'object' && ob[i] !== null) {
                const flatObject = this.flattenObject(ob[i], prefix + i + '.');
                for (const x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;
                    toReturn[x] = flatObject[x];
                }
            } else {
                toReturn[prefix + i] = ob[i];
            }
        }
        return toReturn;
    }

    constructor(
        public injector: Injector,
        public dialogRef: MatDialogRef<BasicModalComponent>,
        private activatedRoute: ActivatedRoute,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _cdr: ChangeDetectorRef,
    ) {
        super(injector);
        this.dialogRef.disableClose = true;

        this.config = this.data.config || {};
        this.entity = this.flattenObject(this.data.entity || {});
        this.submit = this.data.submit;
        this.i18nName = this.data.i18n?.name || 'fwk';
        this.formKey = this.config.formKey || 'subForm';
        this.formDef = this.config.formDef;
        this.notShowButton = !!this.config.notShowButton;

        this.fields = this.formDef?.fields || this.config.form || [];
        this.form = new FormGroup({});
        this.getUrl();
    }

    override ngOnInit(): void { }

    private getUrl(): void {
        const firstChild = this.activatedRoute.snapshot.firstChild;
        if (firstChild?.routeConfig?.path) {
            this.currentUrl = firstChild.routeConfig.path;
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onChangeEntity(entity) {
        if (this.config.ws && (this.config.ws.method === HTTP_METHODS.put ||
            this.config.ws.method === HTTP_METHODS.delete)) {
            entity.id = this.entity.id;
            this.entity = entity;
        } else if (this.config.ws && this.config.ws.method === HTTP_METHODS.post) {
            this.entity = entity;
        } else {
            this.entity = entity;
        }
    }

    isEdit(): boolean {
        return true;
    }

    onSubmitNoClose(): void {
        this.callSubmit(() => {
            if (this.dynamicForm) {
                this.isObjectModified = false;
                this._cdr.markForCheck();
            }
        });
    }

    onSubmit(): void {
        this.callSubmit((result: any) => {
            this.dialogRef.close(result);
        });
    }


    private callSubmit(callback: (result?: any) => void): void {
        if (this._submitting || this.form.invalid) {
            if (this.form.invalid) {
                this.notificationService.notifyError(this.translate('form_error_correct_errors'));
            }
            return;
        }
        this._submitting = true;
        this._cdr.markForCheck();

        const formWithControls = this.form.get(this.formKey) as FormGroup;
        if (!formWithControls) {
            console.error(`[FWK] BasicModal: No se pudo encontrar el FormGroup anidado.`);
            this._submitting = false;
            this._cdr.markForCheck();
            return;
        }

        let updatedEntity = this.formService.injectToEntity({}, formWithControls, this.fields);

        if (this.entity && (this.entity.id !== undefined && this.entity.id !== null)) {
            updatedEntity = { id: this.entity.id, ...updatedEntity };
        }

        const submitFn = this.submit?.onSubmitModal || this.submit;

        if (submitFn && typeof submitFn === 'function') {
            submitFn(updatedEntity, this.dialogRef);
        } else if (this.config?.ws) {
            this.genericSubmitWithWsDef(this.config.ws, updatedEntity, formWithControls).subscribe({
                next: (result: any) => {
                    this.notificationService.notifySuccess(this.translate('success_message'));
                    callback(result);
                },
                error: (error) => {
                    this._submitting = false;
                    this._cdr.markForCheck();
                },
                complete: () => {
                    this._submitting = false;
                    this._cdr.markForCheck();
                }
            });
        } else {
            callback(updatedEntity);
        }

        if (!this.submitting) {
            this._submitting = false;
            this._cdr.markForCheck();
        }
    }

    objectModified(isModified: boolean): void {
        this.isObjectModified = isModified;
        this._cdr.markForCheck();
    }

    get titleLabel(): string {
        if (this.data?.labelTitle) { return this.data.labelTitle; }
        if (this.config?.modalName) { return this.config.modalName; }
        if (this.config?.titleKey) { return this.translate(this.config.titleKey); }
        return this.translate('modal_confirm_operation_title');
    }

    get submitLabel(): string {
        if (this.config?.submitButtonKey) { return this.translate(this.config.submitButtonKey); }
        return this.translate('modal_button_confirm');
    }
}