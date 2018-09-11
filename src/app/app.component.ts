import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTable, SortDirection} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {MatTableMediator, MediatorData, FetchPayload, BasicTableMediator} from 'ngx-material-table-mediator';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  trigger$ = new BehaviorSubject<void>(undefined);

  mediator: MatTableMediator<void, GithubIssue>;

  displayedColumns: string[] = ['created', 'state', 'number', 'title'];

  isLoading$ = of(true);
  isRateLimitReached$ = new BehaviorSubject<boolean>(false);

  @ViewChild(MatTable) table: MatTable<GithubIssue>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient) {
  }

  ngAfterViewInit() {
    this.mediator = new GithubIssueTableMediator(
      this.http, this.trigger$,
      this.table, this.paginator, this.sort
    );

    this.isLoading$ = this.mediator.isLoading$;
    this.mediator.error$.subscribe(() => this.isRateLimitReached$.next(true));
    this.mediator.onFetchBegin$.subscribe(() => this.isRateLimitReached$.next(false));
  }

  // ----------- Alternative -----------

  alternativeAfterViewInit() {
    this.mediator = new BasicTableMediator<any, GithubIssue>(
      (payload, sortBy, sortDirection, pageIndex, pageSize) =>
        this.fetch(payload, sortBy, sortDirection, pageIndex, pageSize),
      this.trigger$, this.table,
      this.paginator, this.sort
    );

    this.isLoading$ = this.mediator.isLoading$;
    this.mediator.error$.subscribe(() => this.isRateLimitReached$.next(true));
    this.mediator.onFetchBegin$.subscribe(() => this.isRateLimitReached$.next(false));
  }

  private fetch(payload: undefined,
                                   sortBy: string, sortDirection: SortDirection,
                                   pageIndex: number, pageSize: number): Observable<MediatorData<GithubIssue>> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl =
      `${href}?q=repo:angular/material2&sort=${sortBy}&order=${sortDirection}&page=${pageIndex + 1}`;

    return this.http.get<GithubApi>(requestUrl).pipe(
      map(response => ({
          data: response.items,
          total: response.total_count
        })
      )
    );
  }
}

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}

export class GithubIssueTableMediator extends MatTableMediator<void, GithubIssue> {

  // protected fetchPayload$ = of(undefined); // use this if you don't want to toggle by button

  constructor(private http: HttpClient,
              protected fetchPayload$: FetchPayload<void>,
              table: MatTable<GithubIssue>,
              paginator: MatPaginator,
              sort: MatSort) {

    super(table, paginator, sort);
    super.ngOnInit();
  }

  fetch(payload: undefined,
        sortBy: string, sortDirection: SortDirection,
        pageIndex: number, pageSize: number): Observable<MediatorData<GithubIssue>> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl =
      `${href}?q=repo:angular/material2&sort=${sortBy}&order=${sortDirection}&page=${pageIndex + 1}`;

    return this.http.get<GithubApi>(requestUrl).pipe(
      map(response => ({
          data: response.items,
          total: response.total_count
        })
      )
    );
  }
}
