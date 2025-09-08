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
  private readonly dialog = inject(MatDialog);

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

    eventBus.on('element.dblclick', ({ element }: any) => {
      if (!element?.type) return;

      if (
        element.type === 'bpmn:Task' ||
        element.type === 'bpmn:SequenceFlow'
      ) {
        this.openDialog(element.type);
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

  private openDialog(type: string): void {
    this.dialog.open(Dialog, {
      data: { typeAction: this.toReadableType(type) },
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
