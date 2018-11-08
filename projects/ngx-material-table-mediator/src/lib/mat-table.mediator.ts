import {EventEmitter, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {BehaviorSubject, combineLatest, merge, Observable, of, Subject} from 'rxjs';
import {MatPaginator, MatSort, MatTable, PageEvent, Sort, SortDirection} from '@angular/material';
import {catchError, filter, map, mapTo, mergeMap, retry, startWith, takeUntil} from 'rxjs/operators';
import {TriggerPayload, MediatorData} from './models';

/**
 * This mediator class takes care of connecting and managing an Angular Material table with pagination, sorting and data from an observable.
 * It takes care of:
 * - firing the `fetch` function when the `trigger$`, sorting or page changes
 * - resetting page index to 0, if `trigger$` or sorting changes
 * - error handling (retries or emits error$ and returns empty data array)
 * - indicating loading
 * - completing all observables, if ngOnDestroy() is called
 *
 * After creating an object of the mediator, it will automatically be ready to load the data, as soon as a trigger$ is emitted.
 *
 * You can change the behaviour by overwriting the init functions (For example not calling #initDataFetch in #ngOnInit).
 *
 * **Required Generics**
 * - #1 <F> &rarr; type of the trigger payload to be used in the underlying `fetch` function, for example a form output
 * - #2 <O> &rarr; type of the output data for the table. This must match MatTable's generic type
 */
export abstract class MatTableMediator<F, O> implements OnInit, OnDestroy {

  protected _destroy$ = new Subject<void>();
  protected _data$ = new Subject<Array<O>>();
  protected _error$ = new Subject<Error>();
  protected _loading$ = new BehaviorSubject<boolean>(false);
  protected _totalResults$ = new Subject<number>();

  /**
   * the observable whose latest value always gets fed into the fetch function
   * If you don't need this please use the following example in your class
   * @example
   * protected trigger$ = of(undefined); // start instantly
   * protected trigger$ = new ReplaySubject<any>(1); // only on a button click
   * protected trigger$ = new BehaviourSubject<any>(undefined); // start instantly and on every other button click
   */
  protected abstract get trigger$(): TriggerPayload<F>;

  /**
   * Creates a new instance of a MatTableFetchMediator and calls its `ngOnInit` function.
   * @see MatTableMediator
   * @param table Reference to the MatTable
   * @param paginator Reference to the MatPaginator
   * @param sort Reference to the MatSort
   * @param [attempts=0] An optional number of retries before an error will be emitted. Defaults to `0`
   */
  protected constructor(protected readonly table: MatTable<O>,
              protected readonly paginator?: MatPaginator,
              protected readonly sort?: MatSort,
              protected readonly attempts: number = 0) {
  }

  /**
   * The function which is used for communicating with the API.
   * @param payload the latest trigger payload
   * @param sortBy the currently selected column
   * @param sortDirection `"asc"`, `"desc"` or `""`
   * @param pageIndex the current page the user is on
   * @param pageSize the given page size by the user
   */
  abstract fetch(payload?: F,
                 sortBy?: string,
                 sortDirection?: SortDirection,
                 pageIndex?: number,
                 pageSize?: number): Observable<MediatorData<O>>; // TODO: in separates interface

  /**
   * An optional function passed into the MatTable that defines how to track the items
   * @param index index of the element
   * @param item the element itself
   * @see TrackByFunction
   */
  trackByFn(index: number, item: O): any {
    return index;
  }

  /**
   * safely returns `this.sort.sortChange.pipe(startWith({}))` or `of(undefined)`, if MatSort object wasn't provided
   */
  protected get sortChange$(): EventEmitter<Sort> {
    return !!this.sort ?
      this.sort.sortChange.pipe(startWith({})) :
      of(undefined) as any;
  }

  /**
   * safely returns `this.sort.active` or `undefined`, if MatSort object wasn't provided
   */
  protected get sortActive(): string | undefined {
    return !!this.sort ? this.sort.active : undefined;
  }

  /**
   * safely returns `this.sort.direction` or `undefined`, if MatSort object wasn't provided
   */
  protected get sortDirection(): SortDirection | undefined {
    return !!this.sort ? this.sort.direction : undefined;
  }

  /**
   * safely returns `this.paginator.page.pipe(startWith({}))` or `of(undefined)`, if MatPaginator object wasn't provided
   */
  protected get page$(): EventEmitter<PageEvent> {
    return !!this.paginator ?
      this.paginator.page.pipe(startWith({})) :
      of(undefined) as any;
  }

  /**
   * safely returns `this.paginator.pageIndex` or `undefined`, if MatPaginator object wasn't provided
   */
  protected get pageIndex(): number | undefined {
    return !!this.paginator ? this.paginator.pageIndex : undefined;
  }

  /**
   * safely returns `this.paginator.pageSize` or `undefined`, if MatPaginator object wasn't provided
   */
  protected get pageSize(): number | undefined {
    return !!this.paginator ? this.paginator.pageSize : undefined;
  }

  /**
   * This function initialises the page reset and the fetch function.
   * It won't be called automatically. If you dont want to delay you can run it at the end of your subclass' constructor.
   */
  ngOnInit() {
    this.initPageReset();
    this.table.trackBy = this.trackByFn;

    this.initDataFetch();
  }

  /**
   * This function creates an internal observable to reset the paginator, if sorting or trigger payload changes.
   */
  protected initPageReset() {
    merge(this.sortChange$, this.trigger$).pipe(
      takeUntil(this._destroy$)
    ).subscribe(() => {
      if (!!this.paginator) {
        this.paginator.pageIndex = 0;
      }
    });
  }

  /**
   * This is the mediator's core function and setups the logic.
   * It merges the relevant observables, starts the fetch function and maps the values to fit the mediator's needs.
   */
  protected initDataFetch() {
    combineLatest(
      this.trigger$,
      this.sortChange$,
      this.page$
    ).pipe(
      takeUntil(this._destroy$),
      map(([payload]) => payload),
      mergeMap(payload => {
        this._loading$.next(true);

        return this.fetch(payload,
          this.sortActive,
          this.sortDirection,
          this.pageIndex,
          this.pageSize)
          .pipe(
            retry(this.attempts),
            catchError(err => this.handleError(err))
          );
      })
    ).subscribe(result => this.handleResult(result));
  }

  /**
   * This function handles any errors that occur while fetching the data.
   * You can either safely handle the error and return replacement data or rethrow the error.
   * Throwing an error will complete the observable and would have to be started again by calling #initDataFetch
   * @param error The thrown error
   * @returns The replacement data as an observable (e.g. `return of({ total: -1, data: [] });`)
   */
  protected handleError(error: Error): Observable<MediatorData<O>> {
    this._error$.next(error);

    return of({
      total: -1,
      data: []
    });
  }

  /**
   * This function gets called every time new data was fetched. It's responsible for feeding the data into the table and paginator.
   * It also controls the subjects for the properties like data$, resultsLength$ and isLoading$
   * @param result the result of the fetchFn, already mapped to MediatorData<O>
   */
  protected handleResult(result: MediatorData<O>): void {
    if (!instanceOfMediatorData(result)) {
      throw new Error('MatTableMediator // No \'data\' or \'total\' key found in result. ' +
        'Please add a mapper function, that returns a valid MediatorData object.\n' +
        'Result after mapping (stringified first 100 chars):\n' +
        JSON.stringify(result, null, 4).substring(0, 100));
    }

    const {data, total} = result;

    this._totalResults$.next(total);
    this._data$.next(data);

    if (!!this.paginator) {
      this.paginator.length = total;
    }
    this.table.dataSource = data;

    this._loading$.next(false);
  }

  /**
   * Returns an observable of the data, which gets fed into the table.
   * The mediator takes care of feeding the table. You can use this property for additional actions.
   */
  get data$(): Observable<Array<O>> {
    return this._data$.asObservable();
  }

  /**
   * Returns an observable with the latest error.
   * It does **NOT** return undefined, when a fetch was succesful.
   */
  get error$(): Observable<Error> {
    return this._error$.asObservable();
  }

  /**
   * Returns an observable which indicates loading.
   * by default loading starts when the fetch function gets triggered and
   * ends when data was received and just before the table and paginator gets fed.
   */
  get isLoading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  /**
   * Returns an observable which emits the total count of results that are available on the server.
   * The mediator takes care of feeding the paginator. You can use this property for additional actions.
   */
  get totalResults$(): Observable<number> {
    return this._totalResults$.asObservable();
  }

  /**
   * Returns an observable which only emits if results were found.
   *
   * It's a filter for the resultsLength$ property with `x > 0`.
   */
  get onResultsFound$(): Observable<number> {
    return this._totalResults$.asObservable().pipe(
      filter(x => x > 0)
    );
  }

  /**
   * Returns an observable which only emits if **NO** results were found.
   *
   * It's a filter for the resultsLength$ property with `x === 0`.
   */
  get onNoResultsFound$(): Observable<void> {
    return this._totalResults$.asObservable().pipe(
      filter(x => x === 0),
      mapTo(undefined)
    );
  }

  /**
   * Returns an observable which only emits if loading has started.
   * You may use this to hide an error message or perform other actions.
   */
  get onFetchBegin$(): Observable<void> {
    return this._loading$.asObservable().pipe(
      filter(x => x),
      mapTo(undefined)
    );
  }

  /**
   * Completes all created observables so there are no memory leaks.
   *
   * **You have to call this manually!**
   */
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
    this._data$.complete();
    this._error$.complete();
    this._loading$.complete();
    this._totalResults$.complete();
  }
}

function instanceOfMediatorData(object: any): boolean {
  return 'data' in object && 'total' in object;
}
