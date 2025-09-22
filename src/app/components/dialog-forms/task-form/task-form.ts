import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CoreService, ValueItem } from '../../../service/core.service';
import { JsonPrettyPipe } from '../../../service/json-pretty-pipe';

@Component({
  selector: 'app-task-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    JsonPrettyPipe,
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm {
  apiForm: FormGroup;

  AuthHttpTypes: ValueItem[] = [];
  HttpMethodTypes: ValueItem[] = [];

  constructor(private fb: FormBuilder, private coreService: CoreService) {
    this.apiForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      baseUrl: ['', Validators.required],
      path: ['', Validators.required],
      httpMethodType: [0, Validators.required],
      timeout: [30, Validators.required],
      query: [''],
      body: [''],
      authHttpType: [0],
      authHttpValue: [''],
      httpHeaders: [''],
    });

    this.coreService.dataSubject.subscribe((data) => {
      this.HttpMethodTypes =
        data.find((item) => item.name === 'HttpMethodType')?.valueItems ?? [];
      this.AuthHttpTypes =
        data.find((item) => item.name === 'AuthHttpType')?.valueItems ?? [];
    });

    this.coreService.setForm(this.apiForm, 'Task');
  }
}
