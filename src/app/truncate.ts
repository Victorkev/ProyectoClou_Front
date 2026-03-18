import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number = 50, ellipsis: boolean = true): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    
    return ellipsis ? value.substring(0, limit) + '...' : value.substring(0, limit);
  }

}