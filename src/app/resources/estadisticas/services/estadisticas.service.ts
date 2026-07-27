import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@fwk/services/http-service/http.service';
import { PREFIX_DOMAIN_API } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadisticasService extends HttpService {
    constructor(injector: Injector) {
        super(injector, PREFIX_DOMAIN_API + 'reclamo/estadisticas/');
    }

    getStats(maquinas: string[], periodos: { anio: number; mes: number }[]): Observable<any> {
        return this.httpPost(this.baseUrl + 'maquina-parada', {
            maquinas,
            periodos
        });
    }
}
