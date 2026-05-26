import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@fwk/services/http-service/http.service';
import { PREFIX_DOMAIN_API } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadisticasService extends HttpService {
    constructor(injector: Injector) {
        super(injector, PREFIX_DOMAIN_API + 'estadisticas/');
    }

    getStats(maquina: string, anio: number, meses: number[]): Observable<any> {
        const mesesParam = meses.join(',');
        return this.httpGet(`reporte?maquina=${encodeURIComponent(maquina)}&anio=${anio}&meses=${mesesParam}`);
    }
}
