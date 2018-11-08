import {MatPaginator, MatSort, MatTable, SortDirection} from '@angular/material';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MediatorData, TriggerPayload} from './models';
import {MatTableMediator} from './mat-table.mediator';

export class LocalTableMediator<F, O> extends MatTableMediator<F, O> {

  constructor(protected fetchFn: (payload?: F, sortBy?: string,
                                  sortDirection?: SortDirection,
                                  pageIndex?: number, pageSize?: number) => Observable<Array<O>>,
              protected trigger$: TriggerPayload<F>,
              table: MatTable<O>,
              paginator: MatPaginator,
              sort: MatSort,
              attempts: number = 0) {

    super(table, paginator, sort, attempts);
    this.ngOnInit();
  }

  fetch(payload?: F, sortBy?: string, sortDirection?: SortDirection, pageIndex?: number, pageSize?: number): Observable<MediatorData<O>> {
    return this.fetchFn(payload, sortBy, sortDirection, pageIndex, pageSize).pipe(
      map(data => {
        if (sortDirection !== "") {
          data.sort((a, b) => {
            const cmp = a[sortBy] < b[sortBy] ? -1 : 1;
            const direction = sortDirection === 'desc' ? -1 : 1;
            return direction * cmp;
          });
        }

        return {
          data: data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
          total: data.length
        };
      })
    );
  }

}
