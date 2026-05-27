import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FWK_CONFIG } from '@fwk/model/fwk-config';

@Component({
    selector: 'fwk-logo',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div [class]="finalContainerClass" class="flex items-center gap-2">
            <img [src]="logoUrl" 
                 [class]="finalImgClass" 
                 [alt]="fwkConfig.appName">

            <h1 *ngIf="finalShowName" 
                [class]="finalNameClass">
                {{ fwkConfig.appName }}
            </h1>
        </div>
    `
})
export class LogoComponent {
    public fwkConfig = inject(FWK_CONFIG);

    @Input() size: 'normal' | 'small' = 'normal';
    @Input() type: 'normal' | 'icon' = 'normal';
    @Input() showName?: boolean;

    @Input() containerClass?: string;
    @Input() imgClass?: string;
    @Input() nameClass?: string;

    get finalShowName(): boolean {
        if (this.type === "icon") {
            return false;
        }

        return this.showName ?? this.fwkConfig.logoConfig?.showName ?? false;
    }

    get finalContainerClass(): string {
        if (this.type === "icon") {
            return '';
        }
        return this.containerClass ?? this.fwkConfig.logoConfig?.containerClass ?? '';
    }

    get finalImgClass(): string {
        return this.imgClass ?? this.fwkConfig.logoConfig?.imgClass ?? 'h-10';
    }

    get finalNameClass(): string {
        return this.nameClass ?? this.fwkConfig.logoConfig?.nameClass ?? 'text-xl font-bold';
    }

    get logoUrl(): string {
        return this.size === 'small'
            ? (this.fwkConfig.appLogoSmall || this.fwkConfig.appLogo)
            : this.fwkConfig.appLogo;
    }
}