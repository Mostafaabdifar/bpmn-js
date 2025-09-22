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
  selector: 'app-end-event-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './end-event-form.html',
  styleUrl: './end-event-form.scss',
})
export class EndEventForm {
  completeForm: FormGroup;
  constructor(private fb: FormBuilder, private coreService: CoreService) {
    this.completeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });

    this.coreService.setForm(this.completeForm, 'EndEvent');
  }
}
