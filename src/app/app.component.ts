import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CrudRegistryService } from '@fwk/services/crud-registry.service';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';
import { FWK_I18N_DEF } from '@fwk/i18n/fwk.i18n';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    constructor(
        private registry: CrudRegistryService,
        private i18nService: I18nService
    ) {
        this.registerGlobalI18n();
    }

    private registerGlobalI18n(): void {
        this.i18nService.addI18n(FWK_I18N_DEF as any);
    }
}