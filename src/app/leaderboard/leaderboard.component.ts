import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

interface LeaderboardEntry {
  id: number;
  score: number;
  name: string;
  place: number;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  leaderboardEntries: LeaderboardEntry[] = [];

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.fetchLeaderboard();
  }

  fetchLeaderboard(): void {
    this.http.get<LeaderboardEntry[]>('https://lwzylsk696.execute-api.ap-southeast-2.amazonaws.com/uat/dogs/leaderboard').subscribe(
      (data) => {
        // this.leaderboardEntries = [
        //   {id:1,
        //   name: 'test',
        //     place: 1,
        //     score: 10000
        //   }
        // ];
        this.leaderboardEntries = data
      },
      (error) => {
        console.error('Error fetching leaderboard data', error);
      }
    );
  }
}
