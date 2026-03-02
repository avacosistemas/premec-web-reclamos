import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '@fwk/services/i18n-service/i18n.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private i18nService = inject(I18nService);

  transform(key: string, args?: any, dictionaryName: string = 'fwk'): string {
    let params: any = {};
    let targetDictionary = dictionaryName;

    if (typeof args === 'object' && args !== null) {
      params = args;
    } else if (typeof args === 'string') {
      targetDictionary = args;
    }

    let translation = this.i18nService.translate(key, targetDictionary);

    if (params && translation) {
      Object.keys(params).forEach(paramKey => {
        const value = params[paramKey];
        const regex = new RegExp(`{{${paramKey}}}|{${paramKey}}`, 'g');
        translation = translation.replace(regex, value);
      });
    }

    return translation;
  }
}