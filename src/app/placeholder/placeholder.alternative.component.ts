import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {MatPaginator, MatSort, MatTable, SortDirection} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {ArrayTableMediator} from 'ngx-material-table-mediator';

/*@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.css']
})*/
export class PlaceholderComponent implements AfterViewInit {

  trigger$ = new BehaviorSubject<string>(undefined);

  mediator: ArrayTableMediator<void, Comment>;

  columns = ['postId', 'id', 'name', 'email'];
  isLoading$ = of(true);

  @ViewChild(MatTable) table: MatTable<Comment>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient) {
  }

  ngAfterViewInit() {
    this.mediator = new ArrayTableMediator<any, Comment>(
      (payload, sortBy, sortDirection, pageIndex, pageSize) =>
        this.fetch(payload, sortBy, sortDirection, pageIndex, pageSize),
      this.trigger$, this.table,
      this.paginator, this.sort
    );
    this.isLoading$ = this.mediator.isLoading$;
  }

  private fetch(payload: string | undefined,
                sortBy: string, sortDirection: SortDirection,
                pageIndex: number, pageSize: number): Observable<Array<Comment>> {
    return !!payload && payload.length > 0 ?
      this.http.get<Array<Comment>>(`https://jsonplaceholder.typicode.com/comments?postId=${payload}`) :
      this.http.get<Array<Comment>>(`https://jsonplaceholder.typicode.com/comments`);
  }
}
