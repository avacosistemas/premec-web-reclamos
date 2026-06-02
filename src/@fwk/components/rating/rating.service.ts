import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RatingDialogComponent } from './rating-dialog.component';
import { ActionDef } from '../../model/component-def/action-def';
import { GenericHttpService } from '../../services/generic-http-service/generic-http.service';
import { SpinnerService } from '../../modules/spinner/service/spinner.service';
import { NotificationService } from '../../services/notification/notification.service';
import { I18nService } from '../../services/i18n-service/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private dialog = inject(MatDialog);
  private genericHttpService = inject(GenericHttpService);
  private spinnerService = inject(SpinnerService);
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);

  openRatingDialog(
    action: ActionDef,
    entity: any,
    maxStars: number,
    idKey: string,
    dictionaryName: string,
    onSuccess: () => void
  ): void {
    const title = action.titleKey 
      ? this.i18nService.translate(action.titleKey, dictionaryName) 
      : (action.title || 'Valorar');
      
    const message = action.confirmMessageKey 
      ? this.i18nService.translate(action.confirmMessageKey, dictionaryName) 
      : (action.confirmMessage || 'Por favor, califique la calidad de la atención recibida.');

    const dialogRef = this.dialog.open(RatingDialogComponent, {
      width: '350px',
      maxWidth: '95vw',
      panelClass: 'control-mat-dialog',
      data: {
        maxStars,
        title,
        message
      }
    });

    dialogRef.afterClosed().subscribe((rating: number | undefined) => {
      if (rating !== undefined && rating > 0) {
        if (action.ws && action.ws.url) {
          const spinner = this.spinnerService.getControlGlobalSpinner();
          spinner.show();
          const payload = {
            id: entity[idKey],
            valoracion: rating
          };
          this.genericHttpService.callWs(action.ws, payload).subscribe({
            next: () => {
              onSuccess();
              const successMsg = this.i18nService.translate('success_message', 'fwk');
              this.notificationService.notifySuccess(successMsg);
            },
            complete: () => {
              spinner.hide();
            }
          });
        } else {
          console.log('Valoración guardada (mock):', rating, 'para entidad:', entity);
          this.notificationService.notifySuccess('Valoración guardada (sin enviar, URL vacía)');
          entity.valoracion = rating;
          onSuccess();
        }
      }
    });
  }
}
