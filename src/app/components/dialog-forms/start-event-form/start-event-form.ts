import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CoreService } from '../../../service/core.service';

@Component({
  selector: 'app-start-event-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './start-event-form.html',
  styleUrl: './start-event-form.scss',
})
export class StartEventForm {
  startForm: FormGroup;
  constructor(private fb: FormBuilder, private coreService: CoreService) {
    this.startForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });

    this.coreService.setForm(this.startForm, 'StartEvent');
  }
}
