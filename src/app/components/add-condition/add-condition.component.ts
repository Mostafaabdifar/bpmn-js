import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';

import { CoreService, ValueItem } from '../../service/core.service';
import { PropertyValueCondition } from '../../proxy/Integration';
import { HelpService } from '../../service/help.service';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { SelectJsonTreeComponent } from '../select-json-tree/select-json-tree.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatOption,
  MatSelect,
  MatSelectModule,
} from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-condition',
  templateUrl: './add-condition.component.html',
  styleUrl: './add-condition.component.scss',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    SelectJsonTreeComponent,
  ],
})
export class AddConditionComponent {
  conditionOperationTypes: ValueItem[] = [];
  condition = new PropertyValueCondition();

  @Input() visible = false;
  @Input() templateMessageJson: any;
  @Output() hideDialog = new EventEmitter();
  @Output() addCondition = new EventEmitter<PropertyValueCondition>();

  constructor(
    private coreService: CoreService,
    private helpService: HelpService,
    public dialogRef: MatDialogRef<AddConditionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.coreService.dataSubject.subscribe((data) => {
      this.conditionOperationTypes = data.find(
        (item) => item.name === 'ConditionOperation'
      )?.valueItems!;
    });

    console.log(this.templateMessageJson);
  }

  ngOnInit(): void {
    this.templateMessageJson = JSON.parse(this.templateMessageJson);
  }

  selectKey(key: string) {
    this.condition.property = key;
  }

  onHideDialog() {
    this.visible = false;
    this.hideDialog.emit();
  }

  ngOnDestroy(): void {
    this.helpService.setActiveFieldTree('');
  }
  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    // this.dialogRef.close(this.condition);
    this.addCondition.emit(this.condition);
  }
}
