import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FWK_CONFIG, FwkConfig } from '@fwk/model/fwk-config';

@Component({
    selector: 'signed-in-redirect',
    template: '',
    standalone: true,
})
export class SignedInRedirectComponent implements OnInit {
    private _router = inject(Router);
    private _fwkConfig = inject(FWK_CONFIG);

    ngOnInit(): void {
        const url = (this._fwkConfig.showWelcome === false && this._fwkConfig.urlToRedirect)
            ? this._fwkConfig.urlToRedirect
            : '/welcome';
        this._router.navigateByUrl(url);
    }
}
