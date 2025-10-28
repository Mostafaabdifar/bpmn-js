import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typeTransfer',
})
export class TypeTransferPipe implements PipeTransform {
  private transferMap: { [key: string]: string } = {
    StartEvent: 'مسیر شروع',
    EndEvent: 'مسیر نهایی',
    CustomEndEvent: 'مسیر خطا',
    ExclusiveGateway: 'مسیر شرطی',
    CustomTask: 'مسیر نگاشت',
    Task: 'فراخوانی API',
  };

  transform(value: string): string {
    if (!value) return '';
    return this.transferMap[value] || value;
  }
}
