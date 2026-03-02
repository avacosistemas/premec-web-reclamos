import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@fwk/auth/auth.interceptor';
import { AuthService } from '@fwk/auth/auth.service';
import { AbstractAuthService } from '@fwk/auth/abstract-auth.service';

export const provideAppAuth = (): Array<Provider | EnvironmentProviders> =>
{
    return [
        {
            provide: AbstractAuthService,
            useExisting: AuthService
        }
    ];
};

export const provideFwkAuth = (): Array<Provider | EnvironmentProviders> =>
{
    return [
        provideHttpClient(withInterceptors([authInterceptor])),
    ];
};