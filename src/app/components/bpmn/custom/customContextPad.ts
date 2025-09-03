const SUITABILITY_SCORE_HIGH = 100,
  SUITABILITY_SCORE_AVERAGE = 50,
  SUITABILITY_SCORE_LOW = 25;

export default class CustomContextPad {
  private bpmnFactory: any;
  private create: any;
  private elementFactory: any;
  private translate: any;
  private autoPlace: any;

  constructor(
    bpmnFactory: any,
    config: any,
    contextPad: any,
    create: any,
    elementFactory: any,
    injector: any,
    translate: any
  ) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    if (config.autoPlace !== false) {
      this.autoPlace = injector.get('autoPlace', false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element: any) {
    const { autoPlace, bpmnFactory, create, elementFactory, translate } = this;

    function appendServiceTask(suitabilityScore: number) {
      return function (event: any, element: any) {
        if (autoPlace) {
          const businessObject = bpmnFactory.create('bpmn:Task');
          businessObject.suitable = suitabilityScore;

          const shape = elementFactory.createShape({
            type: 'bpmn:Task',
            businessObject,
          });

          autoPlace.append(element, shape);
        } else {
          appendServiceTaskStart(suitabilityScore)(event);
        }
      };
    }

    function appendServiceTaskStart(suitabilityScore: number) {
      return function (event: any) {
        const businessObject = bpmnFactory.create('bpmn:Task');
        businessObject.suitable = suitabilityScore;

        const shape = elementFactory.createShape({
          type: 'bpmn:Task',
          businessObject,
        });

        create.start(event, shape, element);
      };
    }

    return {
      'append.low-task': {
        group: 'model',
        className: 'bpmn-icon-task red',
        title: translate('Append Task with low suitability score'),
        action: {
          click: appendServiceTask(SUITABILITY_SCORE_LOW),
          dragstart: appendServiceTaskStart(SUITABILITY_SCORE_LOW),
        },
      },
      'append.average-task': {
        group: 'model',
        className: 'bpmn-icon-task yellow',
        title: translate('Append Task with average suitability score'),
        action: {
          click: appendServiceTask(SUITABILITY_SCORE_AVERAGE),
          dragstart: appendServiceTaskStart(SUITABILITY_SCORE_AVERAGE),
        },
      },
      'append.high-task': {
        group: 'model',
        className: 'bpmn-icon-task green',
        title: translate('Append Task with high suitability score'),
        action: {
          click: appendServiceTask(SUITABILITY_SCORE_HIGH),
          dragstart: appendServiceTaskStart(SUITABILITY_SCORE_HIGH),
        },
      },
    };
  }
}

(CustomContextPad as any).$inject = [
  'bpmnFactory',
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate',
];
