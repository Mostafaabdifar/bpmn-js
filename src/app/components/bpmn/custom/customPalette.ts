const SUITABILITY_SCORE = {
  HIGH: 100,
  AVERAGE: 50,
  LOW: 25,
} as const;

export default class CustomPalette {
  private bpmnFactory: any;
  private create: any;
  private elementFactory: any;
  private translate: any;
  private originalGetPaletteEntries: any;

  private static readonly BLOCKED_ENTRIES = [
    'create.intermediate-event',
    'create.subprocess-expanded',
    'create.data-object',
    'create.data-store',
    'create.participant-expanded',
    'create.group',
  ];

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
        businessObject.id = `Custom_${businessObject.id}`;
        businessObject.suitable = suitabilityScore;
        const shape = elementFactory.createShape({
          type: 'bpmn:Task',
          businessObject,
        });

        create.start(event, shape);
      };
    }

    function createEndEvent() {
      return function (event: any) {
        const businessObject = bpmnFactory.create('bpmn:EndEvent');
        businessObject.id = `Custom_End_${businessObject.id}`;
        const shape = elementFactory.createShape({
          type: 'bpmn:EndEvent',
          businessObject,
        });

        create.start(event, shape);
      };
    }

    let entries: Record<string, any> = this.originalGetPaletteEntries
      ? this.originalGetPaletteEntries()
      : {};

    entries = Object.fromEntries(
      Object.entries(entries).filter(
        ([key]) => !CustomPalette.BLOCKED_ENTRIES.includes(key)
      )
    );
    Object.assign(entries, {
      'create.start-event': {
        ...entries['create.start-event'],
        title: 'مسیر شروع',
      },
      'create.end-event': {
        ...entries['create.end-event'],
        title: 'مسیر نهایی',
      },
      'create.exclusive-gateway': {
        ...entries['create.exclusive-gateway'],
        title: 'مسیر شرطی',
      },
      'create.task': {
        ...entries['create.task'],
        title: 'فراخوانی API',
      },
    });
    entries['create.high-task'] = {
      group: 'activity',
      className: 'bpmn-icon-task green',
      title: translate('مسیر نگاشت'),
      action: {
        dragstart: createTask(SUITABILITY_SCORE.HIGH),
        click: createTask(SUITABILITY_SCORE.HIGH),
      },
    };
    entries['create.custom-endevent'] = {
      group: 'event',
      className: 'bpmn-icon-end-event-none red',
      title: translate('مسیر خطا'),
      action: {
        dragstart: createEndEvent(),
        click: createEndEvent(),
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
