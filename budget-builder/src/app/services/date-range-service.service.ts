import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateRangeService {
  startMonth = signal('2024-01');
  endMonth = signal('2024-12');

  get months() {
    const months = [];
    let date = new Date(this.startMonth());
    const end = new Date(this.endMonth());
    while (date <= end) {
      months.push(
        date.toLocaleString('default', { month: 'long', year: 'numeric' })
      );
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  }
}
