import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, takeUntil } from 'rxjs';
import { User } from '@fwk/auth/user.types';
import { UserService } from '@fwk/auth/user.service';
import { AuthService } from '@fwk/auth/auth.service';

import { FuseConfig, FuseConfigService, Scheme } from '@fuse/services/config';

import { NgIf, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { TranslatePipe } from '@fwk/pipe/translate.pipe';
import { environment } from 'environments/environment';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatDividerModule,
        MatTooltipModule,
        FuseFullscreenComponent,
        MatButtonToggleModule,
        TranslatePipe,
    ],
})
export class UserComponent implements OnInit, OnDestroy {
    static ngAcceptInputType_showAvatar: BooleanInput;

    @Input() showAvatar: boolean = true;
    user: User;
    config: FuseConfig;
    showChangePassword = false;

    private readonly THEME_STORAGE_KEY = 'fuse-theme-scheme';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private _authService: AuthService,
        private _fuseConfigService: FuseConfigService,
    ) {
    }

    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                this._changeDetectorRef.markForCheck();
            });

        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) => {
                this.config = config;
                this._changeDetectorRef.markForCheck();
            });

        this.showChangePassword = !!environment.auth.changePassword && environment.auth.changePassword.trim() !== '';
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    signOut(): void {
        this._router.navigate(['/sign-out']);
    }

    /**
     * @param scheme
     */
    setScheme(scheme: Scheme): void {
        this._fuseConfigService.config = { scheme };

        try {
            localStorage.setItem(this.THEME_STORAGE_KEY, scheme);
        } catch (e) {
            console.error('No se pudo guardar la preferencia de tema en localStorage.', e);
        }
    }

    changePassword(): void {
        this._router.navigate(['/change-password']); 
    }
}