import { Component, inject, OnInit } from '@angular/core';
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
  MessageMappingDto,
  MessageWithMappingDto,
  TemplateMessageClient,
  TemplateMessageDto,
} from '../../proxy/Integration';
import { CoreService, ValueItem } from '../../service/core.service';
import { JsonPrettyPipe } from '../../service/json-pretty-pipe';
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
    MatSelectModule,
    JsonPrettyPipe,
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
  templateMessageId: string = '';
  templateMessage!: TemplateMessageDto;
  templateMessageJson: any;
  conditionValue!: number;
  mappingList: MessageMappingDto[] = [];
  channelPaths: ChannelPathItem[] = [];
  messageWithMappingList: MessageWithMappingDto[] = [];
  statusList = [
    200, 201, 202, 204, 400, 403, 404, 405, 500, 501, 502, 503, 504,
  ];
  showConditionForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private channelClient: ChannelClient,
    private coreService: CoreService,
    private templateMessageClient: TemplateMessageClient
  ) {
    this.startForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
    this.apiForm = this.fb.group({
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
    this.completeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
    this.mapperForm = this.fb.group({
      name: ['', Validators.required],
      messageMapping: ['', Validators.required],
      description: [''],
    });
    this.conditionForm = this.fb.group({
      name: ['', Validators.required],
      conditionResolverType: ['', Validators.required],
      mappingItem: [''],
      statusItemList: [[''], Validators.required],
      statusItem: ['', Validators.required],
      statusName: ['', Validators.required],
      actions: [''],
      conditionRelationship: [''],
      description: [''],
    });

    this.conditionForm
      .get('conditionResolverType')
      ?.valueChanges.subscribe((value) => {
        this.showConditionForm = true;
        this.conditionValue = value;
      });

    this.conditionForm.get('mappingItem')?.valueChanges.subscribe((value) => {
      this.templateMessageId = value;
      this.getTemplateMessageById();
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
    });

    this.coreService.getDataList(this.channelId).subscribe((response) => {
      this.mappingList = response.mappings.items!;
      this.channelPaths = response.channel.paths!;
      this.messageWithMappingList = response.messageWithMapping.items!;
    });
  }

  getTemplateMessageById(): void {
    this.templateMessageClient.getById(this.templateMessageId).subscribe({
      next: (res) => {
        this.templateMessage = res;
        this.templateMessageJson = JSON.parse(this.templateMessage.json!);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onOkClick(): void {
    const type = this.data.typeAction;
    if (type === 'StartEvent') {
      this.attachPathStart.init({
        name: this.startForm.get('companyName')?.value,
        description: this.startForm.get('companyDescription')?.value,
        channelId: this.channelId,
      });
      if (this.startForm.valid) {
        this.channelClient
          .attachPathStartBased(this.attachPathStart)
          .subscribe({
            next: (res) => {
              this.dialogRef.close({
                valueForm: this.startForm.value,
                type: type,
                pathId: res.pathId,
              });
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    } else if (type === 'Task') {
      this.attachAPiCall.init({
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
      });
      if (this.apiForm.valid) {
        this.channelClient
          .attachPathApiCallingBased(this.attachAPiCall)
          .subscribe({
            next: (res) => {
              this.dialogRef.close({
                valueForm: this.apiForm.value,
                type: type,
                pathId: res.pathId,
              });
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    } else if (type === 'ExclusiveGateway') {
      this.attachCondition.init({
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
            conditionRelationship: this.conditionForm.get(
              'conditionRelationship'
            )?.value,
            type: this.conditionValue,

            // priority: this.conditionForm.get('priority')?.value,
            // expectedIncomingHttpStatusRangeCode: {
            //   from: this.conditionForm.get('statusRangeFrom')?.value,
            //   to: this.conditionForm.get('statusRangeTo')?.value,
            // },
            // conditions: this.conditionForm.get('conditions')?.value,
            // expected: this.conditionForm.get('expected')?.value,
            // property: this.conditionForm.get('property')?.value,
            // expectedValues: this.conditionForm.get('expectedValues')?.value,
            // timeout: this.conditionForm.get('timeout')?.value,
            // query: this.conditionForm.get('query')?.value,
            // body: this.conditionForm.get('body')?.value,
            // authHttpType: this.conditionForm.get('authHttpType')?.value,
            // authHttpValue: this.conditionForm.get('authHttpValue')?.value,
            // httpHeaders: this.conditionForm.get('httpHeaders')?.value,
          },
        ],
      });

      console.log(this.attachCondition);
      console.log(this.attachCondition.resolvers);

      // this.attachCondition.resolvers(this.attachCondition.resolvers?.length)! + 1

      // this.channelClient.attachPathConditionBased(this.attachCondition);
      // this.dialogRef.close({
      //   valueForm: '',
      //   type: type,
      // });
    } else if (type === 'CustomEndEvent') {
      this.attachComplete.init({
        name: this.completeForm.get('name')?.value,
        description: this.completeForm.get('description')?.value,
        completedType: this.ChannelPathCompletedTypes.find(
          (item) => item.key === 'Failed'
        )?.value, //Failed process
        channelId: this.channelId,
        beforeChannelPathId: null,
        commandId: null,
        actions: null,
      });
      if (this.completeForm.valid) {
        this.channelClient
          .attachPathCompleteBased(this.attachComplete)
          .subscribe({
            next: (res) => {
              this.dialogRef.close({
                valueForm: this.completeForm.value,
                type: type,
                pathId: res.pathId,
              });
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    } else if (type === 'CustomTask') {
      this.attachMapper.init({
        name: this.mapperForm.get('name')?.value,
        messageMappingId: this.mappingId,
        description: this.mapperForm.get('description')?.value,
        channelId: this.channelId,
        beforeChannelPathId: null,
        commandId: null,
        actions: null,
      });
      if (this.mapperForm.valid) {
        this.channelClient.attachPathMapperBased(this.attachMapper).subscribe({
          next: (res) => {
            this.dialogRef.close({
              valueForm: this.mapperForm.value,
              type: type,
              pathId: res.pathId,
            });
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    } else if (type === 'EndEvent') {
      this.attachComplete.init({
        name: this.completeForm.get('name')?.value,
        description: this.completeForm.get('description')?.value,
        completedType: this.ChannelPathCompletedTypes.find(
          (item) => item.key === 'Successed'
        )?.value, //Successed process
        channelId: this.channelId,
        beforeChannelPathId: null,
        commandId: null,
        actions: null,
      });
      if (this.completeForm.valid) {
        this.channelClient
          .attachPathCompleteBased(this.attachComplete)
          .subscribe({
            next: (res) => {
              this.dialogRef.close({
                valueForm: this.completeForm.value,
                type: type,
                pathId: res.pathId,
              });
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    }
  }
}
