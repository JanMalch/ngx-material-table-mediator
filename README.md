# !! Development has moved to [ngx-mat-table-mediator](https://github.com/JanMalch/ngx-mat-table-mediator)

[![npm version](https://badge.fury.io/js/ngx-material-table-mediator.svg)](https://badge.fury.io/js/ngx-material-table-mediator)

# ngx-material-table-mediator

This library provides the following classes to help you manage a MatTable, MatSort and MatPaginator in your component.
The data for the table comes from an observable.

* `MatTableMediator` → The abstract base class that contains all the logic.
* `BasicTableMediator` → An implementation of the `MatTableMediator` to have in your component.
* `ArrayTableMediator` → This mediator takes an array as data and takes care of sorting and pagination on client side.
* `MediatedTableComponent` → An abstract class for your component that takes away all the boilerplate code. **[Recommended]**

### Installation

```
npm i ngx-material-table-mediator
```

## Usage

You can create your own subclass of `MatTableMediator`, or use the provided implementations
(see examples [here](https://github.com/JanMalch/ngx-material-table-mediator/blob/master/src/app/git-hub/git-hub.basic-mediator.component.ts) 
and [here](https://github.com/JanMalch/ngx-material-table-mediator/blob/master/src/app/placeholder/placeholder.alternative.component.ts)).

The recommend approach is to use the `MediatedTableComponent` class. Here's all you need in your component 
([example 1](https://github.com/JanMalch/ngx-material-table-mediator/blob/master/src/app/placeholder/placeholder.component.ts),
[example 2](https://github.com/JanMalch/ngx-material-table-mediator/blob/master/src/app/git-hub/git-hub.component.ts)).

```typescript
@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.css']
}) //                                                  <trigger payload, table data>
export class PlaceholderComponent extends MediatedTableComponent<string, Comment> {
  columns = ['postId', 'id', 'name', 'email']; // set the columns for your table
  trigger$ = new BehaviorSubject<string>(""); // add a trigger to start fetching the data
  // the trigger$ helps you control the fetching via button clicks etc.
  // if you want to fetch right away and don't use this just put   = of(undefined)

  constructor(private http: HttpClient) {
    // specify which implementation you want to use
    // use a boolen flag to indicate initial loading status, to prevent ExpressionChangedAfterItHasBeenCheckedError errors
    super(ArrayTableMediator, true);
  }

  ngAfterViewInit() { // tslint:disable-line:use-life-cycle-interface
    this.initMediator(); // call this once in ngAfterViewInit, when the @ViewChild's are available
    // note that you don't have to write the @ViewChild's yourself!
  }

  // implement your fetch function with the provided data
  // this can be an HTTP call or getting store data
  // if you use the BasicTableMediator in the super call you should return an Observable<MediatorData<Comment>>
  fetch(payload: string,
        sortBy: string, sortDirection: SortDirection,
        pageIndex: number, pageSize: number): Observable<Array<Comment>> {
    return !!payload && payload.length > 0 ?
      this.http.get<Array<Comment>>(`https://jsonplaceholder.typicode.com/comments?postId=${payload}`) :
      this.http.get<Array<Comment>>(`https://jsonplaceholder.typicode.com/comments`);
  }
}
```

The HTML is entirely up to you. See an example [here](https://github.com/JanMalch/ngx-material-table-mediator/blob/master/src/app/placeholder/placeholder.component.html).

>Note that the abstract component provides an `isLoading$` observable, which automatically connects to the mediator.
>This helps you prevent common errors.

### Mapping results

If you use the `BasicTableMediator` you might have to map your fetched data to the `MediatorData` interface.

```typescript
return this.http.get<GithubApi>(requestUrl).pipe(
  map(response => ({
      data: response.items,
      total: response.total_count
    })
  )
);
```

See [here](https://github.com/JanMalch/ngx-material-table-mediator/blob/master/src/app/git-hub/git-hub.component.ts#L38).

## Mediator class

You can access the mediator object in your component via `this.mediator`.

### Hooks

The class provides the following hooks as observables, to react to certain events.

- `data$: Observable<Array<O>>` → the data for the table. **You do not have to connect the table with this Observable!**
- `error$: Observable<Error>` → any errors occurring while fetching. Note that the mediator will still work
- `isLoading$: Observable<boolean>` → indicates loading
- `totalResults$: Observable<number>` → total count of results that are available on the server
- `onResultsFound$: Observable<number>` → only emits if results were found (x > 0)
- `onNoResultsFound$: Observable<void>` → only emits if no results were found (x === 0)
- `onFetchBegin$: Observable<void>` → only emits if loading has started. You might use this to hide previous errors

### Your custom mediator

Besides the necessary implementations you can override the following methods, to implement custom behaviour.

- `handleResult(result: MediatorData<O>): void` → This function gets called every time new data was fetched.
                                                   It's responsible for feeding the data into the right places.
- `handleError(error: Error): Observable<MediatorData<O>>` → This function handles any errors that occur while fetching the data.
                   You can either safely handle the error and return replacement data or rethrow the error.
- `initDataFetch(): void` → This is the mediator's core function and setups the logic.
- `initPageReset(): void` → This function creates an internal observable to reset the paginator, if sorting or trigger payload changes.
- `ngOnInit(): void` → This function initialises the page reset and the fetch function.
- `trackByFn(index: number, item: O): any` → An optional function passed into the MatTable that defines how to track the items.

Since `MatPaginator` and `MatSort` are optional, the mediator has a few getter properties that ensure safe access:

`sortChange$`, `sortActive`, `sortDirection`, `page$`, `pageIndex`, `pageSize`

>You can find an example of a custom Mediator class [here](https://github.com/JanMalch/ngx-material-table-mediator/blob/master/src/app/git-hub/git-hub.custom-mediator.component.ts).

