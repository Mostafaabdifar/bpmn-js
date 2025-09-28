import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ChannelClient } from '../proxy/Integration';
import { catchError, throwError } from 'rxjs';

export const bpmnResolver: ResolveFn<any> = (route, state) => {
  const channelClient = inject(ChannelClient);
  return channelClient.getById(route.params['id']).pipe(
    catchError((err) => {
      return throwError(() => new Error(err.error.message_code));
    })
  );
};
