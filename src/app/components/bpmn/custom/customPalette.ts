const SUITABILITY_SCORE_HIGH = 100,
  SUITABILITY_SCORE_AVERAGE = 50,
  SUITABILITY_SCORE_LOW = 25;

export default class CustomPalette {
  private bpmnFactory: any;
  private create: any;
  private elementFactory: any;
  private translate: any;

  constructor(
    bpmnFactory: any,
    create: any,
    elementFactory: any,
    palette: any,
    translate: any
  ) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries() {
    const { bpmnFactory, create, elementFactory, translate } = this;

    function createTask(suitabilityScore: number) {
      return function (event: any) {
        const businessObject = bpmnFactory.create('bpmn:Task');
        businessObject.suitable = suitabilityScore;

        const shape = elementFactory.createShape({
          type: 'bpmn:Task',
          businessObject,
        });

        create.start(event, shape);
      };
    }

    return {
      'create.low-task': {
        group: 'activity',
        className: 'bpmn-icon-task red',
        title: translate('Create Red Task'),
        action: {
          dragstart: createTask(SUITABILITY_SCORE_LOW),
          click: createTask(SUITABILITY_SCORE_LOW),
        },
      },
      'create.average-task': {
        group: 'activity',
        className: 'bpmn-icon-task yellow',
        title: translate('Create Yellow Task'),
        action: {
          dragstart: createTask(SUITABILITY_SCORE_AVERAGE),
          click: createTask(SUITABILITY_SCORE_AVERAGE),
        },
      },
      'create.high-task': {
        group: 'activity',
        className: 'bpmn-icon-task green',
        title: translate('Create Green Task'),
        action: {
          dragstart: createTask(SUITABILITY_SCORE_HIGH),
          click: createTask(SUITABILITY_SCORE_HIGH),
        },
      },
    };
  }
}

(CustomPalette as any).$inject = [
  'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'translate',
];
