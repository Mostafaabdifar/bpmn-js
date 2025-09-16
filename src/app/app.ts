import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EnumService } from './service/enum.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'bpmmjs-Angular';

  constructor(private enumService: EnumService) {}

  ngOnInit() {
    this.enumService.fetchData().subscribe();
  }
}
