const SUITABILITY_SCORE = {
  HIGH: 100,
  AVERAGE: 50,
  LOW: 25,
} as const;

export default class CustomPalette {
  static $inject = [
    'bpmnFactory',
    'create',
    'elementFactory',
    'palette',
    'translate',
    'injector',
  ];

  private readonly bpmnFactory: any;
  private readonly create: any;
  private readonly elementFactory: any;
  private readonly translate: any;
  private readonly originalGetPaletteEntries?: () => Record<string, any>;

  private static readonly BLOCKED_ENTRIES = [
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

      // Disable default entries
      defaultProvider.getPaletteEntries = () => ({});
    }

    palette.registerProvider(this);
  }

  getPaletteEntries(): Record<string, any> {
    const { bpmnFactory, create, elementFactory, translate } = this;

    const createTask = (score: number) => (event: any) => {
      const businessObject = bpmnFactory.create('bpmn:Task', {
        suitable: score,
      });

      const shape = elementFactory.createShape({
        type: 'bpmn:Task',
        businessObject,
      });

      create.start(event, shape);
    };

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
      'create.intermediate-event': {
        ...entries['create.intermediate-event'],
        title: 'مسیر خطا',
        className: 'entry bpmn-icon-intermediate-event-none red',
      },
    });

    // custom entries
    entries['create.high-task'] = {
      group: 'activity',
      className: 'bpmn-icon-task green',
      title: translate('مسیر نگاشت'),
      action: {
        dragstart: createTask(SUITABILITY_SCORE.HIGH),
        click: createTask(SUITABILITY_SCORE.HIGH),
      },
    };
    return entries;
  }
}
