import { Component, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { TranslatePipe } from '@fwk/pipe/translate.pipe';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';
import { PREFIX_DOMAIN_API } from 'environments/environment';
import { EstadisticasService } from '../services/estadisticas.service';

@Component({
    selector: 'estadisticas',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatFormFieldModule, MatInputModule,
        MatSelectModule, MatAutocompleteModule,
        MatButtonModule, MatCardModule, MatIconModule,
        MatExpansionModule, MatTooltipModule,
        MatTableModule,
        TranslatePipe,
    ],
    templateUrl: './estadisticas.component.html',
    styleUrls: ['./estadisticas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('detailExpand', [
            state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class EstadisticasComponent implements OnInit, OnDestroy {
    private estadisticasService = inject(EstadisticasService);
    private http = inject(HttpClient);
    private i18nService = inject(I18nService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    currentYear = new Date().getFullYear();

    maquinas: any[] = [];
    selectedMaquinas: string[] = [];

    year: number = this.currentYear;

    months = [
        { value: 1, label: 'Enero' },
        { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' },
        { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' },
        { value: 12, label: 'Diciembre' },
    ];
    selectedMonths: number[] = [];

    results: any = null;
    loading = false;
    searchPanelExpanded = true;

    dataSource = new MatTableDataSource<any>([]);
    expandedElement: any | null = null;
    columnsToDisplay = ['maquina', 'diasDetenida', 'reclamosAsociados'];
    columnsToDisplayWithExpand = ['expand', ...this.columnsToDisplay];

    errors: { maquina?: string; year?: string; months?: string } = {};

    ngOnInit(): void {
        this.loadMaquinas();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getMaquinaId(m: any): string {
        if (!m) return '';
        if (typeof m === 'string') return m;
        return m.InternalSerialNum || m.internalSerialNum || m.label || '';
    }

    getMaquinaLabel(m: any): string {
        if (!m) return '';
        if (typeof m === 'string') return m;
        return m.label || m.InternalSerialNum || m.internalSerialNum || '';
    }

    selectAllMaquinas(event: MouseEvent): void {
        event.stopPropagation();
        this.selectedMaquinas = this.maquinas.map(m => this.getMaquinaId(m));
        this.cdr.markForCheck();
    }

    deselectAllMaquinas(event: MouseEvent): void {
        event.stopPropagation();
        this.selectedMaquinas = [];
        this.cdr.markForCheck();
    }

    limpiarMaquina(): void {
        this.selectedMaquinas = [];
        this.errors.maquina = '';
        this.cdr.markForCheck();
    }

    private loadMaquinas(): void {
        this.http.get<any>(PREFIX_DOMAIN_API + 'customer/equipment').pipe(
            catchError(() => of([])),
            takeUntil(this.destroy$),
        ).subscribe(resp => {
            const list = resp?.customer_equipment || resp?.data || resp;
            this.maquinas = Array.isArray(list) ? list : [];
            this.cdr.markForCheck();
        });
    }

    verResultados(): void {
        if (!this.validar()) return;

        this.searchPanelExpanded = false;
        this.loading = true;
        this.results = null;
        this.expandedElement = null;
        this.cdr.markForCheck();

        const periodos = this.selectedMonths.map(m => ({
            anio: this.year,
            mes: m
        }));

        this.estadisticasService.getStats(this.selectedMaquinas, periodos)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (resp) => {
                    const nombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const rawData = resp?.data || resp;

                    const machineEntries: { maquina: string; data: any }[] = [];

                    if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
                        for (const key of Object.keys(rawData)) {
                            const val = rawData[key];
                            if (val && typeof val === 'object' && Array.isArray(val.periodos)) {
                                machineEntries.push({
                                    maquina: key,
                                    data: val
                                });
                            }
                        }
                    }

                    if (machineEntries.length === 0 && rawData && Array.isArray(rawData.periodos)) {
                        machineEntries.push({
                            maquina: this.selectedMaquinas[0] || '',
                            data: rawData
                        });
                    }

                    const isMulti = this.selectedMaquinas.length > 1 || machineEntries.length > 1;

                    if (isMulti && machineEntries.length > 0) {
                        const machinesList = machineEntries.map(entry => {
                            const mData = entry.data;
                            const mappedMonths = (mData?.periodos || []).map((p: any) => ({
                                mes: p.mes,
                                anio: p.anio,
                                nombre: `${nombres[p.mes - 1] || ('Mes ' + p.mes)} ${p.anio}`,
                                detenida: p.diasParadaTotal ?? 0,
                                reclamos: p.cantidadReclamos ?? 0
                            }));

                            return {
                                maquina: entry.maquina,
                                diasDetenida: mData?.diasParadaTotalTotal ?? 0,
                                reclamosAsociados: mData?.cantidadReclamosTotal ?? 0,
                                meses: mappedMonths
                            };
                        });

                        this.dataSource.data = machinesList;
                        this.results = { isMultiMachine: true, machines: machinesList };
                    } else if (machineEntries.length === 1) {
                        const entry = machineEntries[0];
                        const mData = entry.data;
                        const mappedMonths = (mData?.periodos || []).map((p: any) => ({
                            mes: p.mes,
                            anio: p.anio,
                            nombre: nombres[p.mes - 1] || `Mes ${p.mes}`,
                            detenida: p.diasParadaTotal ?? 0,
                            reclamos: p.cantidadReclamos ?? 0
                        }));

                        this.results = {
                            isMultiMachine: false,
                            maquina: entry.maquina,
                            diasDetenida: mData?.diasParadaTotalTotal ?? 0,
                            reclamosAsociados: mData?.cantidadReclamosTotal ?? 0,
                            meses: mappedMonths
                        };
                    } else {
                        this.results = null;
                    }

                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this.results = null;
                    this.cdr.markForCheck();
                }
            });
    }

    expandRow(element: any): void {
        this.expandedElement = this.expandedElement === element ? null : element;
        this.cdr.markForCheck();
    }

    selectAllMonths(event: MouseEvent): void {
        event.stopPropagation();
        this.selectedMonths = this.months.map(m => m.value);
        this.cdr.markForCheck();
    }

    deselectAllMonths(event: MouseEvent): void {
        event.stopPropagation();
        this.selectedMonths = [];
        this.cdr.markForCheck();
    }

    limpiar(): void {
        this.selectedMaquinas = [];
        this.year = this.currentYear;
        this.selectedMonths = [];
        this.results = null;
        this.loading = false;
        this.errors = {};
        this.searchPanelExpanded = true;
        this.expandedElement = null;
        this.cdr.markForCheck();
    }

    private validar(): boolean {
        this.errors = {};

        if (!this.selectedMaquinas || this.selectedMaquinas.length === 0) {
            this.errors.maquina = 'es_error_maquina_required';
        }

        if (!this.year || isNaN(this.year)) {
            this.errors.year = 'es_error_anio_required';
        } else if (this.year < 2026) {
            this.errors.year = 'es_error_anio_min';
        } else if (this.year > this.currentYear) {
            this.errors.year = 'es_error_anio_max';
        }

        if (!this.selectedMonths || this.selectedMonths.length === 0) {
            this.errors.months = 'es_error_meses_required';
        }

        this.cdr.markForCheck();
        return Object.keys(this.errors).length === 0;
    }

    t(key: string, fallback?: string): string {
        const translated = this.i18nService.getDictionary('ESTADISTICAS')?.translate?.(key);
        if (translated && translated !== key) {
            return translated;
        }
        const fallbacks: Record<string, string> = {
            es_subgrid_mes: 'Mes / Período',
            es_subgrid_dias_parada: 'Días de Parada',
            es_subgrid_reclamos: 'Cantidad Reclamos',
            es_total: 'Total',
            es_error_maquina_required: 'Debe seleccionar al menos una máquina'
        };
        return fallbacks[key] || fallback || key;
    }
}
