import { Routes } from '@angular/router';
import { Bpmn } from './components/bpmn/bpmn';
import { Landing } from './components/landing/landing';
import { bpmnResolver } from './resolvers/bpmn-resolver';
import { channelListResolver } from './resolvers/channel-list-resolver';

export const routes: Routes = [
  {
    path: 'bpmn/:id',
    component: Bpmn,
    resolve: { data: bpmnResolver },
  },
  {
    path: 'channel-list',
    component: Landing,
    resolve: { data: channelListResolver },
  },
  { path: '', redirectTo: '/channel-list', pathMatch: 'full' },
];
