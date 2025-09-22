import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  AttachChannelPathApiCallingBasedCommand,
  AttachChannelPathCompleteBasedCommand,
  AttachChannelPathConditionBasedCommand,
  AttachChannelPathMapperBasedCommand,
  AttachChannelPathStartBasedCommand,
  ChannelClient,
  PropertyExpectedValue,
  PropertyValueCondition,
} from '../../proxy/Integration';
import { CoreService, ValueItem } from '../../service/core.service';
import { CustomTaskForm } from '../dialog-forms/custom-task-form/custom-task-form';
import { EndEventForm } from '../dialog-forms/end-event-form/end-event-form';
import { ExclusiveGatewayForm } from '../dialog-forms/exclusive-gateway-form/exclusive-gateway-form';
import { StartEventForm } from '../dialog-forms/start-event-form/start-event-form';
import { TaskForm } from '../dialog-forms/task-form/task-form';
import { CustomEndEventForm } from '../dialog-forms/custom-end-event-form/custom-end-event-form';
export interface DialogData {
  label: string;
  typeAction: string;
}
@Component({
  selector: 'app-dialog',
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatButtonModule,
    MatDialogClose,
    NgComponentOutlet,
  ],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<Dialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  cache$: Observable<any> | null = null;
  childForm!: FormGroup;
  FormComponent: any;
  private formMap: Record<string, any> = {
    StartEvent: StartEventForm,
    Task: TaskForm,
    ExclusiveGateway: ExclusiveGatewayForm,
    EndEvent: EndEventForm,
    CustomTask: CustomTaskForm,
    CustomEndEvent: CustomEndEventForm,
  };
  formType!: string;

  attachAPiCall = new AttachChannelPathApiCallingBasedCommand();
  attachPathStart = new AttachChannelPathStartBasedCommand();
  attachComplete = new AttachChannelPathCompleteBasedCommand();
  attachMapper = new AttachChannelPathMapperBasedCommand();
  attachCondition = new AttachChannelPathConditionBasedCommand();

  channelId: string = '91eff4bb-805e-441a-83be-bfb85e17c11e';

  conditions: PropertyValueCondition[] = [];
  expectedValues: PropertyExpectedValue[] = [];

  conditionValue!: number;

  constructor(
    private channelClient: ChannelClient,
    public coreService: CoreService,
    private cdr: ChangeDetectorRef
  ) {
    this.FormComponent = this.formMap[this.data.typeAction] || null;
  }

  ngOnInit(): void {
    this.coreService.form$.subscribe((data) => {
      this.childForm = data?.form!;
      this.formType = data?.type!;
      this.cdr.detectChanges();
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
    return this.childForm.value['values'] as FormArray;
  }

  onOkClick() {
    console.log('فرم فرزند:', this.childForm.value);
    console.log('تایپ:', this.formType);
    const type = this.formType;
    const configMap: Record<string, any> = {
      StartEvent: {
        initData: {
          name: this.childForm.value['name'],
          description: this.childForm.value['description'],
          channelId: this.channelId,
        },
        attach: this.attachPathStart,
        service: this.channelClient.attachPathStartBased.bind(
          this.channelClient
        ),
      },
      Task: {
        initData: {
          name: this.childForm.value['name'],
          description: this.childForm.value['description'],
          beforeChannelPathId: null,
          channelId: this.channelId,
          commandId: null,
          actions: null,
          api: {
            baseUrl: this.childForm.value['baseUrl'],
            path: this.childForm.value['path'],
            httpMethodType: this.childForm.value['httpMethodType'],
            timeout: this.childForm.value['timeout'],
            query: this.childForm.value['query'],
            body: this.childForm.value['body'],
            authHttpType: this.childForm.value['authHttpType'],
            authHttpValue: this.childForm.value['authHttpValue'],
            httpHeaders: this.childForm.value['httpHeaders'],
          },
        },
        attach: this.attachAPiCall,
        service: this.channelClient.attachPathApiCallingBased.bind(
          this.channelClient
        ),
      },
      ExclusiveGateway: {
        initData: {
          name: this.childForm.value['name'],
          description: this.childForm.value['description'],
          channelId: this.channelId,
          beforeChannelPathId: null,
          commandId: null,
          actions: null,
          resolvers: [
            {
              expectedIncomingHttpResponseStatuses:
                this.childForm.value['statusItemList'],
              outgoingHttpResponseStatus: this.childForm.value['statusItem'],
              actions: this.childForm.value['actions'],
              statusName: this.childForm.value['statusName'],
              conditionRelationship:
                this.childForm.value['conditionRelationship'],
              type: this.childForm.value['type'],
              expectedIncomingHttpStatusRangeCode: {
                from: this.childForm.value['statusRangeFrom'],
                to: this.childForm.value['statusRangeTo'],
              },
              conditions: this.childForm.value['conditions'],
              property: this.childForm.value['property'],
              expectedValues: this.childForm.value['expectedValues'],

              expected: this.childForm.value['expected'],
            },
          ],
        },
        attach: this.attachCondition,
        service: this.channelClient.attachPathConditionBased.bind(
          this.channelClient
        ),
      },
      CustomEndEvent: {
        initData: {
          name: this.childForm.value['name'],
          description: this.childForm.value['description'],
          completedType: this.childForm.value['completedType'],
          channelId: this.channelId,
          beforeChannelPathId: null,
          commandId: null,
          actions: null,
        },
        attach: this.attachComplete,
        service: this.channelClient.attachPathCompleteBased.bind(
          this.channelClient
        ),
      },
      CustomTask: {
        initData: {
          name: this.childForm.value['name'],
          messageMappingId: this.childForm.value['messageMappingId'],
          description: this.childForm.value['description'],
          channelId: this.channelId,
          beforeChannelPathId: null,
          commandId: null,
          actions: null,
        },
        attach: this.attachMapper,
        service: this.channelClient.attachPathMapperBased.bind(
          this.channelClient
        ),
      },
      EndEvent: {
        initData: {
          name: this.childForm.value['name'],
          description: this.childForm.value['description'],
          completedType: this.childForm.value['completedType'],
          channelId: this.channelId,
          beforeChannelPathId: null,
          commandId: null,
          actions: null,
        },
        attach: this.attachComplete,
        service: this.channelClient.attachPathCompleteBased.bind(
          this.channelClient
        ),
      },
    };

    const config = configMap[type];
    if (!config) return;

    config.attach.init(config.initData);

    if (config.service) {
      config.service(config.attach).subscribe({
        next: (res: any) => {
          this.dialogRef.close({
            valueForm: this.childForm.value,
            type,
            pathId: res.pathId,
          });
        },
        error: (err: any) => console.error(err),
      });
    }
  }
}
