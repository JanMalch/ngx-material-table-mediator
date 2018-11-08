import {Observable} from 'rxjs';
import {SortDirection} from '@angular/material';

/**
 * type alias for an observable of F or undefined
 * F &rarr; type of the trigger payload, same <F> as the mediator's
 */
export type TriggerPayload<F> = Observable<F | undefined>;

/**
 * type alias for a function that fetches the data for the table.
 * Used in the BasicTableMediator
 * F &rarr; type of the trigger payload, same <F> as the mediator's
 * O &rarr; type of the data, same <O> as the mediator's
 * @see BasicTableMediator
 */
export type FetchFunction<F, O> = (payload?: F, sortBy?: string,
                                   sortDirection?: SortDirection,
                                   pageIndex?: number, pageSize?: number) => Observable<MediatorData<O>>;

/**
 * Interface for the transformed API output so the mediator can feed the data in the table and observables.
 * generic is the type of the array with the table data, same <O> as the mediator's and MatTable's
 * O &rarr; type of the array with the table data, same <O> as the mediator's
 */
export interface MediatorData<O> {
  total: number;
  data: Array<O>;
}


