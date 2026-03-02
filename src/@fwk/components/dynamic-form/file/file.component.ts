import { Component, Input, forwardRef, ElementRef, ViewChild, ChangeDetectorRef, Optional, Host, SkipSelf, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, Validator, AbstractControl, ValidationErrors, NG_VALIDATORS, FormsModule, ControlContainer, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '../../../pipe/translate.pipe';

@Component({
    selector: 'fwk-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressBarModule,
        TranslatePipe
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => FileComponent),
            multi: true
        }
    ],
    viewProviders: [
        {
            provide: ControlContainer,
            useFactory: (container: ControlContainer) => container,
            deps: [[new Optional(), new SkipSelf(), ControlContainer]]
        }
    ]
})
export class FileComponent implements ControlValueAccessor, Validator {

    @Input() field!: any;
    @Input() errorMessage: string | null = null;

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    files: { name: string, size: string, base64: string, byteArray: number[] }[] = [];

    isDisabled: boolean = false;
    isDragging: boolean = false;
    isLoading: boolean = false;
    hasErrorMessage: string | null = null;

    onChange: (value: any) => void = () => { };
    onTouch: () => void = () => { };

    constructor(
        private cdr: ChangeDetectorRef,
        @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer
    ) { }

    @HostListener('dragover', ['$event']) onDragOver(evt: any) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!this.isDisabled) this.isDragging = true;
    }

    @HostListener('dragleave', ['$event']) onDragLeave(evt: any) {
        evt.preventDefault();
        evt.stopPropagation();
        this.isDragging = false;
    }

    @HostListener('drop', ['$event']) onDrop(evt: any) {
        evt.preventDefault();
        evt.stopPropagation();
        this.isDragging = false;
        if (this.isDisabled) return;

        const files = evt.dataTransfer.files;
        if (files.length > 0) {
            this.handleInputFiles(files);
        }
    }

    writeValue(value: any): void {
        this.files = [];
        if (value) {
            if (Array.isArray(value)) {
                if (value.length > 0 && Array.isArray(value[0])) {
                    this.files = value.map((v, i) => ({
                        name: `Archivo ${i + 1}`,
                        size: '',
                        base64: this.byteArrayToBase64(v),
                        byteArray: v
                    }));
                } else if (value.length > 0 && typeof value[0] === 'number') {
                    this.files = [{
                        name: "Archivo actual",
                        size: '',
                        base64: this.byteArrayToBase64(value),
                        byteArray: value
                    }];
                }
            } else if (typeof value === 'string') {
                this.files = [{
                    name: "Archivo actual",
                    size: '',
                    base64: value,
                    byteArray: []
                }];
            }
        }
        this.cdr.markForCheck();
    }

    registerOnChange(fn: any): void { this.onChange = fn; }
    registerOnTouched(fn: any): void { this.onTouch = fn; }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        this.cdr.markForCheck();
    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (this.field?.required && (!this.files || this.files.length === 0)) {
            return { required: true };
        }
        return null;
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleInputFiles(input.files);
        }
    }

    private async handleInputFiles(fileList: FileList | File[]): Promise<void> {
        const maxFiles = this.field?.options?.maxFiles ?? 1;
        const currentCount = this.files.length;
        const remainingSlots = maxFiles - currentCount;

        if (remainingSlots <= 0) {
            this.handleError(`Máximo de ${maxFiles} archivos permitido`);
            return;
        }

        const filesToProcess = Array.from(fileList).slice(0, remainingSlots);
        this.isLoading = true;
        this.hasErrorMessage = null;

        for (const file of filesToProcess) {
            await this.processFile(file);
        }

        this.isLoading = false;
        this.updateValue();
        this.cdr.markForCheck();
    }

    private processFile(file: File): Promise<void> {
        return new Promise((resolve) => {
            if (this.acceptTypes && !this.checkFileType(file)) {
                this.handleError('Tipo de archivo no permitido: ' + file.name);
                resolve();
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64Result = reader.result as string;
                const rawBase64 = base64Result.split(',')[1];
                const byteArray = this.base64ToByteArray(rawBase64);

                this.files.push({
                    name: file.name,
                    size: this.formatBytes(file.size),
                    base64: rawBase64,
                    byteArray: byteArray
                });
                resolve();
            };
            reader.onerror = () => {
                this.handleError('Error al leer: ' + file.name);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    private updateValue(): void {
        const value = this.isMultiple ? this.files.map(f => f.byteArray) : (this.files[0]?.byteArray || null);
        this.onChange(value);
        this.onTouch();
        this.cdr.markForCheck();
    }

    private byteArrayToBase64(byteArray: number[]): string {
        if (!byteArray || byteArray.length === 0) return '';
        try {
            const bytes = new Uint8Array(byteArray);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        } catch (e) {
            return '';
        }
    }

    private base64ToByteArray(base64: string): number[] {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    private checkFileType(file: File): boolean {
        if (!this.acceptTypes) return true;
        const accepted = this.acceptTypes.split(',').map(t => t.trim().toLowerCase());
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const type = file.type.toLowerCase();
        return accepted.some(acc => acc === ext || type.match(new RegExp(acc.replace('*', '.*'))));
    }

    removeFile(index: number, event: Event): void {
        event.stopPropagation();
        this.files.splice(index, 1);
        this.updateValue();
    }

    private handleError(msg: string): void {
        this.hasErrorMessage = msg;
        this.cdr.markForCheck();
    }

    triggerFileInput(): void {
        if (!this.isDisabled && (this.isMultiple || this.files.length === 0)) {
            this.fileInput.nativeElement.click();
        }
    }

    private formatBytes(bytes: number, decimals = 2): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    get acceptTypes(): string {
        return this.field?.options?.acceptTypes ?? '';
    }

    get isMultiple(): boolean {
        return this.field?.options?.multiple === true;
    }
}