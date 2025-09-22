import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  PropertyExpectedValue,
  PropertyValueCondition,
  TemplateMessageDto,
} from '../../../proxy/Integration';
import { CoreService, ValueItem } from '../../../service/core.service';
import { AddConditionComponent } from '../../add-condition/add-condition.component';
import { SelectJsonTreeComponent } from '../../select-json-tree/select-json-tree.component';

@Component({
  selector: 'app-exclusive-gateway-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    SelectJsonTreeComponent,
    AddConditionComponent,
  ],
  templateUrl: './exclusive-gateway-form.html',
  styleUrl: './exclusive-gateway-form.scss',
})
export class ExclusiveGatewayForm {
  conditionForm: FormGroup;
  showConditionForm: boolean = false;
  openAddConditionDialog: boolean = false;
  templateMessage!: TemplateMessageDto;
  templateMessageJson: any;
  conditionValue!: number;
  selectedKey!: string;
  statusList = [
    200, 201, 202, 204, 400, 403, 404, 405, 500, 501, 502, 503, 504,
  ];

  channelId: string = '91eff4bb-805e-441a-83be-bfb85e17c11e';

  templateMessageList: TemplateMessageDto[] = [];
  conditions: PropertyValueCondition[] = [];
  expectedValues: PropertyExpectedValue[] = [];

  ConditionRelationshipTypes: ValueItem[] = [];
  ConditionResolverTypes: ValueItem[] = [];
  conditionOperationTypes: ValueItem[] = [];

  announcer = inject(LiveAnnouncer);

  constructor(private fb: FormBuilder, private coreService: CoreService) {
    this.conditionForm = this.fb.group({
      name: ['', Validators.required],
      conditionResolverType: ['', Validators.required],
      statusItemList: [[''], Validators.required],
      statusItem: ['', Validators.required],
      statusName: ['', Validators.required],
      statusRangeFrom: ['', Validators.required],
      statusRangeTo: ['', Validators.required],
      templateMessageItem: [''],
      actions: [''],
      conditionRelationship: [null],
      description: [''],
      property: [''],
      conditions: [''],
      values: this.fb.array<string>([]),
      expected: [false],
      expectedValues: [''],
      type: [0],
    });

    let lastValue: any = null;
    this.conditionForm
      .get('conditionResolverType')
      ?.valueChanges.subscribe((value) => {
        this.showConditionForm = true;

        if (lastValue !== null && value !== lastValue) {
          this.conditionForm.reset({}, { emitEvent: false });
          this.conditionForm
            .get('conditionResolverType')
            ?.setValue(value, { emitEvent: false });
        }

        lastValue = value;
        this.conditionValue = value;
        this.conditionForm.get('type')?.setValue(this.conditionValue);
      });

    this.conditionForm
      .get('templateMessageItem')
      ?.valueChanges.subscribe((value) => {
        this.templateMessage = value;
        this.templateMessageJson = JSON.parse(
          this.templateMessage.json ?? '{}'
        );
      });

    this.conditionForm.get('values')?.valueChanges.subscribe(() => {
      const expectedValues = this.buildExpectedValues().map((v) => ({
        value: v.value,
      }));
      this.conditionForm.get('expectedValues')?.setValue(expectedValues, {
        emitEvent: false,
      });
    });

    this.coreService.setForm(this.conditionForm, 'ExclusiveGateway');
  }

  ngOnInit(): void {
    this.coreService.dataSubject.subscribe((data) => {
      this.ConditionResolverTypes =
        data.find((item) => item.name === 'ConditionResolverType')
          ?.valueItems ?? [];
      this.ConditionRelationshipTypes =
        data.find((item) => item.name === 'ConditionRelationshipType')
          ?.valueItems ?? [];
      this.conditionOperationTypes =
        data.find((item) => item.name === 'ConditionOperation')?.valueItems ??
        [];
    });

    this.coreService.getDataList(this.channelId).subscribe((response) => {
      this.templateMessageList = response.templateMessageList.items!;
    });
  }

  private buildExpectedValues(): PropertyExpectedValue[] {
    return this.valuesArray.controls.map((control) => {
      const value = new PropertyExpectedValue();
      value.init({ value: control.value });
      return value;
    });
  }

  get valuesArray(): FormArray {
    return this.conditionForm.get('values') as FormArray;
  }

  selectKey(key: string): void {
    this.selectedKey = key;
    this.conditionForm.get('property')?.setValue(key);
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.valuesArray.push(this.fb.control(value));
    }
    event.chipInput!.clear();
  }

  removeKeyword(keyword: string): void {
    const index = this.valuesArray.value.indexOf(keyword);
    if (index >= 0) {
      this.valuesArray.removeAt(index);
      this.announcer.announce(`removed ${keyword}`);
    }
  }

  getConditionTypeName(value: any): string {
    return (
      this.conditionOperationTypes.find((item) => item.value === value)
        ?.title ?? ''
    );
  }

  addCondition(condition: PropertyValueCondition | undefined): void {
    if (condition) {
      this.conditions.push(condition);
    }
    this.openAddConditionDialog = false;
  }

  onDeleteConditionClick(index: number): void {
    this.conditions.splice(index, 1);
  }
}
