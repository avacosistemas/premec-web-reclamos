import { Component, forwardRef, ChangeDetectorRef, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicFieldFormComponent } from '../dynamic-form/dynamic-field-form/dynamic-field-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

declare var tinymce: any;

@Component({
    selector: 'fwk-html-editor',
    templateUrl: './html-editor.component.html',
    styleUrls: ['./html-editor.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => HtmlEditorComponent),
            multi: true
        }
    ]
})
export class HtmlEditorComponent extends DynamicFieldFormComponent<string> implements OnInit, OnDestroy {

    @ViewChild('editorElem', { static: true }) editorElem!: ElementRef;

    editorId: string = `tiny-editor-${Math.random().toString(36).substring(2, 9)}`;
    private editor: any;

    private baseConfig: any = {
        language: 'es',
        language_url: '/assets/tinymce/langs/es.js',
        base_url: '/tinymce',
        suffix: '.min',
        height: 500,
        menubar: true,
        branding: false,
        promotion: false,
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        image_advtab: true,
        importcss_append: true,
        template_cdate_format: '[Fecha: %m/%d/%Y a las %H:%M:%S]',
        template_mdate_format: '[Modificado: %m/%d/%Y a las %H:%M:%S]',
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_class: 'mceNonEditable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        skin: 'oxide',
        content_css: 'default',
        plugins: [
            'preview', 'importcss', 'searchreplace', 'autolink', 'autosave', 'save',
            'directionality', 'code', 'visualblocks', 'visualchars', 'fullscreen',
            'image', 'link', 'media', 'codesample', 'table', 'charmap', 'pagebreak',
            'nonbreaking', 'anchor', 'insertdatetime', 'advlist', 'lists', 'wordcount',
            'help', 'charmap', 'quickbars', 'emoticons', 'accordion', 'visualchars'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media link anchor codesample accordion | ltr rtl',
        setup: (editor: any) => {
            this.editor = editor;
            editor.on('Change KeyUp Undo Redo', () => {
                const content = editor.getContent();
                this._value = content;
                this.onChange(content);
                this.onTouch();
            });
        }
    };

    constructor(
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog
    ) {
        super();
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.initEditor();
        }, 0);
    }

    ngOnDestroy(): void {
        if (this.editor) {
            tinymce.remove(this.editor);
        }
    }

    private initEditor(): void {
        const finalConfig = {
            ...this.baseConfig,
            selector: `#${this.editorId}`,
            height: this.field?.options?.['height'] || 500
        };

        if (this.field?.options?.['init']) {
            Object.assign(finalConfig, this.field.options['init']);
        }

        tinymce.init(finalConfig).then((editors: any[]) => {
            if (this._value) {
                editors[0].setContent(this._value);
            }
            if (this.isDisabled) {
                editors[0].mode.set('readonly');
            }
        });
    }

    override writeValue(value: string | null): void {
        this._value = value || '';
        if (this.editor && this.editor.initialized) {
            this.editor.setContent(this._value);
        }
        this.cdr.markForCheck();
    }

    override setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        if (this.editor && this.editor.initialized) {
            this.editor.mode.set(isDisabled ? 'readonly' : 'design');
        }
        this.cdr.markForCheck();
    }

    openFullscreen(): void {
        if (this.editor) {
            this.editor.execCommand('mceFullScreen');
        }
    }
}
