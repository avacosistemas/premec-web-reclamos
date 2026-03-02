import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DashboardFilterOption } from '@fwk/model/component-def/dashboard-def';

@Component({
  selector: 'fwk-widget-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field class="ml-auto -mt-2 -mb-5" appearance="outline" subscriptSizing="dynamic">
        <mat-select [formControl]="filterControl">
            <mat-option *ngFor="let option of options" [value]="option.value">
                {{ option.viewValue }}
            </mat-option>
        </mat-select>
    </mat-form-field>
  `
})
export class WidgetFilterComponent implements OnInit {
  @Input() options: DashboardFilterOption[] = [];
  @Input() initialValue: string = 'all';
  @Output() filterChange = new EventEmitter<string>();
  
  filterControl: FormControl;

  ngOnInit(): void {
    this.filterControl = new FormControl(this.initialValue);
    this.filterControl.valueChanges.subscribe((value: string) => {
      this.filterChange.emit(value);
    });
  }
}