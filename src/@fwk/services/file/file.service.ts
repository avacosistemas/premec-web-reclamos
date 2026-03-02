import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { ActionDef, ACTION_TYPES } from '../../model/component-def/action-def';
import { HTTP_METHODS } from '../../model/ws-def';
import { GenericHttpService } from '../generic-http-service/generic-http.service';
import { DialogService } from '../dialog-service/dialog.service';

interface FileEntity {
  file: string;
  fileName: string;
  fileUsername?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private localStorageService: LocalStorageService,
    private dialogService: DialogService,
    private genericHttpService: GenericHttpService
  ) { }

  downloadFileByAction(action: ActionDef, entity: Record<string, any>): Observable<void> {
    if (action.actionType !== ACTION_TYPES.file_download) {
      return of(undefined);
    }
    if (!action.ws) {
        console.error("Acción de descarga no tiene una definición de Web Service (ws).", action);
        return of(undefined);
    }
    const ws = this.localStorageService.clone(action.ws);
    ws.method = HTTP_METHODS.get;

    return this.genericHttpService.callWs(ws, entity).pipe(
      map((response: any) => {
        if (Array.isArray(response) && response.length > 0) {
          return response[0];
        }
        return response;
      }),
      tap((fileEntity: FileEntity) => this.downloadFileOctectStream(fileEntity)),
      map(() => undefined),
      catchError(error => throwError(() => error))
    );
  }

  previewFileByAction(action: ActionDef, entity: Record<string, any>): Observable<void> {
    if (action.actionType !== ACTION_TYPES.file_preview) {
      return of(undefined);
    }
    if (!action.ws) {
        console.error("Acción de previsualización no tiene una definición de Web Service (ws).", action);
        return of(undefined);
    }
    const ws = this.localStorageService.clone(action.ws);
    ws.method = HTTP_METHODS.get;

    return this.genericHttpService.callWs(ws, entity).pipe(
      map((response: any) => {
        if (Array.isArray(response) && response.length > 0) {
          return response[0];
        }
        return response;
      }),
      tap((fileEntity: FileEntity) => {
        const mimeType = this.getMimeType(fileEntity.fileName);
        const fileUrl = `data:${mimeType};base64,${fileEntity.file}`;
        this.dialogService.openFilePreviewModal({
          url: fileUrl,
          fileName: fileEntity.fileName,
          fileUsername: fileEntity.fileUsername ?? ''
        });
      }),
      map(() => undefined),
      catchError(error => throwError(() => error))
    );
  }

  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  downloadFileOctectStream(fileEntity: FileEntity): void {
    const decodedData = atob(fileEntity.file);
    const byteNumbers = new Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
      byteNumbers[i] = decodedData.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: this.getMimeType(fileEntity.fileName) });
    this._downloadBlob(blob, fileEntity.fileName);
  }

  createAndDownloadBlobFile(body: any, options: BlobPropertyBag | undefined, filename: string): void {
    const blob = new Blob([body], options);
    this._downloadBlob(blob, filename);
  }

  public downloadCsv(data: any[], exportFileName: string): void {
    if (!data || data.length === 0) return;
    const csvData = this.convertToCSV(data);
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' });
    this._downloadBlob(blob, this.createFileName(exportFileName));
  }

  private _downloadBlob(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  private convertToCSV(objArray: any[]): string {
    const headers = Object.keys(objArray[0]);
    const headerRow = headers.join(',');
    const rows = objArray.map(row =>
      headers.map(header => JSON.stringify(row[header])).join(',')
    );
    return `${headerRow}\r\n${rows.join('\r\n')}`;
  }

  private createFileName(exportFileName: string): string {
    const date = new Date();
    const dateString = date.toLocaleDateString('es-AR');
    const timeString = date.toLocaleTimeString('es-AR', { hour12: false });
    return `${exportFileName}_${dateString}_${timeString}.csv`;
  }
}