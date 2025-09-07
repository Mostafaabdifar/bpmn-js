const SUITABILITY_SCORE_HIGH = 100,
  SUITABILITY_SCORE_AVERAGE = 50,
  SUITABILITY_SCORE_LOW = 25;

export default class CustomContextPad {
  private bpmnFactory: any;
  private create: any;
  private elementFactory: any;
  private translate: any;
  private autoPlace: any;
  private originalGetContextPadEntries: any;

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

    // گرفتن provider اصلی
    const defaultProvider = injector.get('contextPadProvider', false);
    if (defaultProvider) {
      this.originalGetContextPadEntries =
        defaultProvider.getContextPadEntries.bind(defaultProvider);

      // override کردن contextPad اصلی
      defaultProvider.getContextPadEntries = () => {
        return {}; // یعنی چیزی از خودش نشون نده
      };
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

    let entries = this.originalGetContextPadEntries
      ? this.originalGetContextPadEntries(element)
      : {};

    const blocked = [
      'append.data-object-reference',
      'append.data-store-reference',
      'append.participant-expanded',
      'append.group',
    ];

    entries = Object.fromEntries(
      Object.entries(entries).filter(([key]) => !blocked.includes(key))
    );
    entries['delete'].title = 'حذف';

    switch (element.type) {
      case 'bpmn:Association':
        break;

      case 'bpmn:TextAnnotation':
        entries['connect'].title = 'مسیریابی';
        break;

      case 'bpmn:EventBasedGateway':
        entries['append.condition-intermediate-event'].title =
          'شرط رویداد میانی';
        entries['append.message-intermediate-event'].title =
          'پیام رویداد میانی';
        entries['append.receive-task'].title = 'تسک دریافتی';
        entries['append.signal-intermediate-event'].title =
          'رویداد سیگنال میانی';
        entries['append.text-annotation'].title = 'افزودن یادداشت';
        entries['append.timer-intermediate-event'].title =
          'زمانسنج رویداد میانی';
        entries['connect'].title = 'مسیریابی';
        entries['replace'].title = 'جایگزین';
        break;

      case 'bpmn:SequenceFlow':
        entries['append.text-annotation'].title = 'افزودن یادداشت';
        break;

      case 'bpmn:EndEvent':
        entries['replace'].title = 'جایگزین';
        entries['connect'].title = 'مسیریابی';
        entries['append.text-annotation'].title = 'افزودن یادداشت';
        break;

      default:
        entries['append.append-task'].title = 'فراخوانی API';
        entries['append.end-event'].title = 'مسیر نهایی';
        entries['append.gateway'].title = 'مسیر شرطی';
        entries['replace'].title = 'جایگزین';
        entries['connect'].title = 'مسیریابی';
        entries['append.text-annotation'].title = 'افزودن یادداشت';
        entries['append.intermediate-event'].title = 'مسیر خطا';
        entries['append.intermediate-event'].className =
          'entry bpmn-icon-intermediate-event-none red';

        entries['append.high-task'] = {
          group: 'model',
          className: 'bpmn-icon-task green',
          title: translate('مسیر نگاشت'),
          action: {
            click: appendServiceTask(SUITABILITY_SCORE_HIGH),
            dragstart: appendServiceTaskStart(SUITABILITY_SCORE_HIGH),
          },
        };
        break;
    }

    return entries;
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

// 'append.low-task': {
//   group: 'model',
//   className: 'bpmn-icon-task red',
//   title: translate('Append Task with low suitability score'),
//   action: {
//     click: appendServiceTask(SUITABILITY_SCORE_LOW),
//     dragstart: appendServiceTaskStart(SUITABILITY_SCORE_LOW),
//   },
// },
// 'append.average-task': {
//   group: 'model',
//   className: 'bpmn-icon-task yellow',
//   title: translate('Append Task with average suitability score'),
//   action: {
//     click: appendServiceTask(SUITABILITY_SCORE_AVERAGE),
//     dragstart: appendServiceTaskStart(SUITABILITY_SCORE_AVERAGE),
//   },
// },