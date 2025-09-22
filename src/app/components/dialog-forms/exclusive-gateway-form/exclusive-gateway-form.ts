import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  ConditionResolverItem,
  PropertyValueCondition,
} from '../../../proxy/Integration';
import { CoreService, ValueItem } from '../../../service/core.service';
import { AddResolver } from '../../add-resolver/add-resolver';

@Component({
  selector: 'app-exclusive-gateway-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    AddResolver,
  ],
  templateUrl: './exclusive-gateway-form.html',
  styleUrl: './exclusive-gateway-form.scss',
})
export class ExclusiveGatewayForm {
  conditionForm: FormGroup;
  showAddResolver: boolean = false;
  conditionValue!: number;
  ConditionResolverTypes: ValueItem[] = [];
  resolvers: ConditionResolverItem[] = [];

  constructor(private fb: FormBuilder, private coreService: CoreService) {
    this.conditionForm = this.fb.group({
      name: ['', Validators.required],
      conditionResolverType: ['', Validators.required],
      statusItemList: [[''], Validators.required],
      statusItem: ['', Validators.required],
      statusName: ['', Validators.required],
      statusRangeFrom: ['', Validators.required],
      statusRangeTo: ['', Validators.required],
      templateMessageItem: [''],
      actions: [''],
      conditionRelationship: [null],
      description: [''],
      property: [''],
      conditions: [''],
      values: this.fb.array<string>([]),
      expected: [false],
      expectedValues: [''],
      type: [0],
    });

    this.coreService.setForm(this.conditionForm, 'ExclusiveGateway');

    this.conditionForm
      .get('conditionResolverType')
      ?.valueChanges.subscribe((value) => {
        this.conditionValue = value;
        this.showAddResolver = true;
      });
  }

  ngOnInit(): void {
    this.coreService.dataSubject.subscribe((data) => {
      this.ConditionResolverTypes =
        data.find((item) => item.name === 'ConditionResolverType')
          ?.valueItems ?? [];
    });
  }

  addResolver(resolver: ConditionResolverItem | undefined): void {
    console.log(resolver);
    if (resolver) {
      this.resolvers.push(resolver);
    }
    this.showAddResolver = false;
  }
}
