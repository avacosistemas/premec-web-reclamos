import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from '@fwk/auth/auth.service';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';
import { TranslatePipe } from '@fwk/pipe/translate.pipe';
import { LogoComponent } from '@fwk/components/logo/logo.component';

interface SignUpForm {
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    company: FormControl<string | null>;
    agreements: FormControl<boolean>;
}

@Component({
    selector     : 'auth-sign-up',
    templateUrl  : './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [RouterLink, NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, TranslatePipe, LogoComponent],
})
export class AuthSignUpComponent implements OnInit
{
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    private _authService = inject(AuthService);
    private _formBuilder = inject(FormBuilder);
    private _router = inject(Router);
    private _i18nService = inject(I18nService);

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };

    signUpForm: FormGroup<SignUpForm>;
    showAlert: boolean = false;

    constructor() {}

    ngOnInit(): void
    {
        this.signUpForm = this._formBuilder.group({
                name      : ['', Validators.required],
                email     : ['', [Validators.required, Validators.email]],
                password  : ['', Validators.required],
                company   : [''],
                agreements: [false, Validators.requiredTrue],
            },
        );
    }

    signUp(): void
    {
        if ( this.signUpForm.invalid )
        {
            return;
        }

        this.signUpForm.disable();
        this.showAlert = false;

        this._authService.signUp(this.signUpForm.getRawValue())
            .subscribe(
                (response) =>
                {
                    this._router.navigateByUrl('/confirmation-required');
                },
                (response) =>
                {
                    this.signUpForm.enable();
                    this.signUpNgForm.resetForm();

                    this.alert = {
                        type   : 'error',
                        message: this._i18nService.getDictionary('fwk')?.translate?.('generic_error_try_again') ?? 'generic_error_try_again',
                    };

                    this.showAlert = true;
                },
            );
    }
}