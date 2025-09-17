import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoreService } from './service/core.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'bpmmjs-Angular';

  constructor(private coreService: CoreService) {}

  ngOnInit() {
    this.coreService.fetchData().subscribe();
  }
}
