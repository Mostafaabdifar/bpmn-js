import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
// import Swal, { SweetAlertResult } from 'sweetalert2';
// import { LoadingService } from './loading.service';
import {
  MessageWithMappingDto,
  PropertyDataMapping,
} from '../proxy/Integration';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  // $t = new $tPipe();

  selectedSourceId: string | null = null;
  mappingTreeSubject = new BehaviorSubject({});
  propertyDataMappingSubject = new BehaviorSubject<PropertyDataMapping | null>(
    null
  );
  currentMessageWithMappingForEditSubject =
    new BehaviorSubject<MessageWithMappingDto | null>(null);
  transferDtoSubject = new BehaviorSubject([]);
  validateMappingTreeSubject = new BehaviorSubject('');
  activeSourceIdSubject = new BehaviorSubject('');
  activeSourcePropertyIdSubject = new BehaviorSubject('');
  activeDestinationPropertyIdSubject = new BehaviorSubject('');
  selectedSourceType!: string | null;
  activeSourceId: string | null = null;

  onDeleteClick(
    selectableItemId: string,
    clientWrite: any,
    successMessage?: string
  ): Promise<Subscription> {
    return new Promise((resolve, reject) => {
      // Swal.fire({
      //   icon: 'warning',
      //   title: this.$t.transform('Are_you_sure_delete_item'),
      //   confirmButtonText: this.$t.transform('confirm'),
      //   cancelButtonText: this.$t.transform('cancel'),
      //   showCancelButton: true,
      // }).then((result: SweetAlertResult) => {
      //   if (result.isConfirmed) {
      //     loadingService.showOverlayLoading();
      //     var deleteSub$ = clientWrite
      //       .delete({ id: selectableItemId } as any)
      //       .subscribe({
      //         next: () => {
      //           loadingService.hideOverlayLoading();
      //           Swal.fire({
      //             icon: 'success',
      //             title: this.$t.transform('success'),
      //             text: this.$t.transform(
      //               successMessage ?? 'delete_item_successfully'
      //             ),
      //             confirmButtonText: this.$t.transform('close'),
      //           });
      //           resolve(deleteSub$);
      //         },
      //         error: (error: any) => {
      //           loadingService.hideOverlayLoading();
      //           console.log(error);
      //           reject();
      //         },
      //       });
      //   }
      // });
    });
  }

  setMappingTreeSubject(data: any, messageType?: string, sourceType?: any) {
    if (messageType == 'source') {
      this.selectedSourceId = data.key;
      this.activeSourceId = data.key;
      this.activeSourceIdSubject.next(this.activeSourceId!);
      this.selectedSourceType = sourceType;
      this.validateMappingTreeSubject.next(this.selectedSourceType!);
    } else {
      data.selectedSourceId = this.selectedSourceId;
      data.selectedSourceType = this.selectedSourceType;
      this.mappingTreeSubject.next(data);
      this.selectedSourceId = '';
      this.selectedSourceType = '';
      this.activeSourceIdSubject.next('');
      this.validateMappingTreeSubject.next(this.selectedSourceType);
    }
  }

  setActiveFieldTree(data: any) {
    this.activeSourceId = data.key;
    this.activeSourceIdSubject.next(this.activeSourceId!);
  }

  setTransferDto(data: any) {
    this.transferDtoSubject.next(data);
  }

  clearMapping() {
    this.selectedSourceId = null;
    this.selectedSourceType = null;
    this.activeSourceId = null;
    this.activeSourceIdSubject.next('');
    this.propertyDataMappingSubject.next(null);
    this.activeSourcePropertyIdSubject.next('');
    this.activeDestinationPropertyIdSubject.next('');
    this.currentMessageWithMappingForEditSubject.next(null);
    this.validateMappingTreeSubject.next('');
    this.mappingTreeSubject.next([]);
    this.transferDtoSubject.next([]);
  }

  clearActiveFieldTree() {
    this.activeSourceId = null;
    this.activeSourceIdSubject.next('');
  }
}
