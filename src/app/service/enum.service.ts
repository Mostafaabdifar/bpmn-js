import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from '../environments/environment';
export interface IEnumItem {
  name: string;
  title: string;
  filterName: string | null;
  valueItems: ValueItem[];
}

export interface ValueItem {
  key: string;
  title: string;
  value: number;
  icon: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class EnumService {
  dataSubject = new BehaviorSubject<IEnumItem[]>([]);

  constructor(private http: HttpClient) {}
  fetchData(): Observable<IEnumItem[]> {
    return this.http
      .get<IEnumItem[]>(`${environment.enumUrl}/app.startup.information`)
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
        })
      );
  }
}
