import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTable, SortDirection} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {MatTableMediator, MediatorData, BasicTableMediator} from 'ngx-material-table-mediator';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {GithubApi, GithubIssue} from "./models";
import {LocalTableMediator} from 'ngx-material-table-mediator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent /*implements AfterViewInit*/ {
 /* trigger$ = new BehaviorSubject<string>(undefined);

  mediator: LocalTableMediator<void, Comment>;

  displayedColumns: string[] = ['postId', 'id', 'name', 'email'];
  isLoading$ = of(true);
  isRateLimitReached$ = new BehaviorSubject<boolean>(false);

  @ViewChild(MatTable) table: MatTable<Comment>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient) {
  }

  ngAfterViewInit() {
    this.mediator = new LocalTableMediator<any, Comment>(
      (payload, sortBy, sortDirection, pageIndex, pageSize) =>
        this.fetch(payload, sortBy, sortDirection, pageIndex, pageSize),
      this.trigger$, this.table,
      this.paginator, this.sort
    );

    this.isLoading$ = this.mediator.isLoading$;
    this.mediator.error$.subscribe(() => this.isRateLimitReached$.next(true));
    this.mediator.onFetchBegin$.subscribe(() => this.isRateLimitReached$.next(false));
  }

  private fetch(payload: string | undefined,
                sortBy: string, sortDirection: SortDirection,
                pageIndex: number, pageSize: number): Observable<Array<Comment>> {
    return !!payload && payload.length > 0 ?
      this.http.get<Array<Comment>>(`https://jsonplaceholder.typicode.com/comments?postId=${payload}`) :
      this.http.get<Array<Comment>>(`https://jsonplaceholder.typicode.com/comments`);
  }*/
}
