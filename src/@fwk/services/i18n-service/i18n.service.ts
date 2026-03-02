import { Injectable, Injector, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from '../base-service/base.service';
import { I18n } from '../../model/i18n';
import { FWK_CONFIG } from '../../model/fwk-config';

@Injectable({
    providedIn: 'root'
})
export class I18nService extends BaseService {
    private dictionaries: Map<string, I18n> = new Map();
    private fwkConfig = inject(FWK_CONFIG);

    constructor(protected override injector: Injector) {
        super(injector);
    }

    translate(key: string, dictionaryName: string = 'fwk'): string {
        const dict = this.getDictionary(dictionaryName);
        let translation = dict?.translate?.(key);

        if (!translation || translation === key) {
            translation = this.getDictionary('fwk')?.translate?.(key);
        }

        const result = translation || key;

        if (result.includes('{{appName}}')) {
            return result.replace(/{{appName}}/g, this.fwkConfig.appName);
        }

        return result;
    }

    getDictionary(name: string): I18n | undefined {
        if (!name) return undefined;
        return this.dictionaries.get(name.toLowerCase());
    }

    getByName(byName: string): Observable<I18n> {
        const dictionary = this.getDictionary(byName) || new I18n();
        return of(dictionary);
    }

    addI18n(i18n: I18n): void {
        if (!i18n || !i18n.name) return;
        const key = i18n.name.toLowerCase();
        if (!this.dictionaries.has(key)) {
            const i18nInstance = new I18n();
            if (i18nInstance.clone) i18nInstance.clone(i18n);
            else Object.assign(i18nInstance, JSON.parse(JSON.stringify(i18n)));
            this.dictionaries.set(key, i18nInstance);
        }
    }
}