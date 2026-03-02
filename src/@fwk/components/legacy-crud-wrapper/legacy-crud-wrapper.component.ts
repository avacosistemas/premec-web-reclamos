import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CrudComponent } from '@fwk/components/crud/crud.component';
import { CrudDef } from '@fwk/model/component-def/crud-def';
import { BaseCrudService } from '@fwk/services/base-crud-service/base.crud.service';
import { GenericHttpService } from '@fwk/services/generic-http-service/generic-http.service';

@Component({
  selector: 'fwk-legacy-crud-wrapper',
  template: `
  <div class="flex flex-col flex-auto min-w-0" *ngIf="crudDef">
    <div class="bg-white dark:bg-transparent flex-auto">
      <fwk-crud 
        [componentName]="crudDef.name"
        [crudDefinition]="crudDef"> 
      </fwk-crud>
    </div>
  </div>
  `,
  standalone: true,
  imports: [CommonModule, CrudComponent],
  providers: [GenericHttpService, BaseCrudService]
})
export class LegacyCrudWrapperComponent implements OnInit {

  crudDef: CrudDef | null = null;

  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.crudDef = this.route.snapshot.data['definition'];

    if (!this.crudDef) {
      console.error('[LegacyCrudWrapper] No se pudo obtener CrudDef desde los datos de la ruta. Asegúrate de que el resolver esté configurado.');
    }

    this.cdr.markForCheck();
  }
}