import { Directive, Input, Output, EventEmitter, inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { DashboardWidgetDef, StatData } from '@fwk/model/component-def/dashboard-def';
import { GenericHttpService } from '@fwk/services/generic-http-service/generic-http.service';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';

@Directive({
    selector: '[fwkBaseWidget]',
    standalone: true,
})
export class BaseWidgetDirective {
    @Input() widgetDef: DashboardWidgetDef;
    @Input() i18nName: string;
    @Output() dataLoaded = new EventEmitter<void>();

    protected genericHttpService = inject(GenericHttpService);
    private i18nService = inject(I18nService);

    public initialize(): void {
        this.resolveWidgetTitle();
        this.loadData(this.widgetDef.filterConfig?.defaultOption || 'all');
    }

    private resolveWidgetTitle(): void {
        if (this.widgetDef.titleKey && this.i18nName) {
            const dictionary = this.i18nService.getDictionary(this.i18nName);
            this.widgetDef.title = dictionary?.translate?.(this.widgetDef.titleKey) || this.widgetDef.titleKey;
        }
    }

    public loadData(filterValue: string): void {
        if (!this.widgetDef || this.widgetDef.type === 'widget-group' || !this.widgetDef.ws) {
            this.dataLoaded.emit();
            return;
        }

        this.widgetDef.isLoading = true;
        this.widgetDef.hasError = false;

        const params = this.getFilterParamsForApi(filterValue);

        this.genericHttpService.httpGet(this.widgetDef.ws.url, params)
            .pipe(
                map(data => {
                    if (this.widgetDef.type === 'stat') {
                        if (Array.isArray(data) && data[0]) {
                            this.widgetDef.dataSource = [this._mapDataToStatFormat(data[0])];
                        } else if (data) {
                            this.widgetDef.dataSource = [this._mapDataToStatFormat(data)];
                        }
                    } else {
                        this.widgetDef.apexChartData = this._mapDataToApexChartsFormat(data as any[]);
                    }
                }),
                catchError(error => {
                    console.error(`[Dashboard Widget] Error cargando datos para "${this.widgetDef.title}":`, error);
                    this.widgetDef.hasError = true;
                    this.widgetDef.errorMessage = this.i18nService.getDictionary('fwk')?.translate?.('widget_error_default_message') ?? 'widget_error_default_message';
                    return of(null);
                }),
                finalize(() => {
                    this.widgetDef.isLoading = false;
                    this.dataLoaded.emit();
                })
            )
            .subscribe();
    }

    private _mapDataToStatFormat(apiData: any): StatData {
        return {
            mainStat: Number(apiData.value) || 0,
            mainStatLabel: apiData.name || '',
            title: apiData.title || '',
            secondaryStat: Number(apiData.secondaryValue) || undefined,
            secondaryStatLabel: apiData.secondaryLabel || undefined,
            color: apiData.color || 'blue'
        };
    }

    private _mapDataToApexChartsFormat(apiData: Array<{ name: string; value: string | number }>) {
        if (!apiData || apiData.length === 0) {
            return { series: [], labels: [] };
        }

        const labels = apiData.map(item => item.name);
        const data = apiData.map(item => Number(item.value));

        const chartType = this.widgetDef.type;

        if (chartType === 'pie' || chartType === 'donut' || chartType === 'polarArea') {
            return {
                series: data,
                labels: labels,
            };
        }

        return {
            series: [{
                name: this.widgetDef.title || 'Datos',
                data: data,
            }],
            xaxis: {
                categories: labels,
            },
        };
    }

    protected getFilterParamsForApi(filterValue: string): any {
        const params: { [key: string]: string } = {};
        if (filterValue && filterValue.toLowerCase() !== 'all') {
            params['filter'] = filterValue;
        }
        return params;
    }

    onFilterChanged(filterValue: string): void {
        this.loadData(filterValue);
    }
}