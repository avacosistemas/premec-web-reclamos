import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutDef, DashboardWidgetDef } from '@fwk/model/component-def/dashboard-def';
import { WidgetWrapperComponent } from '../widget-wrapper/widget-wrapper.component';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';

@Component({
    selector: 'fwk-dashboard-page',
    standalone: true,
    imports: [CommonModule, WidgetWrapperComponent],
    template: `
    <div class="flex flex-col flex-auto w-full" *ngIf="layoutDef">
        <div class="flex flex-col sm:flex-row flex-0 sm:items-center sm:justify-between p-4 sm:px-6 pt-0 w-full bg-card dark:bg-transparent">
            <div class="flex-1 min-w-0">
                <div class="text-3xl font-extrabold tracking-tight leading-7 sm:leading-10 truncate">
                    {{ pageTitle }}
                </div>
            </div>
        </div>

        <div class="flex-auto p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <ng-container *ngFor="let widget of layoutDef.widgets">
                    <div [ngClass]="getSizeClasses(widget.size)">
                        <fwk-widget-wrapper [widgetDef]="widget" [i18nName]="i18nName"></fwk-widget-wrapper>
                    </div>
                </ng-container>
            </div>
        </div>
    </div>
    `
})
export class DashboardPageComponent implements OnInit {
    @Input() layoutDef: DashboardLayoutDef;
    @Input() i18nName: string;

    pageTitle: string = 'Dashboard';
    private i18nService = inject(I18nService);

    ngOnInit(): void {
        const i18n = this.i18nService.getDictionary(this.i18nName);
        this.pageTitle = i18n?.translate?.('page_title') || this.layoutDef.sectionTitle || 'Dashboard';
    }

    getSizeClasses(size: string): any {
        switch (size) {
            case 'full': return 'col-span-1 sm:col-span-2 lg:col-span-4';
            case 'half': return 'col-span-1 sm:col-span-2 lg:col-span-2';
            case 'third': return 'col-span-1 sm:col-span-2 lg:col-span-2';
            case 'quarter': return 'col-span-1';
            default: return 'col-span-1';
        }
    }
}