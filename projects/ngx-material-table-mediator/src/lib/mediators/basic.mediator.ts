import {MatTableMediator} from '../mat-table.mediator';
import {FetchFunction, TriggerPayload, MediatorData} from '../models';
import {Observable} from 'rxjs';
import {MatPaginator, MatSort, MatTable, SortDirection} from '@angular/material';

/**
 * A basic implementation of a MatTableMediator which takes the relevant implementations as constructor parameters.
 * Please be aware that this class will call ngOnInit() itself. Create your own class if you intend a different behaviour.
 */
export class BasicTableMediator<F, O> extends MatTableMediator<F, O> {

  constructor(protected fetchFn: FetchFunction<F, O>,
              protected trigger$: TriggerPayload<F>,
              table: MatTable<O>,
              paginator: MatPaginator,
              sort: MatSort,
              attempts: number = 0) {

    super(table, paginator, sort, attempts);
    this.ngOnInit();
  }

  fetch(payload?: F, sortBy?: string, sortDirection?: SortDirection, pageIndex?: number, pageSize?: number): Observable<MediatorData<O>> {
    return this.fetchFn(payload, sortBy, sortDirection, pageIndex, pageSize);
  }

}
