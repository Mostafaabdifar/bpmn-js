import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { delay, map, Observable, startWith } from 'rxjs';
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
import { CoreService } from '../../service/core.service';
import { CustomEndEventForm } from '../dialog-forms/custom-end-event-form/custom-end-event-form';
import { CustomTaskForm } from '../dialog-forms/custom-task-form/custom-task-form';
import { EndEventForm } from '../dialog-forms/end-event-form/end-event-form';
import { ExclusiveGatewayForm } from '../dialog-forms/exclusive-gateway-form/exclusive-gateway-form';
import { StartEventForm } from '../dialog-forms/start-event-form/start-event-form';
import { TaskForm } from '../dialog-forms/task-form/task-form';
import { TypeTransferPipe } from '../../pipe/type-transfer-pipe';
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
    TypeTransferPipe,
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

  channelId: string;

  conditions: PropertyValueCondition[] = [];
  expectedValues: PropertyExpectedValue[] = [];

  conditionValue!: number;
  isFormInvalid$!: Observable<boolean>;
  actions$!: Observable<any>;

  constructor(
    private channelClient: ChannelClient,
    public coreService: CoreService,
    private cdr: ChangeDetectorRef
  ) {
    this.FormComponent = this.formMap[this.data.typeAction] || null;
    this.channelId = this.coreService.getChannelId()!;
    this.actions$ = this.coreService.actions$.pipe(delay(0));
  }

  ngOnInit(): void {
    this.coreService.form$.subscribe((data) => {
      this.childForm = data?.form!;
      this.formType = data?.type!;
      if (this.childForm) {
        this.isFormInvalid$ = this.childForm.statusChanges.pipe(
          startWith(this.childForm.status),
          map(() => this.childForm.invalid)
        );
      }
      this.cdr.detectChanges();
    });
  }

  onOkClick() {
    const type = this.formType;
    const get = (k: string) => this.childForm.value[k];
    const configMap: Record<string, any> = {
      StartEvent: {
        initData: {
          name: get('name'),
          description: get('description'),
          channelId: this.channelId,
        },
        attach: this.attachPathStart,
        service: this.channelClient.attachPathStartBased.bind(
          this.channelClient
        ),
      },
      Task: {
        initData: {
          name: get('name'),
          description: get('description'),
          beforeChannelPathId: null,
          channelId: this.channelId,
          commandId: null,
          actions: null,
          api: {
            baseUrl: get('baseUrl'),
            path: get('path'),
            httpMethodType: get('httpMethodType'),
            timeout: get('timeout'),
            query: get('query'),
            body: get('body'),
            authHttpType: get('authHttpType'),
            authHttpValue: get('authHttpValue'),
            httpHeaders: get('httpHeaders'),
          },
        },
        attach: this.attachAPiCall,
        service: this.channelClient.attachPathApiCallingBased.bind(
          this.channelClient
        ),
      },
      ExclusiveGateway: {
        initData: {
          name: get('name'),
          description: get('description'),
          channelId: this.channelId,
          beforeChannelPathId: null,
          commandId: null,
          actions: get('actions') || [],
          resolvers: get('resolvers'),
        },
        attach: this.attachCondition,
        service: this.channelClient.attachPathConditionBased.bind(
          this.channelClient
        ),
      },
      CustomEndEvent: {
        initData: {
          name: get('name'),
          description: get('description'),
          completedType: get('completedType'),
          channelId: this.channelId,
          beforeChannelPathId: null,
          commandId: null,
          actions: get('actions'),
        },
        attach: this.attachComplete,
        service: this.channelClient.attachPathCompleteBased.bind(
          this.channelClient
        ),
      },
      CustomTask: {
        initData: {
          name: get('name'),
          messageMappingId: get('messageMappingId'),
          description: get('description'),
          channelId: this.channelId,
          beforeChannelPathId: null,
          commandId: null,
          actions: get('actions'),
        },
        attach: this.attachMapper,
        service: this.channelClient.attachPathMapperBased.bind(
          this.channelClient
        ),
      },
      EndEvent: {
        initData: {
          name: get('name'),
          description: get('description'),
          completedType: get('completedType'),
          channelId: this.channelId,
          beforeChannelPathId: null,
          commandId: null,
          actions: get('actions'),
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
