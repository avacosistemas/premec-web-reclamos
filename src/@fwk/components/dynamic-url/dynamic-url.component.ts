import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'dynamic-url',
    templateUrl: './dynamic-url.component.html',
    styleUrls: ['./dynamic-url.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicUrlComponent implements OnInit, OnDestroy {

    fullURL: string | null = null;
    private queryParamsSub?: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.queryParamsSub = this.activatedRoute.queryParams.subscribe(params => {
            if (params && params['seName']) {
                try {
                    const decodedSeName = decodeURIComponent(params['seName']);
                    this.fullURL = environment.SITE_DOMAIN_WEB + decodedSeName;
                } catch (e) {
                    console.error('Error decoding seName parameter:', e);
                    this.fullURL = null;
                }
            } else {
                this.fullURL = null;
            }
            this._cdr.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.queryParamsSub?.unsubscribe();
    }
}