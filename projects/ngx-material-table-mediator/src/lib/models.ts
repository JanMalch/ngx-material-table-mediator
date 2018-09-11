
/**
 * type alias for an observable of F or undefined
 * F &rarr; type of the fetch payload, same <F> as the mediator's
 */
import {Observable} from 'rxjs';

export type FetchPayload<F> = Observable<F | undefined>;

/**
 * Interface for the transformed API output so the mediator can feed the data in the table and observables.
 * generic is the type of the array with the table data, same <O> as the mediator's and MatTable's
 * O &rarr; type of the array with the table data, same <O> as the mediator's
 */
export interface MediatorData<O> {
  total: number;
  data: Array<O>;
}
