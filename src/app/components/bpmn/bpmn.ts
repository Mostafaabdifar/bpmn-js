import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import 'camunda-bpmn-js/dist/assets/camunda-platform-modeler.css';
import BpmnModeler from 'camunda-bpmn-js/lib/base/Modeler';
import * as camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import Canvas from 'diagram-js/lib/core/Canvas';
import EventBus from 'diagram-js/lib/core/EventBus';
import { Dialog } from '../dialog/dialog';
import CustomContextPad from './custom/customContextPad';
import CustomPalette from './custom/customPalette';
import CustomRenderer from './custom/customRenderer';
import { ChannelClient, CreateChannelCommand } from '../../proxy/Integration';
import { DirectEditing, Modeling } from './custom/bpmn-model';
import { Connection, Shape } from 'bpmn-js/lib/model/Types';

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
  standalone: true,
})
export class Bpmn implements AfterViewInit {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef;
  @ViewChild('properties', { static: true }) private propertiesRef!: ElementRef;

  private bpmnModeler!: BpmnModeler;
  selectedShape: Shape | undefined;
  createChannelCommand = new CreateChannelCommand();

  constructor(
    private channelclient: ChannelClient,
    private DialogService: MatDialog
  ) {}

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

    eventBus.on('connection.added', ({ element }: { element: Connection }) => {
      if (element.type === 'bpmn:SequenceFlow') {
        console.log(element.source);
        console.log(element.target);
        // console.log(
        //   `✅ مسیر ساخته شد -> 
        // source: ${element.source?.id} (${this.toReadableType(
        //     element.source?.
        //   )})
        // target: ${element.target?.id} (${this.toReadableType(
        //     element.target?.type
        //   )})`
        // );
      }
    });

    eventBus.on('connect.end', ({ context }: any) => {
      const connection = context.connection;
      if (connection?.type === 'bpmn:SequenceFlow') {
        console.log('✏️ کاربر مسیر رو کشید:', connection);
      }
    });

    eventBus.on('shape.added', ({ element }: { element: Shape }) => {
      console.log(element);
      if (!element?.type) return;

      this.selectedShape = element;

      if (
        element.type === 'bpmn:Task' ||
        element.type === 'bpmn:SequenceFlow' ||
        element.type === 'bpmn:StartEvent'
      ) {
        const directEditing =
          this.bpmnModeler.get<DirectEditing>('directEditing');
        directEditing.cancel();
        this.openDialog(element.type, this.selectedShape?.businessObject.name);
      }

      if (element.type === 'bpmn:SequenceFlow') {
        console.log(
          `source: ${
            element.businessObject.sourceRef.id.split('_')[0]
          } - ${this.toReadableType(
            element.businessObject.sourceRef.$type
          )} -> target: ${
            element.businessObject.targetRef.id.split('_')[0]
          } - ${this.toReadableType(element.businessObject.targetRef.$type)}`
        );
      }
    });
  }

  private openDialog(type: string, label?: any): void {
    const dialogRef = this.DialogService.open(Dialog, {
      data: { typeAction: this.toReadableType(type), label },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: { valueForm: any; type: string }) => {
        if (!result) return;
        const modeling = this.bpmnModeler.get<Modeling>('modeling');
        if (result.type === 'StartEvent') {
          modeling.updateLabel(
            this.selectedShape,
            result.valueForm['companyName']
          );
        }
        if (result.type === 'Task') {
          modeling.updateLabel(
            this.selectedShape,
            result.valueForm['conditionLabel']
          );
        }
      });
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
