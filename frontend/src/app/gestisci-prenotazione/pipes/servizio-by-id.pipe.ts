import { Pipe, PipeTransform } from '@angular/core';
import { servizio } from '../interfacce/servizio_i';

@Pipe({
  name: 'servizioById',
  standalone: true,
  pure: false 
})
export class ServizioByIdPipe implements PipeTransform {
  transform(servizi: servizio[], id: number | null): servizio | undefined {
    if (!id || !servizi) return undefined;
    return servizi.find(s => s.IDSERVIZIO === +id);
  }
}
