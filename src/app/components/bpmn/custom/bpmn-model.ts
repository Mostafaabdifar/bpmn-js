export interface Modeling {
  updateLabel(element: any, newLabel: string): void;
  updateProperties(element: any, props: Record<string, any>): void;
}

export interface DirectEditing {
  cancel(): void;
  activate(element: any): void;
  complete(): void;
}
