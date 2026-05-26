import { Component, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

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
        MatButtonModule, MatIconModule,
        MatExpansionModule, MatTooltipModule,
        TranslatePipe,
    ],
    templateUrl: './estadisticas.component.html',
    styleUrls: ['./estadisticas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadisticasComponent implements OnInit, OnDestroy {
    private estadisticasService = inject(EstadisticasService);
    private http = inject(HttpClient);
    private i18nService = inject(I18nService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    currentYear = new Date().getFullYear();

    maquinas: any[] = [];
    maquinaQuery = '';
    maquinaSelected: any = null;

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

    errors: { maquina?: string; year?: string; months?: string } = {};

    ngOnInit(): void {
        this.loadMaquinas();
        this.cargarMockData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get filteredMaquinas(): any[] {
        const query = typeof this.maquinaQuery === 'string' ? this.maquinaQuery.toLowerCase() : '';
        if (!query) return this.maquinas;
        return this.maquinas.filter(m =>
            (m.label || '').toLowerCase().includes(query) ||
            (m.internalSerialNum || '').toLowerCase().includes(query) ||
            (m.InternalSerialNum || '').toLowerCase().includes(query)
        );
    }

    displayFn(maq: any): string {
        return maq?.label || maq?.internalSerialNum || maq?.InternalSerialNum || '';
    }

    selectMaquinaByLabel(label: string): void {
        this.maquinaSelected = this.maquinas.find(m => this.displayFn(m) === label) || null;
        this.maquinaQuery = label;
        this.errors.maquina = '';
    }

    onMaquinaInput(value: any): void {
        this.maquinaQuery = typeof value === 'string' ? value : this.displayFn(value) || '';
        if (!this.maquinaSelected || this.displayFn(this.maquinaSelected) !== this.maquinaQuery) {
            this.maquinaSelected = null;
        }
        this.errors.maquina = '';
    }

    limpiarMaquina(): void {
        this.maquinaQuery = '';
        this.maquinaSelected = null;
        this.errors.maquina = '';
        this.cdr.markForCheck();
    }

    private cargarMockData(): void {
        this.loading = true;
        this.searchPanelExpanded = true;
        setTimeout(() => {
            this.results = {
                maquina: 'EB144',
                diasDetenida: 25,
                reclamosAsociados: 4,
                meses: [
                    { mes: 3, nombre: 'Marzo', detenida: 15, reclamos: 1 },
                    { mes: 4, nombre: 'Abril', detenida: 4, reclamos: 2 },
                    { mes: 5, nombre: 'Mayo', detenida: 6, reclamos: 1 },
                ],
            };
            this.loading = false;
            this.cdr.markForCheck();
        }, 600);
    }

    private mockStats(maquina: string, anio: number, meses: number[]): any {
        const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        return {
            maquina: maquina,
            diasDetenida: Math.floor(Math.random() * 30) + 5,
            reclamosAsociados: Math.floor(Math.random() * 8) + 1,
            meses: meses.map(m => ({
                mes: m,
                nombre: nombres[m - 1],
                detenida: Math.floor(Math.random() * 20) + 1,
                reclamos: Math.floor(Math.random() * 5) + 1,
            })),
        };
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

        const idMaquina = this.maquinaSelected?.internalSerialNum
            || this.maquinaSelected?.InternalSerialNum
            || this.maquinaQuery;

        this.searchPanelExpanded = false;
        this.loading = true;
        this.results = null;
        this.cdr.markForCheck();

        setTimeout(() => {
            this.results = this.mockStats(idMaquina, this.year, this.selectedMonths);
            this.loading = false;
            this.cdr.markForCheck();
        }, 500);
    }

    limpiar(): void {
        this.maquinaQuery = '';
        this.maquinaSelected = null;
        this.year = this.currentYear;
        this.selectedMonths = [];
        this.results = null;
        this.loading = false;
        this.errors = {};
        this.searchPanelExpanded = true;
        this.cdr.markForCheck();
    }

    private validar(): boolean {
        this.errors = {};

        if (!this.maquinaSelected && !this.maquinaQuery.trim()) {
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

    t(key: string): string {
        return this.i18nService.getDictionary('ESTADISTICAS')?.translate?.(key) || key;
    }
}
