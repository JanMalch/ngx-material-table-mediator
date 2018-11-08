import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {MatPaginator, MatSort, MatTable, SortDirection} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {LocalTableMediator} from '../../../projects/ngx-material-table-mediator/src/lib/local.mediator';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.css']
})
export class PlaceholderComponent implements AfterViewInit {

  trigger$ = new BehaviorSubject<string>(undefined);

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
  }
}
