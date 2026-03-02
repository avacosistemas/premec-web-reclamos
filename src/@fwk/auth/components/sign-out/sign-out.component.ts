import { I18nPluralPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@fwk/auth/auth.service';
import { TranslatePipe } from '@fwk/pipe/translate.pipe';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';
import { finalize, Subject, switchMap, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { LogoComponent } from '@fwk/components/logo/logo.component';

@Component({
    selector: 'auth-sign-out',
    templateUrl: './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, RouterLink, I18nPluralPipe, TranslatePipe, LogoComponent],
})
export class AuthSignOutComponent implements OnInit, OnDestroy {
    countdown: number = 3;
    countdownMessage: string = '';
    countdownMapping: any = {
        '=1': '# segundo',
        'other': '# segundos',
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    private _authService = inject(AuthService);
    private _router = inject(Router);
    private _i18nService = inject(I18nService);

    constructor() { }

    ngOnInit(): void {
        this.updateCountdownMessage();

        this._authService.signOut().pipe(
            switchMap(() => timer(1000, 1000)),
            takeWhile(() => this.countdown > 0),
            tap(() => {
                this.countdown--;
                this.updateCountdownMessage();
            }),
            finalize(() => {
                window.location.assign('/sign-in');
            }),
            takeUntil(this._unsubscribeAll)
        ).subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private updateCountdownMessage(): void {
        const baseMessage = this._i18nService.translate('sign_out_redirect_countdown');
        this.countdownMessage = baseMessage.replace('{{countdown}}', this.countdown.toString());
    }
}