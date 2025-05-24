import { Component } from '@angular/core';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [LeaderboardComponent]
})
export class AppComponent {
  title = 'angular-quickstart';
}
