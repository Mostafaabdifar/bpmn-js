import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChannelClient, CreateChannelCommand } from '../../proxy/Integration';
export interface DialogData {
  typeAction: string;
}
@Component({
  selector: 'app-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatButtonModule,
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
  form: FormGroup;
  createChannelCommand = new CreateChannelCommand();

  constructor(private fb: FormBuilder, private channelclient: ChannelClient) {
    this.form = this.fb.group({
      companyName: ['', Validators.required],
      companyDescription: ['', Validators.required],
    });
  }

  onOkClick(): void {
    this.createChannelCommand.init({
      name: this.form.get('companyName')?.value,
      description: this.form.get('companyDescription')?.value,
    });
    if (this.form.valid) {
      this.channelclient.create(this.createChannelCommand).subscribe({
        next: () => {
          this.dialogRef.close(this.form.value);
        },
        error: () => {},
        complete: () => {},
      });
    }
  }
}
