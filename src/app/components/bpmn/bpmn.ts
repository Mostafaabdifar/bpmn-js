import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import BpmnModeler from 'camunda-bpmn-js/lib/base/Modeler';
import 'camunda-bpmn-js/dist/assets/camunda-platform-modeler.css';
import { HttpClient } from '@angular/common/http';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import * as camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import Canvas from 'diagram-js/lib/core/Canvas';

@Component({
  selector: 'app-bpmm',
  providers: [HttpClient],
  templateUrl: './bpmn.html',
  standalone: true,
})
export class Bpmn implements AfterViewInit {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef;
  @ViewChild('properties', { static: true }) private propertiesRef!: ElementRef;
  private bpmnModeler!: BpmnModeler;

  defaultDiagram = `<?xml version="1.0" encoding="UTF-8"?>
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


  ngAfterViewInit(): void {
    this.bpmnModeler = new BpmnModeler({
      container: this.canvasRef.nativeElement,
      propertiesPanel: {
        parent: this.propertiesRef.nativeElement,
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor,
      },
    });

    this.bpmnModeler.importXML(this.defaultDiagram).then(() => {
      const canvas = this.bpmnModeler.get<Canvas>('canvas');
      canvas.zoom('fit-viewport');
    });
  }

  async saveDiagram() {
    try {
      const { xml } = await this.bpmnModeler.saveXML({ format: true });
      console.log('BPMN XML:', xml);
    } catch (err) {
      console.error('Error saving BPMN diagram:', err);
    }
  }
}
