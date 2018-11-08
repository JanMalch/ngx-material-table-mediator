import {AfterViewInit, Component} from '@angular/core';
import {GithubApi, GithubIssue} from '../models';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {SortDirection} from '@angular/material';
import {map} from 'rxjs/operators';
import {MediatedTableComponent, MediatorData} from 'ngx-material-table-mediator';

@Component({
  selector: 'app-git-hub',
  templateUrl: './git-hub.component.html',
  styleUrls: ['./git-hub.component.css']
})
export class GitHubComponent extends MediatedTableComponent<any, GithubIssue> implements AfterViewInit {

  trigger$ = new BehaviorSubject<any>(undefined); // loading starts instantly, use super(true);
  // trigger$ = new ReplaySubject<any>(1); // loading starts after button click, use super(false);
  displayedColumns: string[] = ['created', 'state', 'number', 'title'];

  isRateLimitReached$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    super(true);
  }

  ngAfterViewInit(): void {
    this.initMediator();
    this.mediator.error$.subscribe(() => this.isRateLimitReached$.next(true));
    this.mediator.onFetchBegin$.subscribe(() => this.isRateLimitReached$.next(false));
  }

  fetch(_: undefined,
        sortBy: string, sortDirection: SortDirection,
        pageIndex: number, pageSize: number): Observable<MediatorData<GithubIssue>> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl = `${href}?q=repo:angular/material2&sort=${sortBy}&order=${sortDirection}&page=${pageIndex + 1}`;

    return this.http.get<GithubApi>(requestUrl).pipe(
      map(response => ({
          data: response.items,
          total: response.total_count
        })
      )
    );
  }
}
