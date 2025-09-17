import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  AttachChannelPathApiCallingBasedCommand,
  AttachChannelPathCompleteBasedCommand,
  AttachChannelPathMapperBasedCommand,
  AttachChannelPathStartBasedCommand,
  ChannelClient,
} from '../../proxy/Integration';
import { EnumService, ValueItem } from '../../service/enum.service';
import { JsonPrettyPipe } from '../../service/json-pretty-pipe';
export interface DialogData {
  label: string;
  typeAction: string;
}
@Component({
  selector: 'app-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatButtonModule,
    MatDialogClose,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    JsonPrettyPipe,
  ],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<Dialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  startForm: FormGroup;
  apiForm: FormGroup;
  completeForm: FormGroup;
  mapperForm: FormGroup;
  attachAPiCall = new AttachChannelPathApiCallingBasedCommand();
  attachPathStart = new AttachChannelPathStartBasedCommand();
  attachComplete = new AttachChannelPathCompleteBasedCommand();
  attachMapper = new AttachChannelPathMapperBasedCommand();
  channelId: string = '91eff4bb-805e-441a-83be-bfb85e17c11e';
  mappingId: string = '1d539f32-9210-4133-a8c5-e364388b54dd';
  HttpMethodTypes: ValueItem[] = [];
  AuthHttpTypes: ValueItem[] = [];
  ChannelPathCompletedTypes: ValueItem[] = [];

  constructor(
    private fb: FormBuilder,
    private channelclient: ChannelClient,
    private enumService: EnumService
  ) {
    this.startForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
    this.apiForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      baseUrl: ['', Validators.required],
      path: ['', Validators.required],
      httpMethodType: [0, Validators.required],
      timeout: [0, Validators.required],
      query: ['', Validators.required],
      body: ['', Validators.required],
      authHttpType: [0, Validators.required],
      authHttpValue: ['', Validators.required],
      httpHeaders: ['', Validators.required],
    });
    this.completeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
    this.mapperForm = this.fb.group({
      name: ['', Validators.required],
      messageMapping: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.enumService.dataSubject.subscribe((data) => {
      this.HttpMethodTypes =
        data.find((item) => item.name === 'HttpMethodType')?.valueItems ?? [];
      this.AuthHttpTypes =
        data.find((item) => item.name === 'AuthHttpType')?.valueItems ?? [];
      this.ChannelPathCompletedTypes =
        data.find((item) => item.name === 'ChannelPathCompletedType')
          ?.valueItems ?? [];
    });
  }

  onOkClick(): void {
    const type = this.data.typeAction;
    if (type === 'StartEvent') {
      this.attachPathStart.init({
        name: this.startForm.get('companyName')?.value,
        description: this.startForm.get('companyDescription')?.value,
        channelId: this.channelId,
      });
      if (this.startForm.valid) {
        this.channelclient
          .attachPathStartBased(this.attachPathStart)
          .subscribe({
            next: (res) => {
              this.dialogRef.close({
                valueForm: this.startForm.value,
                type: type,
                pathId: res.pathId,
              });
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    } else if (type === 'Task') {
      this.attachAPiCall.init({
        name: this.apiForm.get('conditionLabel')?.value,
        description: this.apiForm.get('companyDescription')?.value,
        beforeChannelPathId: null,
        channelId: this.channelId,
        commandId: null,
        actions: null,
        api: {
          baseUrl: this.apiForm.get('baseUrl')?.value,
          path: this.apiForm.get('path')?.value,
          httpMethodType: this.apiForm.get('httpMethodType')?.value,
          timeout: this.apiForm.get('timeout')?.value,
          query: this.apiForm.get('query')?.value,
          body: this.apiForm.get('body')?.value,
          authHttpType: this.apiForm.get('authHttpType')?.value,
          authHttpValue: this.apiForm.get('authHttpValue')?.value,
          httpHeaders: this.apiForm.get('httpHeaders')?.value,
        },
      });
      if (this.apiForm.valid) {
        this.channelclient
          .attachPathApiCallingBased(this.attachAPiCall)
          .subscribe({
            next: (res) => {
              this.dialogRef.close({
                valueForm: this.apiForm.value,
                type: type,
                pathId: res.pathId,
              });
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    } else if (type === 'ExclusiveGateway') {
      this.dialogRef.close({
        valueForm: '',
        type: type,
      });
    } else if (type === 'IntermediateThrowEvent') {
      this.attachComplete.init({
        name: this.completeForm.get('name')?.value,
        description: this.completeForm.get('description')?.value,
        completedType: this.ChannelPathCompletedTypes.find(
          (item) => item.key === 'Failed'
        )?.value, //Failed process
        channelId: this.channelId,
        beforeChannelPathId: null,
        commandId: null,
        actions: null,
      });
      if (this.completeForm.valid) {
        this.channelclient
          .attachPathCompleteBased(this.attachComplete)
          .subscribe({
            next: (res) => {
              this.dialogRef.close({
                valueForm: this.completeForm.value,
                type: type,
                pathId: res.pathId,
              });
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    } else if (type === 'CustomTask') {
      this.attachMapper.init({
        name: this.mapperForm.get('name')?.value,
        messageMappingId: this.mappingId,
        description: this.mapperForm.get('description')?.value,
        channelId: this.channelId,
        beforeChannelPathId: null,
        commandId: null,
        actions: null,
      });
      if (this.mapperForm.valid) {
        this.channelclient.attachPathMapperBased(this.attachMapper).subscribe({
          next: (res) => {
            this.dialogRef.close({
              valueForm: this.mapperForm.value,
              type: type,
              pathId: res.pathId,
            });
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    } else if (type === 'EndEvent') {
      this.attachComplete.init({
        name: this.completeForm.get('name')?.value,
        description: this.completeForm.get('description')?.value,
        completedType: this.ChannelPathCompletedTypes.find(
          (item) => item.key === 'Successed'
        )?.value, //Successed process
        channelId: this.channelId,
        beforeChannelPathId: null,
        commandId: null,
        actions: null,
      });
      if (this.completeForm.valid) {
        this.channelclient
          .attachPathCompleteBased(this.attachComplete)
          .subscribe({
            next: (res) => {
              this.dialogRef.close({
                valueForm: this.completeForm.value,
                type: type,
                pathId: res.pathId,
              });
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    }
  }
}
