import { Routes } from '@angular/router';
import { AuthSignInComponent } from '@fwk/auth/components/sign-in/sign-in.component';

export default [
    {
        path     : '',
        component: AuthSignInComponent,
    },
] as Routes;
