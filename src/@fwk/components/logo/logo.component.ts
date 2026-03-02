import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FWK_CONFIG } from '@fwk/model/fwk-config';

@Component({
    selector: 'fwk-logo',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div [class]="containerClass" class="flex items-center gap-2">
            <img [src]="logoUrl" 
                 [class]="imgClass" 
                 [alt]="fwkConfig.appName">

            <h1 *ngIf="showName" 
                [class]="nameClass">
                {{ fwkConfig.appName }}
            </h1>
        </div>
    `
})
export class LogoComponent {
    public fwkConfig = inject(FWK_CONFIG);
    
    @Input() size: 'normal' | 'small' = 'normal';
    @Input() showName: boolean = false;

    @Input() containerClass: string = '';
    @Input() imgClass: string = 'h-10';
    @Input() nameClass: string = 'text-xl font-bold';

    get logoUrl(): string {
        return this.size === 'small' 
            ? (this.fwkConfig.appLogoSmall || this.fwkConfig.appLogo) 
            : this.fwkConfig.appLogo;
    }
}