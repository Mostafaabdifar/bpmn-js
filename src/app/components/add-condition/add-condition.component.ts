import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PropertyValueCondition } from '../../proxy/Integration';
import { CoreService, ValueItem } from '../../service/core.service';
import { HelpService } from '../../service/help.service';
import { SelectJsonTreeComponent } from '../select-json-tree/select-json-tree.component';

@Component({
  selector: 'app-add-condition',
  templateUrl: './add-condition.component.html',
  styleUrl: './add-condition.component.scss',
  standalone: true,
  imports: [
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
  ) {
    this.coreService.dataSubject.subscribe((data) => {
      this.conditionOperationTypes = data.find(
        (item) => item.name === 'ConditionOperation'
      )?.valueItems!;
    });
  }

  ngOnInit(): void {
    try {
      this.templateMessageJson = typeof this.templateMessageJson === 'string'
        ? JSON.parse(this.templateMessageJson)
        : this.templateMessageJson;
    } catch {
      this.templateMessageJson = {};
    }
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
    this.addCondition.emit(undefined);
  }

  onSubmit(): void {
    this.addCondition.emit(this.condition);
  }
}
