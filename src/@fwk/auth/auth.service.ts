import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, throwError, catchError, tap, finalize, filter, take, map, shareReplay } from 'rxjs';
import { User } from '@fwk/auth/user.types';
import { UserService } from '@fwk/auth/user.service';
import { environment } from 'environments/environment';
import { AbstractAuthService, SignInData } from '@fwk/auth/abstract-auth.service';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';

@Injectable({ providedIn: 'root' })
export class AuthService implements AbstractAuthService {
    private _httpClient = inject(HttpClient);
    private _router = inject(Router);
    private _userService = inject(UserService);
    private _i18nService = inject(I18nService);

    private _authenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _userPermissions: Set<string> = new Set<string>();
    private _checkRequest$: Observable<boolean> | null = null;

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _refreshTimeout: any;

    private readonly TOKEN_KEY = 'accessToken';
    private readonly USER_DATA_KEY = 'currentUser';

    get authenticated$(): Observable<boolean> { return this._authenticated.asObservable(); }

    signIn(credentials: SignInData): Observable<any> {
        return this._httpClient.post(environment.auth.signIn, credentials, { responseType: 'json' }).pipe(
            tap((responseFromApi: any) => {
                this.handleAuthenticationSuccess(responseFromApi);
            }),
            catchError((error) => {
                if (error.status === 409 && error.error && error.error.token && error.error.passwordExpired) {
                    this.handleAuthenticationSuccess(error.error);
                    return of(error.error);
                }
                return throwError(() => error);
            })
        );
    }

    signOut(): Observable<any> {
        this.clearRefreshTimeout();
        this.clearLocalStorageAndState();
        return of(true);
    }

    check(): Observable<boolean> {
        if (this._checkRequest$) {
            return this._checkRequest$;
        }

        const token = this.getToken();

        if (!token) {
            this.signOut();
            return of(false);
        }

        this._checkRequest$ = this.refreshToken().pipe(
            map(() => true),
            catchError(() => {
                this.signOut();
                return of(false);
            }),
            shareReplay(1),
            finalize(() => {
                this._checkRequest$ = null;
            })
        );

        return this._checkRequest$;
    }

    refreshToken(): Observable<any> {
        if (this.isRefreshing) {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1)
            );
        } else {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this._httpClient.post<any>(environment.auth.refreshToken, {}).pipe(
                tap((response: any) => {
                    this.handleAuthenticationSuccess(response);
                    this.refreshTokenSubject.next(response.token);
                }),
                catchError((error) => {
                    this.signOut();
                    return throwError(() => error);
                }),
                finalize(() => {
                    this.isRefreshing = false;
                })
            );
        }
    }

    hasPermission(permission?: string): boolean {
        if (!environment.production) {
            return true;
        }
        if (!permission) {
            return true;
        }
        return this._userPermissions.has(permission);
    }

    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(environment.auth.forgotPassword, { email });
    }

    resetPassword(data: any): Observable<any> {
        return this._httpClient.post(environment.auth.resetPassword, data);
    }

    signUp(data: any): Observable<any> {
        return this._httpClient.post(environment.auth.signUp, data);
    }

    unlockSession(data: { email: string; password: string }): Observable<any> {
        return this.signIn({ username: data.email, password: data.password });
    }

    changePassword(data: any): Observable<any> {
        return this._httpClient.post(environment.auth.changePassword, data);
    }

    private handleAuthenticationSuccess(responseFromApi: any): void {
        const accessToken = responseFromApi.token;
        const refreshTokenValue = responseFromApi.refreshToken;

        if (!accessToken || typeof accessToken !== 'string') {
            console.error('La respuesta de la API no contiene un "token" válido.', responseFromApi);
            throw new Error('Respuesta de autenticación inválida.');
        }

        const emailNotSpecified = this._i18nService.getDictionary('fwk')?.translate?.('auth_email_not_specified') ?? 'auth_email_not_specified';

        let permisosProcesados: string[] = [];

        if (responseFromApi.permissions && Array.isArray(responseFromApi.permissions)) {
            permisosProcesados = responseFromApi.permissions.map((p: any) => p.code || p);
        } else if (responseFromApi.permisos) {
            if (Array.isArray(responseFromApi.permisos)) {
                permisosProcesados = responseFromApi.permisos;
            } else if (typeof responseFromApi.permisos === 'string') {
                permisosProcesados = responseFromApi.permisos.split(';');
            }
        }

        const userForFuse: User = {
            id: responseFromApi.guid,
            name: responseFromApi.name || responseFromApi.username,
            email: responseFromApi.email || emailNotSpecified,
            avatar: null,
            status: 'online',
            permisos: permisosProcesados,
            refreshToken: refreshTokenValue || accessToken,
            username: responseFromApi.username,
            passwordExpired: responseFromApi.passwordExpired
        };

        this.setToken(accessToken);
        this.setUser(userForFuse);

        this._authenticated.next(true);
        this._userService.user = userForFuse;
        this._userPermissions = new Set(userForFuse.permisos);

        this.scheduleTokenRenewal(accessToken);
    }

    private clearLocalStorageAndState(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_DATA_KEY);
        this._authenticated.next(false);
        this._userService.user = { id: '', name: '', email: '' };
        this._userPermissions.clear();
    }
    
    private scheduleTokenRenewal(token: string): void {
        this.clearRefreshTimeout();

        const user = this.getUserFromLocalStorage();
        if (user?.passwordExpired) {
            return;
        }

        const expiryDate = this.getTokenExpirationDate(token);
        if (!expiryDate) {
            return;
        }

        const now = Date.now();
        const expiresAt = expiryDate.valueOf();
        const msUntilExpiry = expiresAt - now;

        if (msUntilExpiry <= 5000) {
            return;
        }

        let refreshDelay = msUntilExpiry - 60000;

        if (refreshDelay <= 0) {
            refreshDelay = msUntilExpiry / 2;
        }

        this._refreshTimeout = setTimeout(() => {
            this.refreshToken().subscribe();
        }, refreshDelay);
    }

    private clearRefreshTimeout(): void {
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = null;
        }
    }

    private getTokenExpirationDate(token: string): Date | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (!payload.exp) return null;

            const date = new Date(0);
            date.setUTCSeconds(payload.exp);
            return date;
        } catch (e) {
            return null;
        }
    }

    getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
    private setToken(token: string): void { localStorage.setItem(this.TOKEN_KEY, token); }
    private setUser(user: User): void { localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user)); }

    getUserFromLocalStorage(): User | null {
        const userData = localStorage.getItem(this.USER_DATA_KEY);
        if (!userData) return null;
        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('Error al leer datos de usuario de localStorage', e);
            return null;
        }
    }
}