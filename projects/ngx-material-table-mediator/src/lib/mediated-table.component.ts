import {AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTable, SortDirection} from '@angular/material';
import {Observable, of, Subject} from 'rxjs';
import {MatTableMediator} from './mat-table.mediator';
import {MediatorData, TriggerPayload} from './models';
import {BasicTableMediator} from './basic.mediator';

export abstract class MediatedTableComponent<F, O> implements AfterViewInit, OnDestroy {

  @ViewChild(MatTable) protected table: MatTable<O>;
  @ViewChild(MatPaginator) protected paginator: MatPaginator;
  @ViewChild(MatSort) protected sort: MatSort;

  protected mediator: MatTableMediator<F, O>;
  protected attempts = 0;
  protected readonly onDestroy$ = new Subject<any>();
  protected isLoading$: Observable<boolean>;

  abstract displayedColumns: string[];
  abstract trigger$: TriggerPayload<F>;

  /**
   * The `initialIsLoading` param sets the initial value for isLoading$.
   * If your fetching (read: loading) starts in ngAfterViewInit and the initial value for isLoading$ is `false`,
   * you will get an `ExpressionChangedAfterItHasBeenCheckedError`! Use this parameter to prevent this error.
   * @param initialIsLoading the initial value for isLoading$
   */
  protected constructor(initialIsLoading: boolean = false) {
    this.isLoading$ = of(initialIsLoading);
  }

  abstract fetch(payload?: F,
                 sortBy?: string,
                 sortDirection?: SortDirection,
                 pageIndex?: number,
                 pageSize?: number): Observable<MediatorData<O>>;

  abstract ngAfterViewInit();

  protected initMediator(): void {
    this.mediator = new BasicTableMediator(
      (payload, sortBy, sortDirection, pageIndex, pageSize) =>
        this.fetch(payload, sortBy, sortDirection, pageIndex, pageSize),
      this.trigger$,
      this.table, this.paginator, this.sort,
      this.attempts
    );
    this.isLoading$ = this.mediator.isLoading$;
  }

  ngOnDestroy(): void {
    this.mediator.ngOnDestroy();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
