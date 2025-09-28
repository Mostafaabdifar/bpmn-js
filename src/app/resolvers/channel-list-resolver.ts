import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ChannelClient, ChannelListDto } from '../proxy/Integration';
import { catchError, throwError } from 'rxjs';

export const channelListResolver: ResolveFn<ChannelListDto> = (
  route,
  state
) => {
  const channelClient = inject(ChannelClient);
  return channelClient.getList(undefined, undefined, undefined).pipe(
    catchError((err) => {
      return throwError(() => new Error(err.error.message_code));
    })
  );
};
