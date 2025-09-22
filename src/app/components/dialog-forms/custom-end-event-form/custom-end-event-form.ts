import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CoreService, ValueItem } from '../../../service/core.service';

@Component({
  selector: 'app-custom-end-event-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './custom-end-event-form.html',
  styleUrl: './custom-end-event-form.scss',
})
export class CustomEndEventForm implements OnInit {
  completeForm: FormGroup;
  ChannelPathCompletedTypes: ValueItem[] = [];

  constructor(private fb: FormBuilder, private coreService: CoreService) {
    this.completeForm = this.fb.group({
      name: ['', Validators.required],
      completedType: [0, Validators.required],
      description: [''],
    });

    this.coreService.setForm(this.completeForm, 'CustomEndEvent');
  }

  ngOnInit(): void {
    this.coreService.dataSubject.subscribe((data) => {
      this.ChannelPathCompletedTypes =
        data.find((item) => item.name === 'ChannelPathCompletedType')
          ?.valueItems ?? [];
      this.completeForm
        .get('completedType')
        ?.setValue(
          this.ChannelPathCompletedTypes.find((i) => i.key === 'Failed')?.value
        );
    });
  }
}
