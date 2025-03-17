import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

interface LeaderboardEntry {
  id: number;
  score: number;
  name: string;
  place: number;
  cropped_icon: string
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  leaderboardEntries: LeaderboardEntry[] = [];
  loading = true; // Start as true

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.fetchLeaderboard();
  }

  fetchLeaderboard(): void {
    this.http.get<LeaderboardEntry[]>('https://izrr3wibyl.execute-api.ap-southeast-2.amazonaws.com/prod/dogs/leaderboard').subscribe(
      (data) => {
        // this.leaderboardEntries = [
        //   {id:1,
        //   name: 'test',
        //     place: 1,
        //     score: 10000
        //   }
        // ];
        this.leaderboardEntries = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching leaderboard data', error);
        this.loading = false;
      }
    );
  }

  getMedal(place: number): string | null {
    if (place === 1) return 'assets/gold.png';
    if (place === 2) return 'assets/silver.png';
    if (place === 3) return 'assets/bronze.png';
    return null;
  }

}
