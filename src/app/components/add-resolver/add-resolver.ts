import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
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
import { SelectJsonTreeComponent } from '../select-json-tree/select-json-tree.component';
import {
  ConditionResolverItem,
  HttpStatusRangeCode,
  PropertyExpectedValue,
  PropertyValueCondition,
  TemplateMessageDto,
} from '../../proxy/Integration';
import { CoreService, ValueItem } from '../../service/core.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AddConditionComponent } from '../add-condition/add-condition.component';

@Component({
  selector: 'app-add-resolver',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    SelectJsonTreeComponent,
    AddConditionComponent,
  ],
  templateUrl: './add-resolver.html',
  styleUrl: './add-resolver.scss',
})
export class AddResolver implements OnInit {
  @Input() conditionValue!: number;
  @Output() addResolver = new EventEmitter<ConditionResolverItem>();

  resolverForm: FormGroup;

  channelId: string = '91eff4bb-805e-441a-83be-bfb85e17c11e';
  templateMessage!: TemplateMessageDto;
  templateMessageJson: any;
  resolver = new ConditionResolverItem();
  templateMessageList: TemplateMessageDto[] = [];
  conditions: PropertyValueCondition[] = [];

  ConditionRelationshipTypes: ValueItem[] = [];
  conditionOperationTypes: ValueItem[] = [];

  selectedKey!: string;
  openAddConditionDialog: boolean = false;

  statusList = [
    200, 201, 202, 204, 400, 403, 404, 405, 500, 501, 502, 503, 504,
  ];

  announcer = inject(LiveAnnouncer);

  constructor(private fb: FormBuilder, private coreService: CoreService) {
    this.resolverForm = this.fb.group({
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
      priority: [''],
      conditions: [''],
      values: this.fb.array<string>([]),
      expected: [false],
      expectedValues: [''],
      type: [0],
    });

    let lastValue: any = null;
    this.resolverForm
      .get('conditionResolverType')
      ?.valueChanges.subscribe((value) => {
        if (lastValue !== null && value !== lastValue) {
          this.resolverForm.reset({}, { emitEvent: false });
          this.resolverForm
            .get('conditionResolverType')
            ?.setValue(value, { emitEvent: false });
        }

        lastValue = value;
        this.conditionValue = value;
        this.resolverForm.get('type')?.setValue(this.conditionValue);
      });

    this.resolverForm
      .get('templateMessageItem')
      ?.valueChanges.subscribe((value) => {
        this.templateMessage = value;
        this.templateMessageJson = JSON.parse(
          this.templateMessage.json ?? '{}'
        );
      });

    this.resolverForm.get('values')?.valueChanges.subscribe(() => {
      const expectedValues = this.buildExpectedValues().map((v) => ({
        value: v.value,
      }));
      this.resolverForm.get('expectedValues')?.setValue(expectedValues, {
        emitEvent: false,
      });
    });
  }

  ngOnInit(): void {
    this.coreService.dataSubject.subscribe((data) => {
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
    return this.resolverForm.get('values') as FormArray;
  }
  selectKey(key: string): void {
    this.selectedKey = key;
    this.resolverForm.get('property')?.setValue(key);
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

  onCancel(): void {
    this.addResolver.emit(undefined);
  }

  onSubmit(): void {
    const get = (name: string) => this.resolverForm.get(name)?.value;

    Object.assign(this.resolver, {
      conditionRelationship: get('conditionRelationship'),
      type: get('type'),
      actions: get('actions'),
      conditions: this.conditions,
      expected: get('expected'),
      expectedIncomingHttpResponseStatuses: get('statusItemList'),
      expectedValues: get('expectedValues'),
      outgoingHttpResponseStatus: get('statusItem'),
      priority: get('priority'),
      property: get('property'),
      statusName: get('statusName'),
    });

    this.resolver.expectedIncomingHttpStatusRangeCode ??=
      new HttpStatusRangeCode();
    this.resolver.expectedIncomingHttpStatusRangeCode.to =
      get('statusRangeTo') ?? undefined;
    this.resolver.expectedIncomingHttpStatusRangeCode.from =
      get('statusRangeFrom') ?? undefined;

    this.addResolver.emit(this.resolver);
  }
}
