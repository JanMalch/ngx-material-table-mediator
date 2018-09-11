[![npm version](https://badge.fury.io/js/ngx-material-table-mediator.svg)](https://badge.fury.io/js/ngx-material-table-mediator)

# ngx-material-table-mediator

This library provides an abstract class `MatTableMediator`,
which helps you manage a MatTable, MatSort and MatPaginator in your component.
It also contains the `BasicTableMediator`, a simple implementation of `MatTableMediator`.

## Installation

```
npm i ngx-material-table-mediator
```

## Usage

```typescript
import {MatTableMediator} from 'ngx-material-table-mediator';
```

Since it's an abstract class you have to create your own subclasses. Only 3 things are required:

```typescript
fetch(payload: F,
      sortBy: string, 
      sortDirection: SortDirection,
      pageIndex: number,
       pageSize: number): Observable<MediatorData<O>> {
  // call your API and map the result to MediatorData<O>
  // where <O> is the generic type for MatTable (it's data, e.g. GithubIssue, not Array<GithubIssue> !)
}
```

```typescript
// an Observable to trigger fetching and sending a payload in the body.
protected fetchPayload$: FetchPayload<F>; // you can also put this in your constructor!
```

```typescript
constructor( 
  // ...
  table: MatTable<O>,
  paginator: MatPaginator,
  sort: MatSort
) {
  super(table, paginator, sort);
  // ...
  // due to inheritance this cannot be called by the super class every time
  this.ngOnInit(); // you don't have to call this in the constructor. It depends on your use case.
}
```

The mediator will take care of feeding the objects the correct data.

You can find an example [here](https://github.com/JanMalch/ngx-material-table-mediator/blob/master/src/app/app.component.ts).

## `BasicTableMediator`

You can also use the `BasicTableMediator`, which takes the fetch function and and fetchPayload as constructor parameters.
This is useful for simple mediators and makes creating subclasses unnecessary.

```typescript
ngAfterViewInit() {
  this.mediator = new BasicTableMediator<any, GithubIssue>(
    (payload, sortBy, sortDirection, pageIndex, pageSize) =>
      this.fetch(payload, sortBy, sortDirection, pageIndex, pageSize),
    this.trigger$, this.table,
    this.paginator, this.sort
  );

  this.isLoading$ = this.mediator.isLoading$;
  this.mediator.error$.subscribe(() => this.isRateLimitReached$.next(true));
  this.mediator.onFetchBegin$.subscribe(() => this.isRateLimitReached$.next(false));
}

private fetch(payload: undefined,
              sortBy: string, sortDirection: SortDirection,
              pageIndex: number, pageSize: number): Observable<MediatorData<GithubIssue>> {
  // your API call
}
```

## Hooks

The class provides the following hooks as observables, to react to certain events.

- `data$: Observable<Array<O>>` → the data for the table. **You do not have to connect the table with this Observable!**
- `error$: Observable<Error>` → any errors occurring while fetching. Note that the mediator will still work
- `isLoading$: Observable<boolean>` → indicates loading
- `totalResults$: Observable<number>` → total count of results that are available on the server
- `onResultsFound$: Observable<number>` → only emits if results were found (x > 0)
- `onNoResultsFound$: Observable<void>` → only emits if no results were found (x === 0)
- `onFetchBegin$: Observable<void>` → only emits if loading has started. You might use this to hide previous errors

## Your custom mediator

Besides the necessary implementations you can override the following methods, to implement custom behaviour.

- `handleResult(result: MediatorData<O>): void` → This function gets called every time new data was fetched.
                                                   It's responsible for feeding the data into the right places.
- `handleError` → This function handles any errors that occur while fetching the data.
                   You can either safely handle the error and return replacement data or rethrow the error.
- `initDataFetch` → This is the mediator's core function and setups the logic.
- `initPageReset` → This function creates an internal observable to reset the paginator, if sorting or fetch payload changes.
- `ngOnInit` → This function initialises the page reset and the fetch function.
- `trackByFn` → An optional function passed into the MatTable that defines how to track the items.

Since `MatPaginator` and `MatSort` are optional the mediator has a few getter properties, that ensure safe access:

`sortChange$`, `sortActive`, `sortDirection`, `page$`, `pageIndex`, `pageSize`
