import { Component, Input, OnInit, ViewEncapsulation, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseWidgetDirective } from '../../base-widget.directive';
import { WidgetFilterComponent } from '../widget-filter/widget-filter.component';
import { DashboardWidgetDef } from '@fwk/model/component-def/dashboard-def';
import { WidgetSkeletonComponent } from '../widget-skeleton/widget-skeleton.component';
import { WidgetErrorStateComponent } from '../widget-error-state/widget-error-state.component';
import { WidgetEmptyStateComponent } from '../widget-empty-state/widget-empty-state.component';

@Component({
    selector: 'fwk-stat-card-widget',
    standalone: true,
    imports: [CommonModule, DecimalPipe, MatCardModule, MatIconModule, WidgetFilterComponent, WidgetSkeletonComponent, WidgetErrorStateComponent, WidgetEmptyStateComponent],
    template: `
        <div class="bg-card flex flex-auto flex-col overflow-hidden rounded-2xl p-6 shadow">
            <ng-container *ngIf="widgetDef?.isLoading; else content">
                <div class="truncate text-lg font-medium leading-6 tracking-tight">{{ widgetDef?.title }}</div>
                <div class="relative inset-0 flex items-center justify-center">
                        <fwk-widget-skeleton [type]="widgetDef.type" class="w-full"></fwk-widget-skeleton>
                    </div>
            </ng-container>

            <ng-template #content>
                <ng-container *ngIf="!widgetDef.isLoading && widgetDef.hasError">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <fwk-widget-error-state 
                            [title]="'widget_error_title' | translate"
                            [message]="widgetDef.errorMessage"
                            (retry)="onRetry()">
                        </fwk-widget-error-state>
                    </div>
                </ng-container>

                <ng-container *ngIf="!widgetDef.hasError">
                    <div class="flex items-start justify-between">
                        <div class="truncate text-lg font-medium leading-6 tracking-tight">{{ widgetDef?.title }}</div>
                        <fwk-widget-filter *ngIf="widgetDef?.filterConfig?.show"
                            [options]="widgetDef.filterConfig.options"
                            [initialValue]="widgetDef.filterConfig.defaultOption"
                            (filterChange)="onFilterChanged($event)">
                        </fwk-widget-filter>
                    </div>

                    <div *ngIf="widgetDef.dataSource && widgetDef.dataSource.length > 0; else noData" class="mt-2 flex flex-col items-center">
                        <ng-container *ngFor="let data of widgetDef.dataSource">
                            <div class="text-7xl font-bold leading-none tracking-tight sm:text-8xl"
                                [ngClass]="{
                                    'text-blue-500': data.color === 'blue' || !data.color,
                                    'text-red-500': data.color === 'red',
                                    'text-amber-500': data.color === 'amber',
                                    'text-green-500': data.color === 'green'
                                }">
                                {{ data.mainStat | number:'1.0-0':'es' }}
                            </div>
                             <div class="text-lg font-medium"
                                [ngClass]="{
                                    'text-blue-600 dark:text-blue-500': data.color === 'blue' || !data.color,
                                    'text-red-600 dark:text-red-500': data.color === 'red',
                                    'text-amber-600 dark:text-amber-500': data.color === 'amber',
                                    'text-green-600 dark:text-green-500': data.color === 'green'
                                }">
                                {{ data.mainStatLabel }}
                            </div>
                            <div *ngIf="data.secondaryStatLabel" class="text-secondary mt-5 flex w-full items-baseline justify-center">
                                <div class="truncate text-md font-medium">{{ data.secondaryStatLabel }}</div>
                                <div class="ml-1.5 text-lg font-semibold">{{ data.secondaryStat | number }}</div>
                            </div>
                        </ng-container>
                    </div>
                </ng-container>

                <ng-template #noData>
                      <fwk-widget-empty-state
                            [title]="'widget_empty_title' | translate"
                            [message]="'widget_empty_message' | translate">
                        </fwk-widget-empty-state>
                </ng-template>
            </ng-template>
        </div>
    `,
    hostDirectives: [{
        directive: BaseWidgetDirective,
        inputs: ['widgetDef', 'i18nName'],
        outputs: ['dataLoaded'],
    }],
    encapsulation: ViewEncapsulation.None
})
export class StatCardWidgetComponent implements OnInit {
    @Input() widgetDef: DashboardWidgetDef;
    @Input() i18nName: string;

    private baseDirective = inject(BaseWidgetDirective);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        this.baseDirective.dataLoaded.subscribe(() => {
            this.cdr.markForCheck();
        });
    }

    ngOnInit(): void {
        this.baseDirective.initialize();
    }

    onFilterChanged(value: string) {
        this.baseDirective.onFilterChanged(value);
    }

    onRetry(): void {
        this.onFilterChanged(this.widgetDef.filterConfig?.defaultOption || 'all');
    }
}