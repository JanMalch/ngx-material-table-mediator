import {AfterViewInit, OnDestroy, ViewChild} from "@angular/core";
import {MatPaginator, MatSort, MatTable, SortDirection} from "@angular/material";
import {Observable, of} from "rxjs";
import {MatTableMediator} from "./mat-table.mediator";
import {Newable, TriggerPayload} from "./models";

export abstract class MediatedTableComponent<F, O> implements AfterViewInit, OnDestroy {

  @ViewChild(MatTable) table: MatTable<O>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  protected mediator: MatTableMediator<F, O>;
  protected attempts = 0;
  isLoading$: Observable<boolean>;

  abstract columns: string[];
  abstract trigger$: TriggerPayload<F>;

  /**
   * The `initialIsLoading` param sets the initial value for isLoading$.
   * If your fetching (read: loading) starts in ngAfterViewInit and the initial value for isLoading$ is `false`,
   * you will get an `ExpressionChangedAfterItHasBeenCheckedError`! Use this parameter to prevent this error.
   * @param mediatorClass Class of the Mediator to use
   * @param initialIsLoading the initial value for isLoading$
   */
  protected constructor(private mediatorClass: Newable<MatTableMediator<F, O>>,
                        initialIsLoading: boolean = false) {
    this.isLoading$ = of(initialIsLoading);
  }

  abstract fetch(payload?: F,
                 sortBy?: string,
                 sortDirection?: SortDirection,
                 pageIndex?: number,
                 pageSize?: number): Observable<any>;

  abstract ngAfterViewInit();

  protected initMediator(): void {
    this.mediator = new this.mediatorClass(
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
  }

}
