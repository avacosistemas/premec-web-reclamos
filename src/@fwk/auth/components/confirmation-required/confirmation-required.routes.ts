import { Routes } from '@angular/router';
import { AuthConfirmationRequiredComponent } from '@fwk/auth/components/confirmation-required/confirmation-required.component';

export default [
    {
        path     : '',
        component: AuthConfirmationRequiredComponent,
    },
] as Routes;
