import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';

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
  loading = false; // Start as true
  page = 1;
  limit = 10; // Number of items per request
  hasMoreData = true; // If false, stop loading

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.loadMore();
  }

  loadMore() {
    if (this.loading || !this.hasMoreData) return;

    this.loading = true;
    this.http.get<LeaderboardEntry[]>(`https://izrr3wibyl.execute-api.ap-southeast-2.amazonaws.com/prod/dogs/leaderboard?page=${this.page}&limit=${this.limit}`)
      .subscribe({
        next: (data) => {
          if (data.length < this.limit) {
            this.hasMoreData = false; // Stop fetching if fewer results are returned
          }
          this.leaderboardEntries = [...this.leaderboardEntries, ...data];
          this.page++;
        },
        error: () => {
          this.hasMoreData = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  onScroll(index: number) {
    if (index > this.leaderboardEntries.length - 8) { // Load more when 8 items from the bottom
      this.loadMore();
    }
  }

  getMedal(place: number): string | null {
    if (place === 1) return 'assets/gold.png';
    if (place === 2) return 'assets/silver.png';
    if (place === 3) return 'assets/bronze.png';
    return null;
  }

}
