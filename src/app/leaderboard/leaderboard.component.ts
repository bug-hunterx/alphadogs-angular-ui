import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
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
  // All competitions
  competitions: Competition[] = [];
  // Categorized competitions
  activeCompetitions: Competition[] = [];
  futureCompetitions: Competition[] = [];
  pastCompetitions: Competition[] = [];

  selectedCompetition: Competition | null = null;
  leaderboardEntries: LeaderboardEntry[] = [];
  loading = false;
  loadingCompetitions = false;
  page = 1;
  limit = 100; // Number of items per request
  hasMoreData = true; // If false, stop loading
  baseUrl = environment.apiBaseUrl;
  env = environment.apiEnv;

  // Tab index: 0 = Active, 1 = Future, 2 = Past
  selectedTabIndex = 0;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.loadCompetitions();
  }

  loadCompetitions() {
    this.loadingCompetitions = true;
    this.http.get<CompetitionsResponse>(`${this.baseUrl}/${this.env}/competitions?limit=100`)
      .subscribe({
        next: (response) => {
          this.competitions = response.competitions;

          // Categorize competitions based on their dates
          const currentTime = new Date().toISOString();

          this.activeCompetitions = this.competitions.filter(comp =>
            comp.start_time < currentTime && comp.end_time > currentTime
          );

          this.futureCompetitions = this.competitions.filter(comp =>
            comp.start_time > currentTime
          );

          this.pastCompetitions = this.competitions.filter(comp =>
            comp.end_time < currentTime
          );

          // Select the first competition in the active tab by default
          if (this.activeCompetitions.length > 0) {
            this.selectCompetition(this.activeCompetitions[0]);
          } else if (this.futureCompetitions.length > 0) {
            this.selectedTabIndex = 1; // Switch to future tab
            this.selectCompetition(this.futureCompetitions[0]);
          } else if (this.pastCompetitions.length > 0) {
            this.selectedTabIndex = 2; // Switch to past tab
            this.selectCompetition(this.pastCompetitions[0]);
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

  onTabChange(tabIndex: number) {
    this.selectedTabIndex = tabIndex;

    // Select the first competition in the selected tab
    if (tabIndex === 0 && this.activeCompetitions.length > 0) {
      this.selectCompetition(this.activeCompetitions[0]);
    } else if (tabIndex === 1 && this.futureCompetitions.length > 0) {
      this.selectCompetition(this.futureCompetitions[0]);
    } else if (tabIndex === 2 && this.pastCompetitions.length > 0) {
      this.selectCompetition(this.pastCompetitions[0]);
    } else {
      // Reset if no competitions in the selected tab
      this.selectedCompetition = null;
      this.resetLeaderboard();
    }
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
