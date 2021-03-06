import {Component} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {SortDirection} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {ArrayTableMediator, MediatedTableComponent} from 'ngx-material-table-mediator';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.css']
})
export class PlaceholderComponent extends MediatedTableComponent<string, Comment> {
  columns = ['postId', 'id', 'name', 'email'];

  trigger$ = new BehaviorSubject<string>("");

  constructor(private http: HttpClient) {
    super(ArrayTableMediator, true);
  }

  ngAfterViewInit() { // tslint:disable-line:use-life-cycle-interface
    this.initMediator();
  }

  fetch(payload: string,
        sortBy: string, sortDirection: SortDirection,
        pageIndex: number, pageSize: number): Observable<Array<Comment>> {
    return !!payload && payload.length > 0 ?
      this.http.get<Array<Comment>>(`https://jsonplaceholder.typicode.com/comments?postId=${payload}`) :
      this.http.get<Array<Comment>>(`https://jsonplaceholder.typicode.com/comments`);
  }
}
