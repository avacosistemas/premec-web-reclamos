import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from '@fwk/auth/auth.service';
import { finalize } from 'rxjs';
import { TranslatePipe } from '@fwk/pipe/translate.pipe';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';
import { LogoComponent } from '@fwk/components/logo/logo.component';

interface ResetPasswordForm {
    password: FormControl<string>;
    passwordConfirm: FormControl<string>;
}

@Component({
    selector: 'auth-reset-password', 
    templateUrl: './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink, TranslatePipe, LogoComponent],
})
export class AuthResetPasswordComponent implements OnInit {
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    resetPasswordForm: FormGroup<ResetPasswordForm>;
    showAlert: boolean = false;
    private _i18nService = inject(I18nService);

    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder, 
    ) {
    }

    ngOnInit(): void {
        this.resetPasswordForm = this._formBuilder.group({
            password: ['', Validators.required],
            passwordConfirm: ['', Validators.required],
        },
            {
                validators: FuseValidators.mustMatch('password', 'passwordConfirm'),
            },
        );
    }

    resetPassword(): void {
        if (this.resetPasswordForm.invalid) {
            return;
        }

        this.resetPasswordForm.disable();
        this.showAlert = false;

        this._authService.resetPassword(this.resetPasswordForm.get('password').value)
            .pipe(
                finalize(() => {
                    this.resetPasswordForm.enable();
                    this.resetPasswordNgForm.resetForm();
                    this.showAlert = true;
                }),
            )
            .subscribe(
                (response) => {
                    this.alert = {
                        type: 'success',
                        message: this._i18nService.translate('reset_password_success_message'),
                    };
                },
                (response) => {
                    this.alert = {
                        type: 'error',
                        message: this._i18nService.translate('reset_password_error_message'),
                    };
                },
            );
    }
}