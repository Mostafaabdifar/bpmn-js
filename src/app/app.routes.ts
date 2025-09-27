import { Routes } from '@angular/router';
import { Bpmn } from './components/bpmn/bpmn';
import { Landing } from './components/landing/landing';

export const routes: Routes = [
  { path: 'bpmn/:id', component: Bpmn },
  { path: 'channel-list', component: Landing },
  { path: '', redirectTo: '/channel-list', pathMatch: 'full' },
];
