import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
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
import { Observable } from 'rxjs';
import {
  AttachChannelPathApiCallingBasedCommand,
  AttachChannelPathCompleteBasedCommand,
  AttachChannelPathConditionBasedCommand,
  AttachChannelPathMapperBasedCommand,
  AttachChannelPathStartBasedCommand,
  ChannelClient,
  ChannelPathItem,
  MessageWithMappingDto,
  PropertyExpectedValue,
  PropertyValueCondition,
  TemplateMessageDto,
} from '../../proxy/Integration';
import { CoreService, ValueItem } from '../../service/core.service';
import { JsonPrettyPipe } from '../../service/json-pretty-pipe';
import { SelectJsonTreeComponent } from '../select-json-tree/select-json-tree.component';
import { AddConditionComponent } from '../add-condition/add-condition.component';
import { MatIconModule } from '@angular/material/icon';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LiveAnnouncer } from '@angular/cdk/a11y';
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
    MatIconModule,
    MatChipsModule,
    FormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    JsonPrettyPipe,
    SelectJsonTreeComponent,
    AddConditionComponent,
  ],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<Dialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  cache$: Observable<any> | null = null;

  startForm: FormGroup;
  apiForm: FormGroup;
  completeForm: FormGroup;
  mapperForm: FormGroup;
  conditionForm: FormGroup;

  attachAPiCall = new AttachChannelPathApiCallingBasedCommand();
  attachPathStart = new AttachChannelPathStartBasedCommand();
  attachComplete = new AttachChannelPathCompleteBasedCommand();
  attachMapper = new AttachChannelPathMapperBasedCommand();
  attachCondition = new AttachChannelPathConditionBasedCommand();

  channelId: string = '91eff4bb-805e-441a-83be-bfb85e17c11e';
  mappingId: string = '1d539f32-9210-4133-a8c5-e364388b54dd';

  HttpMethodTypes: ValueItem[] = [];
  AuthHttpTypes: ValueItem[] = [];
  ChannelPathCompletedTypes: ValueItem[] = [];
  ConditionRelationshipTypes: ValueItem[] = [];
  ConditionResolverTypes: ValueItem[] = [];
  conditionOperationTypes: ValueItem[] = [];
  channelResolverTypes: ValueItem[] = [];

  conditions: PropertyValueCondition[] = [];
  expectedValues: PropertyExpectedValue[] = [];

  templateMessageId: string = '';
  templateMessage!: TemplateMessageDto;
  templateMessageJson: any;
  templateMessageList: TemplateMessageDto[] = [];
  conditionValue!: number;
  channelPaths: ChannelPathItem[] = [];
  messageWithMappingList: MessageWithMappingDto[] = [];
  statusList = [
    200, 201, 202, 204, 400, 403, 404, 405, 500, 501, 502, 503, 504,
  ];
  showConditionForm: boolean = false;
  openAddConditionDialog: boolean = false;
  selectedKey!: string;
  announcer = inject(LiveAnnouncer);

  constructor(
    private fb: FormBuilder,
    private channelClient: ChannelClient,
    private coreService: CoreService
  ) {
    this.startForm = this.buildForm({
      name: ['', Validators.required],
      description: [''],
    });
    this.apiForm = this.buildForm({
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
    this.completeForm = this.buildForm({
      name: ['', Validators.required],
      description: [''],
    });
    this.mapperForm = this.buildForm({
      name: ['', Validators.required],
      messageMapping: ['', Validators.required],
      description: [''],
    });
    this.conditionForm = this.buildForm({
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
      });

    this.conditionForm
      .get('templateMessageItem')
      ?.valueChanges.subscribe((value) => {
        this.templateMessage = value;
        this.templateMessageJson = JSON.parse(
          this.templateMessage.json ?? '{}'
        );
      });
  }

  ngOnInit(): void {
    this.coreService.dataSubject.subscribe((data) => {
      this.HttpMethodTypes =
        data.find((item) => item.name === 'HttpMethodType')?.valueItems ?? [];
      this.AuthHttpTypes =
        data.find((item) => item.name === 'AuthHttpType')?.valueItems ?? [];
      this.ChannelPathCompletedTypes =
        data.find((item) => item.name === 'ChannelPathCompletedType')
          ?.valueItems ?? [];
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
      this.channelPaths = response.channel.paths!;
    });
  }

  private buildForm(config: { [key: string]: any }): FormGroup {
    return this.fb.group(config);
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

  onOkClick(): void {
    const type = this.data.typeAction;

    const configMap: Record<string, any> = {
      StartEvent: {
        form: this.startForm,
        initData: () => {
          return {
            description: this.startForm.get('companyDescription')?.value,
            channelId: this.channelId,
            name: this.startForm.get('companyName')?.value,
          };
        },
        attach: this.attachPathStart,
        service: this.channelClient.attachPathStartBased.bind(
          this.channelClient
        ),
      },
      Task: {
        form: this.apiForm,
        initData: () => {
          return {
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
          };
        },
        attach: this.attachAPiCall,
        service: this.channelClient.attachPathApiCallingBased.bind(
          this.channelClient
        ),
      },
      ExclusiveGateway: {
        form: this.conditionForm,
        initData: () => {
          if (this.valuesArray.length > 0) {
            this.expectedValues = [];
            this.valuesArray.controls.forEach((item) => {
              const value = new PropertyExpectedValue();
              value.init({ value: item.value });
              this.expectedValues.push(value);
            });
          }

          return {
            name: this.conditionForm.get('name')?.value,
            description: this.conditionForm.get('description')?.value,
            beforeChannelPathId: null,
            channelId: this.channelId,
            commandId: null,
            actions: null,
            resolvers: [
              {
                expectedIncomingHttpResponseStatuses:
                  this.conditionForm.get('statusItemList')?.value,
                outgoingHttpResponseStatus:
                  this.conditionForm.get('statusItem')?.value,
                actions: this.conditionForm.get('actions')?.value,
                statusName: this.conditionForm.get('statusName')?.value,
                conditionRelationship:
                  this.conditionForm.get('conditionRelationship')?.value ??
                  null,
                type: this.conditionValue,
                expectedIncomingHttpStatusRangeCode: {
                  from: this.conditionForm.get('statusRangeFrom')?.value,
                  to: this.conditionForm.get('statusRangeTo')?.value,
                },
                conditions: this.conditions.length ? this.conditions : null,
                property: this.conditionForm.get('property')?.value,
                expectedValues: this.buildExpectedValues().map((v) => ({
                  value: v.value,
                })),
                expected: this.conditionForm.get('expected')?.value,
              },
            ],
          };
        },
        attach: this.attachCondition,
        service: this.channelClient.attachPathConditionBased.bind(
          this.channelClient
        ),
      },
      CustomEndEvent: {
        form: this.completeForm,
        initData: () => {
          return {
            name: this.completeForm.get('name')?.value,
            description: this.completeForm.get('description')?.value,
            completedType: this.ChannelPathCompletedTypes.find(
              (i) => i.key === 'Failed'
            )?.value,
            channelId: this.channelId,
            beforeChannelPathId: null,
            commandId: null,
            actions: null,
          };
        },
        attach: this.attachComplete,
        service: this.channelClient.attachPathCompleteBased.bind(
          this.channelClient
        ),
      },
      CustomTask: {
        form: this.mapperForm,
        initData: () => {
          return {
            name: this.mapperForm.get('name')?.value,
            messageMappingId: this.mappingId,
            description: this.mapperForm.get('description')?.value,
            channelId: this.channelId,
            beforeChannelPathId: null,
            commandId: null,
            actions: null,
          };
        },
        attach: this.attachMapper,
        service: this.channelClient.attachPathMapperBased.bind(
          this.channelClient
        ),
      },
      EndEvent: {
        form: this.completeForm,
        initData: () => {
          return {
            name: this.completeForm.get('name')?.value,
            description: this.completeForm.get('description')?.value,
            completedType: this.ChannelPathCompletedTypes.find(
              (i) => i.key === 'Successed'
            )?.value,
            channelId: this.channelId,
            beforeChannelPathId: null,
            commandId: null,
            actions: null,
          };
        },
        attach: this.attachComplete,
        service: this.channelClient.attachPathCompleteBased.bind(
          this.channelClient
        ),
      },
    };

    const config = configMap[type];
    if (!config) return;

    config.attach.init(config.initData());

    if (config.form.valid && config.service) {
      config.service(config.attach).subscribe({
        next: (res: any) => {
          this.dialogRef.close({
            valueForm: config.form.value,
            type,
            pathId: res.pathId,
          });
        },
        error: (err: any) => console.error(err),
      });
    } else if (type === 'ExclusiveGateway') {
      console.log(config.attach);
      console.log(config.attach.resolvers);
    }
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

  addCondition(condition: PropertyValueCondition): void {
    if (condition) {
      this.conditions.push(condition);
      this.openAddConditionDialog = false;
    }
  }

  onDeleteConditionClick(index: number): void {
    this.conditions.splice(index, 1);
  }
}
