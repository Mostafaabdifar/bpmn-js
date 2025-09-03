const SUITABILITY_SCORE_HIGH = 100,
  SUITABILITY_SCORE_AVERAGE = 50,
  SUITABILITY_SCORE_LOW = 25;

export default class CustomPalette {
  private bpmnFactory: any;
  private create: any;
  private elementFactory: any;
  private translate: any;
  private originalGetPaletteEntries: any;

  constructor(
    bpmnFactory: any,
    create: any,
    elementFactory: any,
    palette: any,
    translate: any,
    injector: any
  ) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    const defaultProvider = injector.get('paletteProvider', false);
    if (defaultProvider) {
      this.originalGetPaletteEntries =
        defaultProvider.getPaletteEntries.bind(defaultProvider);

      defaultProvider.getPaletteEntries = () => {
        return {};
      };
    }

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
    const blocked = [
      'create.subprocess-expanded',
      'create.data-object',
      'create.data-store',
      'create.participant-expanded',
      'create.group',
    ];

    let entries = this.originalGetPaletteEntries
      ? this.originalGetPaletteEntries()
      : {};

    entries = Object.fromEntries(
      Object.entries(entries).filter(([key]) => !blocked.includes(key))
    );
    entries['create.start-event'].title = 'مسیر شروع';
    entries['create.end-event'].title = 'مسیر نهایی';
    entries['create.exclusive-gateway'].title = 'مسیر شرطی';
    entries['create.task'].title = 'فراخوانی API';
    entries['create.intermediate-event'].title = 'مسیر خطا';
    entries['create.intermediate-event'].className =
      'entry bpmn-icon-intermediate-event-none red';
    entries['create.high-task'] = {
      group: 'activity',
      className: 'bpmn-icon-task green',
      title: translate('مسیر نگاشت'),
      action: {
        dragstart: createTask(SUITABILITY_SCORE_HIGH),
        click: createTask(SUITABILITY_SCORE_HIGH),
      },
    };

    return entries;
  }
}

(CustomPalette as any).$inject = [
  'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'translate',
  'injector',
];

//     'create.low-task': {
//   group: 'activity',
//   className: 'bpmn-icon-task red',
//   title: translate('Create Red Task'),
//   action: {
//     dragstart: createTask(SUITABILITY_SCORE_LOW),
//     click: createTask(SUITABILITY_SCORE_LOW),
//   },
// },
// 'create.average-task': {
//   group: 'activity',
//   className: 'bpmn-icon-task yellow',
//   title: translate('Create Yellow Task'),
//   action: {
//     dragstart: createTask(SUITABILITY_SCORE_AVERAGE),
//     click: createTask(SUITABILITY_SCORE_AVERAGE),
//   },
// },
// 'create.high-task': {
//   group: 'activity',
//   className: 'bpmn-icon-task green',
//   title: translate('مسیر نگاشت'),
//   action: {
//     dragstart: createTask(SUITABILITY_SCORE_HIGH),
//     click: createTask(SUITABILITY_SCORE_HIGH),
//   },
// },
