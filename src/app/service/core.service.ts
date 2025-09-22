import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  shareReplay,
  tap,
} from 'rxjs';
import { environment } from '../environments/environment';
import {
  ChannelClient,
  MappingClient,
  TemplateMessageClient,
} from '../proxy/Integration';
import { FormGroup } from '@angular/forms';
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

interface FormData {
  form: FormGroup;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  dataSubject = new BehaviorSubject<IEnumItem[]>([]);
  private dataListCache$: Observable<any> | null = null;

  private formSubject = new BehaviorSubject<FormData | null>(null);
  form$ = this.formSubject.asObservable();

  constructor(
    private http: HttpClient,
    private channelClient: ChannelClient,
    private mappingClient: MappingClient,
    private templateMessage: TemplateMessageClient
  ) {}

  fetchData(): Observable<IEnumItem[]> {
    return this.http
      .get<IEnumItem[]>(`${environment.enumUrl}/app.startup.information`)
      .pipe(
        tap((response) => {
          this.dataSubject.next(response);
        })
      );
  }

  getDataList(channelId: string): Observable<any> {
    if (!this.dataListCache$) {
      this.dataListCache$ = combineLatest({
        templateMessageList: this.templateMessage.geList(
          undefined,
          undefined,
          undefined
        ),
        channel: this.channelClient.getById(channelId),
      }).pipe(shareReplay(1));
    }
    return this.dataListCache$;
  }

  clearEnumCache(): void {
    this.dataSubject.next([]);
  }

  clearDataListCache(): void {
    this.dataListCache$ = null;
  }

  // Form service
  setForm(form: FormGroup, type: string) {
    this.formSubject.next({ form, type });
  }

  getForm(): FormData | null {
    return this.formSubject.getValue();
  }

  resetForm() {
    this.formSubject.next(null);
  }
}
