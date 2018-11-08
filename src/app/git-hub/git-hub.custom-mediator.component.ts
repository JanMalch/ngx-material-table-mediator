import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTable, SortDirection} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {MatTableMediator, MediatorData, TriggerPayload} from 'ngx-material-table-mediator';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {GithubApi, GithubIssue} from "../models";

/*@Component({
  selector: 'app-git-hub',
  templateUrl: './git-hub.component.html',
  styleUrls: ['./git-hub.component.css']
})*/
export class GitHubComponent implements AfterViewInit {
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
    // see git-hub.basic-mediator.component.ts on how to do this without a custom class
    this.mediator = new GithubIssueTableMediator(
      this.http, this.trigger$,
      this.table, this.paginator, this.sort
    );

    this.isLoading$ = this.mediator.isLoading$;
    this.mediator.error$.subscribe(() => this.isRateLimitReached$.next(true));
    this.mediator.onFetchBegin$.subscribe(() => this.isRateLimitReached$.next(false));
  }
}

export class GithubIssueTableMediator extends MatTableMediator<void, GithubIssue> {
  // protected trigger$ = of(undefined); // use this if you don't want to toggle by button

  constructor(private http: HttpClient,
              protected trigger$: TriggerPayload<void>,
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
