import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { HelpService } from '../../service/help.service';

@Component({
  selector: 'app-select-json-tree',
  templateUrl: './select-json-tree.component.html',
  styleUrl: './select-json-tree.component.scss',
  standalone: true,
})
export class SelectJsonTreeComponent {
  openAddFieldModal = false;
  @Input() data: any;
  @Input() parent: string | undefined;
  @Input() direction: string = 'rtl';
  selectedKey: string = '';
  objectKeys = Object.keys;

  @Output() selectKey = new EventEmitter<any>();

  constructor(private helpService: HelpService) {
    this.helpService.activeSourceIdSubject.subscribe((response) => {
      this.selectedKey = response;
      this.selectKey.emit(this.selectedKey);
    });
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  ngOnInit() {}

  selectObjectField(key: string, event?: Event) {
    if (this.parent) {
      event?.stopPropagation();
    }

    if (event === undefined || !event.returnValue) return;

    event.returnValue = false;

    const data = {
      id: key,
      key: this.parent ? this.parent + '.' + key : key,
    };
    this.helpService.setActiveFieldTree(data);
  }
}
