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
import { ConditionResolverItem } from '../../../proxy/Integration';
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
  styleUrls: ['./exclusive-gateway-form.scss'],
})
export class ExclusiveGatewayForm {
  conditionForm: FormGroup;
  showAddResolver: boolean = false;
  conditionValue!: number;
  ConditionResolverTypes: ValueItem[] = [];
  ConditionRelationshipTypes: ValueItem[] = [];
  conditionOperationTypes: ValueItem[] = [];
  resolvers: ConditionResolverItem[] = [];

  constructor(private fb: FormBuilder, private coreService: CoreService) {
    this.conditionForm = this.fb.group({
      name: ['', Validators.required],
      resolvers: [[], Validators.required],
      conditionResolverType: [''],
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
      this.ConditionRelationshipTypes =
        data.find((item) => item.name === 'ConditionRelationshipType')
          ?.valueItems ?? [];
      this.conditionOperationTypes = data.find(
        (item) => item.name === 'ConditionOperation'
      )?.valueItems!;
    });
  }

  get resolversArray() {
    return this.conditionForm.get('resolvers');
  }

  addResolver(resolver: ConditionResolverItem | undefined): void {
    if (resolver) {
      resolver.priority = this.resolvers.length + 1;
      this.resolvers.push(resolver);
      this.conditionForm.get('resolvers')?.setValue(this.resolvers);
      this.coreService.setForm(this.conditionForm, 'ExclusiveGateway');
      this.conditionForm.get('conditionResolverType')?.reset();
    } else {
      this.conditionForm.reset();
      this.coreService.setForm(this.conditionForm, 'ExclusiveGateway');
    }
    this.showAddResolver = false;
  }

  onDeleteResolverClick(index: number): void {
    this.resolvers.splice(index, 1);
    if (this.resolvers.length === 0) {
      this.conditionForm.get('name')?.reset();
    }
    this.coreService.setForm(this.conditionForm, 'ExclusiveGateway');
  }

  convertType(value: number): string | undefined {
    const typenName = this.ConditionResolverTypes.find(
      (item) => item.value === value
    )?.title;
    return typenName;
  }
  convertConditionRelationship(value: number): string | undefined {
    const typenName = this.ConditionRelationshipTypes.find(
      (item) => item.value === value
    )?.title;
    return typenName;
  }
  convertConditionOprator(value: number): string | undefined {
    const typenName = this.conditionOperationTypes.find(
      (item) => item.value === value
    )?.title;
    return typenName;
  }
}
