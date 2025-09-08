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

const HIGH_PRIORITY = 1500;
const TASK_BORDER_RADIUS = 2;

const COLORS = {
  GREEN: '#52B415',
  YELLOW: '#ffc800',
  RED: '#cc0000',
} as const;

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

    if (element.type === 'bpmn:IntermediateThrowEvent') {
      svgAttr(shape, { stroke: 'rgba(255, 77, 79, 1)' });
    }

    const suitabilityScore = this.getSuitabilityScore(element);
    if (!isNil(suitabilityScore)) {
      const color = this.getColor(suitabilityScore);
      svgAttr(shape, { fill: color });

      // 👉 optional custom overlay
      // const rect = drawRect(parentNode, 50, 20, TASK_BORDER_RADIUS, color);
      // svgAttr(rect, { transform: 'translate(-20, -10)' });
    }

    return shape;
  }

  override getShapePath(shape: any): string {
    if (is(shape, 'bpmn:Task')) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }
    return this.bpmnRenderer.getShapePath(shape);
  }

  private getSuitabilityScore(element: any): number | null {
    const businessObject = getBusinessObject(element);
    const suitable = businessObject?.suitable;
    return Number.isFinite(suitable) ? suitable : null;
  }

  private getColor(score: number): string {
    if (score > 75) return COLORS.GREEN;
    if (score > 25) return COLORS.YELLOW;
    return COLORS.RED;
  }
}

// helpers
function drawRect(
  parentNode: SVGElement,
  width: number,
  height: number,
  borderRadius: number,
  color: string
): SVGElement {
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
