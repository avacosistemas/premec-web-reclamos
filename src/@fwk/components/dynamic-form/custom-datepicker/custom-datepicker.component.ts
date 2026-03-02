import { Component, forwardRef, inject, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, Validator, AbstractControl, ValidationErrors, NG_VALIDATORS, FormsModule, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { format, parse, isValid, getYear, getMonth, getDate, getHours, getMinutes } from 'date-fns';
import { MY_FORMATS } from '@fwk/services/dynamic-form/form.validator.service';
import { DynamicFieldFormComponent } from '../dynamic-field-form/dynamic-field-form.component';
import { DatepickerOptions } from '../../../model/dynamic-form/dynamic-field-options.interface';
import { TranslatePipe } from '@fwk/pipe/translate.pipe';
import { DatePickerModalComponent } from './datepicker-modal/datepicker-modal.component';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
    selector: 'fwk-custom-datepicker',
    templateUrl: './custom-datepicker.component.html',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe
    ],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomDatePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CustomDatePickerComponent), multi: true }
    ]
})
export class CustomDatePickerComponent extends DynamicFieldFormComponent<string> implements Validator {

    matcher = new class implements ErrorStateMatcher {
        constructor(private component: CustomDatePickerComponent) { }
        isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
            return !!(this.component.errorMessage || (control?.invalid && (control?.dirty || control?.touched)));
        }
    }(this);

    onValidatorChange: () => void = () => { };

    constructor(
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) {
        super();
    }

    private get datepickerOptions(): DatepickerOptions {
        return this.field?.options as DatepickerOptions;
    }

    override writeValue(value: string | null): void {
        this._value = value;
        this.cdr.markForCheck();
    }

    override setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        this.cdr.markForCheck();
    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (this.field?.required && !control.value) {
            return { required: true };
        }
        if (control.value) {
            const dateFormat = this.getDateFormat();
            if (!isValid(parse(control.value, dateFormat, new Date()))) {
                return { invalidDate: `El formato debe ser ${dateFormat}` };
            }
        }
        return null;
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onValidatorChange = fn;
    }

    private getDateFormat(): string {
        return this.datepickerOptions?.format ??
            (this.datepickerOptions?.withHourAndMin ? MY_FORMATS.parse.dateInputHours : MY_FORMATS.parse.dateInput);
    }

    openDateModal(): void {
        if (this.isDisabled) return;

        const now = new Date();
        let initialDate = {
            day: getDate(now), month: getMonth(now) + 1, year: getYear(now),
            hour: getHours(now), minute: getMinutes(now)
        };

        if (this._value) {
            const parsed = parse(this._value, this.getDateFormat(), now);
            if (isValid(parsed)) {
                initialDate = {
                    day: getDate(parsed), month: getMonth(parsed) + 1, year: getYear(parsed),
                    hour: getHours(parsed), minute: getMinutes(parsed)
                };
            }
        }

        const dialogRef = this.dialog.open(DatePickerModalComponent, {
            width: '420px',
            data: {
                initialDate: initialDate,
                withHourAndMin: this.datepickerOptions?.withHourAndMin,
                title: this.field?.label || 'Seleccionar fecha'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result instanceof Date && isValid(result)) {
                const newValue = format(result, this.getDateFormat());
                this._value = newValue;
                this.onChange(newValue);
                this.onTouch();
                this.cdr.markForCheck();
            }
        });
    }

    remove(): void {
        if (!this.isDisabled) {
            this._value = null;
            this.onChange(null);
            this.onTouch();
            this.cdr.markForCheck();
        }
    }
}