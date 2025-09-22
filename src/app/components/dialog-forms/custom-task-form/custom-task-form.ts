import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MappingClient,
  MessageWithMappingDto,
  MessageWithMappingListDto,
} from '../../../proxy/Integration';
import { CoreService } from '../../../service/core.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-custom-task-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './custom-task-form.html',
  styleUrl: './custom-task-form.scss',
})
export class CustomTaskForm implements OnInit {
  mapperForm: FormGroup;
  mappingId: string = '1d539f32-9210-4133-a8c5-e364388b54dd';
  messageMappingLists: MessageWithMappingDto[] = [];
  constructor(
    private fb: FormBuilder,
    private coreService: CoreService,
    private mapping: MappingClient
  ) {
    this.mapperForm = this.fb.group({
      name: ['', Validators.required],
      messageMappingId: ['', Validators.required],
      description: [''],
    });

    this.coreService.setForm(this.mapperForm, 'CustomTask');
  }

  ngOnInit(): void {
    this.mapping
      .getMessageWithMappingList(undefined, undefined, undefined)
      .subscribe({
        next: (res) => {
          this.messageMappingLists = res.items!;
          console.log(this.messageMappingLists);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
