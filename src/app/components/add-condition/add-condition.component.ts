import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AfterViewInit, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { map, of, startWith, Subject, takeUntil } from 'rxjs';
import { PropertyValueCondition } from '../../proxy/Integration';
import {
  CoreService,
  DialogActionButton,
  ValueItem,
} from '../../service/core.service';
import { HelpService } from '../../service/help.service';
import { SelectJsonTreeComponent } from '../select-json-tree/select-json-tree.component';

@Component({
  selector: 'app-add-condition',
  templateUrl: './add-condition.component.html',
  styleUrls: ['./add-condition.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    SelectJsonTreeComponent,
  ],
})
export class AddConditionComponent implements AfterViewInit, OnInit, OnDestroy {
  conditionOperationTypes: ValueItem[] = [];
  condition = new PropertyValueCondition();

  @Input() visible = false;
  @Input() templateMessageJson: any;
  @Output() hideDialog = new EventEmitter();
  @Output() addCondition = new EventEmitter<PropertyValueCondition>();

  @ViewChild('createTaskForm') createTaskForm!: NgForm;

  private destroy$ = new Subject<void>();

  constructor(
    private coreService: CoreService,
    private helpService: HelpService
  ) {
    this.coreService.dataSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.conditionOperationTypes = data.find(
          (item) => item.name === 'ConditionOperation'
        )?.valueItems!;
      });
  }

  ngOnInit(): void {
    try {
      this.templateMessageJson =
        typeof this.templateMessageJson === 'string'
          ? JSON.parse(this.templateMessageJson)
          : this.templateMessageJson;
    } catch {
      this.templateMessageJson = {};
    }
  }

  ngAfterViewInit(): void {
    const disabled$ = (this.createTaskForm.statusChanges ?? of(null)).pipe(
      startWith(this.createTaskForm.status),
      map(() => !!this.createTaskForm.invalid)
    );

    const actions: DialogActionButton[] = [
      {
        id: 'back',
        label: 'Back',
        color: 'warn',
        variant: 'stroked',
        click: () => this.onHideDialog(),
      },
      {
        id: 'create-condition',
        label: 'Create condition',
        color: 'primary',
        variant: 'flat',
        disabled$: disabled$,
        click: () => this.onSubmit(),
      },
    ];

    this.coreService.setActions(actions);
  }

  selectKey(key: string) {
    this.condition.property = key;
  }

  onHideDialog() {
    this.visible = false;
    this.hideDialog.emit();
  }

  onCancel(): void {
    this.addCondition.emit(undefined);
  }

  onSubmit(): void {
    this.addCondition.emit(this.condition);
  }
  ngOnDestroy(): void {
    this.helpService.setActiveFieldTree('');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
