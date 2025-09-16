import { Component, inject } from '@angular/core';
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
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  AttachChannelPathApiCallingBasedCommand,
  ChannelClient,
  CreateChannelCommand,
} from '../../proxy/Integration';
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
  ],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  readonly dialogRef = inject(MatDialogRef<Dialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  startForm: FormGroup;
  apiForm: FormGroup;
  createChannelCommand = new CreateChannelCommand();
  attachAPiCall = new AttachChannelPathApiCallingBasedCommand();
  beforePathId: string = '';
  channelId: string = '91eff4bb-805e-441a-83be-bfb85e17c11e';

  constructor(private fb: FormBuilder, private channelclient: ChannelClient) {
    this.startForm = this.fb.group({
      companyName: ['', Validators.required],
      companyDescription: [''],
    });
    this.apiForm = this.fb.group({
      conditionLabel: ['', Validators.required],
      companyDescription: [''],
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

    if (this.data.label) {
      this.startForm.get('companyName')?.setValue(this.data.label);
    }
  }

  onOkClick(): void {
    if (this.data.typeAction === 'StartEvent') {
      this.createChannelCommand.init({
        name: this.startForm.get('companyName')?.value,
        description: this.startForm.get('companyDescription')?.value,
      });
      if (this.startForm.valid) {
        this.channelclient.create(this.createChannelCommand).subscribe({
          next: (res) => {
            this.beforePathId = res.id!;
            this.dialogRef.close({
              valueForm: this.startForm.value,
              type: this.data.typeAction,
            });
          },
          error: () => {},
          complete: () => {},
        });
      }
    } else if (this.data.typeAction === 'Task') {
      this.attachAPiCall.init({
        name: this.apiForm.get('conditionLabel')?.value,
        description: this.apiForm.get('companyDescription')?.value,
        beforeChannelPathId: this.beforePathId,
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
                type: this.data.typeAction,
              });
            },
            error: () => {},
            complete: () => {},
          });
      }
    }
  }
}
