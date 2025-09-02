import { Routes } from '@angular/router';
import { Bpmn } from './components/bpmn/bpmn';

export const routes: Routes = [
  {
    path: 'bpmn',
    component: Bpmn,
  },
  { path: '', redirectTo: '/bpmn', pathMatch: 'full' },
];
