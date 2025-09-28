import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import {
  ChannelClient,
  ChannelDto,
  CreateChannelCommand,
} from '../../proxy/Integration';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../service/core.service';
import { C } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-landing',
  imports: [
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogActions,
    MatDialogContent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogClose,
    MatDialogTitle,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  private currentDialogRef?: MatDialogRef<any>;
  channelList: ChannelDto[] = [];
  channelName: string = '';
  channelCommand = new CreateChannelCommand();
  deleteChannelCommand = new CreateChannelCommand();
  constructor(
    private channelClient: ChannelClient,
    private dialog: MatDialog,
    private router: Router,
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getList();
  }

  getList() {
    this.activatedRoute.data.subscribe((data) => {
      this.channelList = data['data'].items;
    });
  }

  openDialog(): void {
    this.currentDialogRef = this.dialog.open(this.dialogTemplate);
  }

  createChannel() {
    this.channelCommand.name = this.channelName;
    this.channelClient.create(this.channelCommand).subscribe({
      next: (res) => {
        if (res?.id) {
          const id = res.id;
          this.router.navigate(['/bpmn', id]);
        }
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        this.currentDialogRef?.close();
      },
    });
  }

  openBpmn(channel: ChannelDto) {
    this.router.navigate(['/bpmn', channel.id]);
  }

  onDeleteAction(channel: ChannelDto) {
    console.log('Delete', channel);
  }
}
