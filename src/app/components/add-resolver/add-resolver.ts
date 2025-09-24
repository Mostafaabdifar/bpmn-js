import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
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
import {
  BehaviorSubject,
  combineLatest,
  map,
  of,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import {
  ConditionResolverItem,
  HttpStatusRangeCode,
  PropertyExpectedValue,
  PropertyValueCondition,
  TemplateMessageDto,
} from '../../proxy/Integration';
import {
  CoreService,
  DialogActionButton,
  ValueItem,
} from '../../service/core.service';
import { AddConditionComponent } from '../add-condition/add-condition.component';
import { SelectJsonTreeComponent } from '../select-json-tree/select-json-tree.component';

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
  styleUrls: ['./add-resolver.scss'],
})
export class AddResolver implements OnInit, OnDestroy, OnChanges {
  @Input() conditionValue!: number;
  @Output() addResolver = new EventEmitter<ConditionResolverItem>();

  resolverForm: FormGroup;

  templateMessage!: TemplateMessageDto;
  templateMessageJson: any;
  resolver = new ConditionResolverItem();
  templateMessageList: TemplateMessageDto[] = [];
  conditions: PropertyValueCondition[] = [];

  ConditionRelationshipTypes: ValueItem[] = [];
  conditionOperationTypes: ValueItem[] = [];

  selectedKey!: string;
  private _openAddConditionDialog: boolean = false;
  get openAddConditionDialog(): boolean {
    return this._openAddConditionDialog;
  }
  set openAddConditionDialog(value: boolean) {
    this._openAddConditionDialog = value;
    this.openDialogState$.next(value);
    if (value) {
      const placeholder: DialogActionButton[] = [
        {
          id: 'back',
          label: 'بازگشت',
          color: 'warn',
          variant: 'stroked',
          click: () => (this.openAddConditionDialog = false),
        },
        {
          id: 'create-condition',
          label: 'ایجاد شرط',
          color: 'primary',
          variant: 'flat',
          disabled$: of(true),
          click: () => {},
        },
      ];
      this.coreService.setActions(placeholder);
    } else {
      this.updateActions();
    }
  }

  private openDialogState$ = new BehaviorSubject<boolean>(false);

  statusList = [
    200, 201, 202, 204, 400, 403, 404, 405, 500, 501, 502, 503, 504,
  ];

  announcer = inject(LiveAnnouncer);

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private coreService: CoreService) {
    this.resolverForm = this.fb.group({
      statusItemList: [[''], Validators.required],
      statusItem: [''],
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
      type: [this.conditionValue],
    });

    this.resolverForm
      .get('templateMessageItem')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.templateMessage = value;
        this.templateMessageJson = JSON.parse(
          this.templateMessage.json ?? '{}'
        );
      });

    this.resolverForm
      .get('values')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const expectedValues = this.buildExpectedValues().map((v) => ({
          value: v.value,
        }));
        this.resolverForm.get('expectedValues')?.setValue(expectedValues, {
          emitEvent: false,
        });
      });
  }

  ngOnInit(): void {
    this.coreService.dataSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.ConditionRelationshipTypes =
          data.find((item) => item.name === 'ConditionRelationshipType')
            ?.valueItems ?? [];
        this.conditionOperationTypes =
          data.find((item) => item.name === 'ConditionOperation')?.valueItems ??
          [];
      });

    const channelId = this.coreService.getChannelId();
    this.coreService
      .getDataList(channelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.templateMessageList = response.templateMessageList.items!;
      });

    this.updateActions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conditionValue'] && changes['conditionValue'].currentValue != null) {
      this.resolverForm?.get('type')?.setValue(changes['conditionValue'].currentValue);
      this.resolverForm?.get('type')?.updateValueAndValidity({ emitEvent: true });
    }
  }

  ngOnDestroy(): void {
    this.coreService.clearActions();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateActions() {
    const disabled$ = combineLatest([
      this.resolverForm.statusChanges.pipe(startWith(this.resolverForm.status)),
      this.openDialogState$,
    ]).pipe(
      map(() => this.resolverForm.invalid || this.openAddConditionDialog)
    );

    const actions: DialogActionButton[] = [
      {
        id: 'back',
        label: 'بازگشت',
        color: 'warn',
        variant: 'stroked',
        click: () => this.onCancel(),
      },
      {
        id: 'create',
        label: 'ایجاد resolver',
        color: 'primary',
        variant: 'flat',
        disabled$: disabled$,
        click: () => this.onSubmit(),
      },
    ];

    this.coreService.setActions(actions);
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
