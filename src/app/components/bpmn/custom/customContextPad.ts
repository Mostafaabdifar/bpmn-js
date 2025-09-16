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

    const defaultProvider = injector.get('contextPadProvider', false);
    if (defaultProvider) {
      this.originalGetContextPadEntries =
        defaultProvider.getContextPadEntries.bind(defaultProvider);

      defaultProvider.getContextPadEntries = () => {
        return {};
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
      'append.append-task',
      'append.end-event',
      'append.gateway',
      'append.intermediate-event',
      'replace',
    ];

    entries = Object.fromEntries(
      Object.entries(entries).filter(([key]) => !blocked.includes(key))
    );
    entries['delete'].title = 'حذف';

    const typeConfig: Record<string, Partial<Record<string, string>>> = {
      'bpmn:TextAnnotation': {
        connect: 'مسیریابی',
      },
      'bpmn:EventBasedGateway': {
        'append.condition-intermediate-event': 'شرط رویداد میانی',
        'append.message-intermediate-event': 'پیام رویداد میانی',
        'append.receive-task': 'تسک دریافتی',
        'append.signal-intermediate-event': 'رویداد سیگنال میانی',
        'append.text-annotation': 'افزودن یادداشت',
        'append.timer-intermediate-event': 'زمانسنج رویداد میانی',
        connect: 'مسیریابی',
      },
      'bpmn:SequenceFlow': {
        'append.text-annotation': 'افزودن یادداشت',
      },
      'bpmn:EndEvent': {
        connect: 'مسیریابی',
        'append.text-annotation': 'افزودن یادداشت',
      },
    };

    const config = typeConfig[element.type];

    if (config) {
      Object.entries(config).forEach(([key, title]) => {
        if (entries[key]) entries[key].title = title;
      });
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
