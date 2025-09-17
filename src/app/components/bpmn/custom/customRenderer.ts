import { getRoundRectPath } from 'bpmn-js/lib/draw/BpmnRenderUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { attr as svgAttr } from 'tiny-svg';

const HIGH_PRIORITY = 1500;
const TASK_BORDER_RADIUS = 2;
export default class CustomRenderer extends BaseRenderer {
  static $inject = ['eventBus', 'bpmnRenderer'];

  constructor(
    eventBus: import('diagram-js/lib/core/EventBus').default,
    private readonly bpmnRenderer: any
  ) {
    super(eventBus, HIGH_PRIORITY);
  }

  override canRender(element: any): boolean {
    return !element.labelTarget;
  }

  override drawShape(parentNode: SVGElement, element: any): SVGElement {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);

    if (element.id.includes('Custom_End_Event')) {
      svgAttr(shape, { stroke: '#ff4d4fff' });
    }

    if (element.id.includes('Custom_Activity')) {
      svgAttr(shape, { fill: '#52B415' });
    }

    return shape;
  }

  override getShapePath(shape: any): string {
    if (is(shape, 'bpmn:Task')) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }
    return this.bpmnRenderer.getShapePath(shape);
  }
}
