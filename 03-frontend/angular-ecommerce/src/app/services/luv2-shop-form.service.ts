import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  constructor() { }
  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];
    // build an array for month "startMonth" to "12"
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    // return as observable
    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];
    // build an array for year "currentYear" to "currentYear + 10"
    const startYear: number = new Date().getFullYear();
    for (let theYear = startYear; theYear <= startYear + 10; theYear++) {
      data.push(theYear);
    }
    // return as observable
    return of(data);
  }
}
