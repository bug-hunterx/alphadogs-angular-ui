import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

interface LeaderboardEntry {
  dog_id: number;
  first_place_count: number;
  second_place_count: number;
  third_place_count: number;
  dog: {
    id: number;
    name: string;
  };
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  displayedColumns: string[] = ['name', 'first_place_count', 'second_place_count', 'third_place_count'];
  dataSource = new MatTableDataSource<LeaderboardEntry>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.fetchLeaderboard();
  }

  fetchLeaderboard(): void {
    this.http.get<LeaderboardEntry[]>('https://lwzylsk696.execute-api.ap-southeast-2.amazonaws.com/uat/dogs/leaderboard?limit=5').subscribe(
      (data) => {
        this.dataSource.data = data;
        this.dataSource.sort = this.sort; // Enable sorting
      },
      (error) => {
        console.error('Error fetching leaderboard data', error);
      }
    );
  }
}
