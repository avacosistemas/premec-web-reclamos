import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RatingComponent } from './rating.component';

@Component({
  selector: 'fwk-rating-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, RatingComponent],
  template: `
    <div class="flex flex-col p-6">
      <div mat-dialog-title class="flex items-center justify-center">
        <span class="text-3xl font-semibold">{{ title }}</span>
      </div>

      <div mat-dialog-content class="flex flex-col justify-center gap-6">
        <div [innerHTML]="message" class="text-lg text-center"></div>
        <div class="flex justify-center w-full">
          <fwk-rating [maxStars]="maxStars" [(value)]="rating"></fwk-rating>
        </div>
      </div>

      <div mat-dialog-actions class="flex items-center justify-center space-x-2">
        <button mat-button (click)="onCancel()">
          Cancelar
        </button>
        <button mat-flat-button color="accent" [disabled]="rating === 0" (click)="onSubmit()">
          Aceptar
        </button>
      </div>
    </div>
  `
})
export class RatingDialogComponent {
  rating = 0;
  maxStars = 4;
  title = 'Valorar';
  message = 'Por favor, califique la calidad de la atención recibida.';

  constructor(
    public dialogRef: MatDialogRef<RatingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data?.maxStars) {
      this.maxStars = data.maxStars;
    }
    if (data?.title) {
      this.title = data.title;
    }
    if (data?.message) {
      this.message = data.message;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.rating);
  }
}
