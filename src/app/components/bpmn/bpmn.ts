import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import { Connection, Shape } from 'bpmn-js/lib/model/Types';
import 'camunda-bpmn-js/dist/assets/camunda-platform-modeler.css';
import BpmnModeler from 'camunda-bpmn-js/lib/base/Modeler';
import * as camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import Canvas from 'diagram-js/lib/core/Canvas';
import EventBus from 'diagram-js/lib/core/EventBus';
import {
  ChannelClient,
  SetNextChannelPathCommand,
} from '../../proxy/Integration';
import { Dialog } from '../dialog/dialog';
import { DirectEditing, Modeling } from './custom/bpmn-model';
import CustomContextPad from './custom/customContextPad';
import CustomPalette from './custom/customPalette';
import CustomRenderer from './custom/customRenderer';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from '../../service/core.service';

const DEFAULT_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false"/>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"/>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

@Component({
  selector: 'app-bpmm',
  templateUrl: './bpmn.html',
  styleUrl: './bpmn.scss',
  imports: [MatButton],
  standalone: true,
})
export class Bpmn implements AfterViewInit, OnInit {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef;
  @ViewChild('properties', { static: true }) private propertiesRef!: ElementRef;

  private bpmnModeler!: BpmnModeler;
  selectedShape: Shape | undefined;
  setNextChannelPathCommand = new SetNextChannelPathCommand();
  channelId: string = '';

  diagramModel: {
    shapes: Record<string, any>;
    connections: Record<string, any>;
  } = {
    shapes: {},
    connections: {},
  };

  constructor(
    private DialogService: MatDialog,
    private channelclient: ChannelClient,
    private activatedRoute: ActivatedRoute,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.coreService.setChannelId(data['data'].id);
      console.log(data['data']);
    });
  }

  ngAfterViewInit(): void {
    this.initializeModeler();
  }

  private initializeModeler(): void {
    this.bpmnModeler = new BpmnModeler({
      container: this.canvasRef.nativeElement,
      propertiesPanel: {
        parent: this.propertiesRef.nativeElement,
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        {
          __init__: ['customContextPad', 'customPalette', 'customRenderer'],
          customContextPad: ['type', CustomContextPad],
          customPalette: ['type', CustomPalette],
          customRenderer: ['type', CustomRenderer],
        },
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor,
      },
    });

    this.bpmnModeler.importXML(DEFAULT_DIAGRAM).then(() => {
      const canvas = this.bpmnModeler.get<Canvas>('canvas');
      canvas.zoom('fit-viewport');

      this.registerEvents();
    });
  }

  private registerEvents(): void {
    const eventBus = this.bpmnModeler.get<EventBus>('eventBus');

    eventBus.on('shape.added', ({ element }: { element: Shape }) => {
      console.log(element);
      if (!element?.id || !element.type) return;

      if (element.type === 'label' || element.type === 'bpmn:TextAnnotation') {
        return;
      }

      const directEditing =
        this.bpmnModeler.get<DirectEditing>('directEditing');
      directEditing.cancel();

      this.selectedShape = element;
      this.openDialog(element.type, element.businessObject?.name, element);
    });

    eventBus.on('connection.added', ({ element }: { element: Connection }) => {
      if (!element?.id) return;

      if (element.type === 'bpmn:SequenceFlow') {
        const connectionId = element.id;
        const sourceId = element.source?.id;
        const targetId = element.target?.id;
        const connection = {
          id: connectionId,
          type: this.toReadableType(element.type),
          source: sourceId,
          target: targetId,
        };
        this.diagramModel.connections[connectionId] = connection;

        console.log('Connection اضافه شد:', connection);

        const commandPayload = {
          commandId: null,
          channelId: this.coreService.getChannelId(),
          channelPathId: this.diagramModel.shapes[sourceId!]?.pathId ?? null,
          resolverId: null,
          nextChannelPathId:
            this.diagramModel.shapes[targetId!]?.pathId ?? null,
        };

        this.setNextChannelPathCommand.init(commandPayload);

        this.channelclient
          .setNextChannelPath(this.setNextChannelPathCommand)
          .subscribe({
            next: (res) => {
              console.log(res);
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    });

    eventBus.on('shape.removed', ({ element }: { element: Shape }) => {
      delete this.diagramModel.shapes[element.id];
      console.log(`Shape حذف شد: ${element.id}`);
    });

    eventBus.on(
      'connection.removed',
      ({ element }: { element: Connection }) => {
        delete this.diagramModel.connections[element.id];
        console.log(`Connection حذف شد: ${element.id}`);
      }
    );

    eventBus.on(
      'element.changed',
      ({ element }: { element: Shape | Connection }) => {
        if (element.type?.startsWith('bpmn:')) {
          if (this.diagramModel.shapes[element.id]) {
            this.diagramModel.shapes[element.id].name =
              element.businessObject?.name || '';
          }
          console.log(`Element آپدیت شد: ${element.id}`, this.diagramModel);
        }
      }
    );
  }

  private openDialog(type: string, label?: any, element?: Shape): void {
    const dialogRef = this.DialogService.open(Dialog, {
      data: {
        typeAction: this.getTypeAction(element, type),
        label,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: { valueForm: any; type: string; pathId: string }) => {
        const modeling = this.bpmnModeler.get<Modeling>('modeling');

        if (!result || !element) {
          if (element) {
            modeling.removeElements?.([element]);
          }
          return;
        }

        modeling.updateLabel(element, result.valueForm['name']);

        this.diagramModel.shapes[element.id] = {
          id: element.id,
          type: this.toReadableType(element.type),
          name: element.businessObject?.name || '',
          x: element.x,
          y: element.y,
          pathId: result.pathId,
        };

        console.log(
          'Shape در مدل ذخیره شد:',
          this.diagramModel.shapes[element.id]
        );
      });
  }

  private getTypeAction(element: any, type: string): string {
    if (element?.id?.includes('Custom_Activity')) return 'CustomTask';
    if (element?.id?.includes('Custom_End_Event')) return 'CustomEndEvent';
    return this.toReadableType(type);
  }

  private toReadableType(type: string): string {
    return type.replace('bpmn:', '');
  }

  async saveDiagram(): Promise<void> {
    try {
      const { xml } = await this.bpmnModeler.saveXML({ format: true });
      console.log('BPMN XML:', xml);
    } catch (err) {
      console.error('Error saving BPMN diagram:', err);
    }
  }
}
