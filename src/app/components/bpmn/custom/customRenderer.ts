import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
} from 'tiny-svg';
import { getRoundRectPath } from 'bpmn-js/lib/draw/BpmnRenderUtil';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { isNil } from 'min-dash';

const HIGH_PRIORITY = 1500,
  TASK_BORDER_RADIUS = 2,
  COLOR_GREEN = '#52B415',
  COLOR_YELLOW = '#ffc800',
  COLOR_RED = '#cc0000';

export default class CustomRenderer extends BaseRenderer {
  private bpmnRenderer: any;

  constructor(eventBus: any, bpmnRenderer: any) {
    super(eventBus, HIGH_PRIORITY);
    this.bpmnRenderer = bpmnRenderer;
  }

  override canRender(element: any) {
    return !element.labelTarget;
  }

  override drawShape(parentNode: any, element: any) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);
    const suitabilityScore = this.getSuitabilityScore(element);
    if (!isNil(suitabilityScore)) {
      const color = this.getColor(suitabilityScore);

      const rect = drawRect(
        parentNode,
        50,
        20,
        TASK_BORDER_RADIUS,
        color
      );
      svgAttr(rect, { transform: 'translate(-20, -10)' });

      const text = svgCreate('text');
      svgAttr(text, { fill: '#fff', transform: 'translate(-15, 5)' });
      svgClasses(text).add('djs-label');
      svgAppend(parentNode, text);
    }

    return shape;
  }

  override getShapePath(shape: any) {
    if (is(shape, 'bpmn:Task')) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }
    return this.bpmnRenderer.getShapePath(shape);
  }

  private getSuitabilityScore(element: any): number | null {
    const businessObject = getBusinessObject(element);
    const { suitable } = businessObject;
    return Number.isFinite(suitable) ? suitable : null;
  }

  private getColor(suitabilityScore: number): string {
    if (suitabilityScore > 75) return COLOR_GREEN;
    if (suitabilityScore > 25) return COLOR_YELLOW;
    return COLOR_RED;
  }
}

(CustomRenderer as any).$inject = ['eventBus', 'bpmnRenderer'];

// helpers
function drawRect(
  parentNode: any,
  width: number,
  height: number,
  borderRadius: number,
  color: string,
) {
  const rect = svgCreate('rect');
  svgAttr(rect, {
    width,
    height,
    rx: borderRadius,
    ry: borderRadius,
    stroke: color,
    strokeWidth: 2,
    fill: color,
  });
  svgAppend(parentNode, rect);
  return rect;
}
