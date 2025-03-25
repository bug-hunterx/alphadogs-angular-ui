import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {environment} from '../../environments/environment';

interface Competition {
  id: number;
  name: string;
  type: string;
  start_time: string;
  end_time: string;
  currencies?: number[];
  distances?: number[];
  point_configuration?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}

interface LeaderboardEntry {
  id: number;
  score: number;
  name: string;
  place: number;
}

interface CompetitionsResponse {
  competitions: Competition[];
  total: number;
  page: number;
  limit: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  competition: Competition;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  competitions: Competition[] = [];
  selectedCompetition: Competition | null = null;
  leaderboardEntries: LeaderboardEntry[] = [];
  loading = false;
  loadingCompetitions = false;
  page = 1;
  limit = 10; // Number of items per request
  hasMoreData = true; // If false, stop loading
  baseUrl = environment.apiBaseUrl;
  env = environment.apiEnv;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.loadCompetitions();
  }

  loadCompetitions() {
    this.loadingCompetitions = true;
    this.http.get<CompetitionsResponse>(`${this.baseUrl}/${this.env}/competitions`)
      .subscribe({
        next: (response) => {
          this.competitions = response.competitions;
          if (this.competitions.length > 0) {
            this.selectCompetition(this.competitions[0]);
          }
        },
        error: (error) => {
          console.error('Error loading competitions:', error);
          this.loadingCompetitions = false;
        },
        complete: () => {
          this.loadingCompetitions = false;
        }
      });
  }

  selectCompetition(competition: Competition) {
    this.selectedCompetition = competition;
    this.resetLeaderboard();
    this.loadMore();
  }

  resetLeaderboard() {
    this.leaderboardEntries = [];
    this.page = 1;
    this.hasMoreData = true;
  }

  loadMore() {
    if (this.loading || !this.hasMoreData || !this.selectedCompetition) return;

    this.loading = true;
    this.http.get<LeaderboardResponse>(
      `${this.baseUrl}/${this.env}/competitions/${this.selectedCompetition.id}/leaderboard?page=${this.page}&limit=${this.limit}`
    ).subscribe({
      next: (response) => {
        if (response.leaderboard.length < this.limit) {
          this.hasMoreData = false; // Stop fetching if fewer results are returned
        }
        this.leaderboardEntries = [...this.leaderboardEntries, ...response.leaderboard];
        this.page++;
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
        this.hasMoreData = false;
        this.loading = false;
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
