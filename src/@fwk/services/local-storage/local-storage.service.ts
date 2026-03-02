import { Injectable } from '@angular/core';
import { I18n } from '../../model/i18n';

export interface UserCredentials {
    username: string;
    password?: string; 
}

export const LOGIN_FORM_USERDATA = 'LOGIN_FORM_USERDATA';
export const I18N_DATA = 'I18N_DATA';
export const TO_CLONE_DATA = 'TO_CLONE_DATA';
export const USER_DATA_FOR_FORCE_CHANGE_PASSWORD = 'USER_DATA_FOR_FORCE_CHANGE_PASSWORD';

@Injectable({
    providedIn: 'root' 
})
export class LocalStorageService {
    private tokenKey = 'jwt_token';
    private USER_DATA = 'currentUser';

    constructor() { }

    setTokenKey(tokenKey: string): void {
        this.tokenKey = tokenKey;
    }

    cleanTokenData(): void {
        localStorage.removeItem(this.tokenKey);
    }

    saveTokenData(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    getTokenData(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    cleanLoginFormUserData(): void {
        localStorage.removeItem(LOGIN_FORM_USERDATA);
    }

    saveLoginFormUserData(user: UserCredentials): void {
        localStorage.setItem(LOGIN_FORM_USERDATA, JSON.stringify(user));
    }

    getLoginFormUserData(): UserCredentials | null {
        const storedData = localStorage.getItem(LOGIN_FORM_USERDATA);
        return storedData ? JSON.parse(storedData) : null;
    }

    cleanUserDataForForceChangePassword(): void {
        localStorage.removeItem(USER_DATA_FOR_FORCE_CHANGE_PASSWORD);
    }

    saveUserDataForForceChangePassword(user: UserCredentials): void {
        localStorage.setItem(USER_DATA_FOR_FORCE_CHANGE_PASSWORD, JSON.stringify(user));
    }

    getUserDataForForceChangePassword(): UserCredentials | null {
        const storedData = localStorage.getItem(USER_DATA_FOR_FORCE_CHANGE_PASSWORD);
        return storedData ? JSON.parse(storedData) : null;
    }

    cleanI18nData(): void {
        localStorage.removeItem(I18N_DATA);
    }

    saveI18nData(i18n: I18n[]): void {
        localStorage.setItem(I18N_DATA, JSON.stringify(i18n));
    }

    getI18nData(): I18n[] | null {
        const storedData = localStorage.getItem(I18N_DATA);
        return storedData ? JSON.parse(storedData) : null;
    }

    cleanUserSession(): void {
        this.cleanUserDataForForceChangePassword();
        this.cleanTokenData();
        this.cleanI18nData();
    }

    clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    save(key: string, obj: any): void {
        localStorage.setItem(key, JSON.stringify(obj));
    }

    get<T>(key: string): T | null {
        const storedData = localStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : null;
    }

    remove(key: string): void {
        localStorage.removeItem(key);
    }

    getUserLocalStorage(): any {
        return this.get(this.USER_DATA);
    }
}