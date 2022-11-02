// Angular
import { Directive, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
// Rxjs
import { first } from 'rxjs';
// Store
import { Store } from '@ngrx/store';
import { TempStoreAppend } from '@store/action';
import { Selectors } from '@store/selector';

@Directive({ selector: '[temp]' })
export class TempStoreDirective {

  @Input('temp')
  public tempStorePayload: TempStorePayload;

  @Output('tempChange')
  public tempStoreEmitter = new EventEmitter<any>();

  private readonly logActive: boolean = false;

  constructor(
    private readonly store: Store,
    private readonly router: Router,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tempStorePayload.firstChange) {
      this.store.select(Selectors.temp)
        .pipe(first())
        .subscribe((res: TempStoreState & TempStoreStateItem) => {
          const key = this.router.url;
          const keys = Object.keys(res || {});

          if (!(keys.some(v => v === key)) || !res[key]?.[this.tempStorePayload.key])
            this.store.dispatch(TempStoreAppend({
              [key]: {
                ...res[key],
                [this.tempStorePayload.key]: this.tempStorePayload.payload,
              },
            }));
          else
            this.tempStoreEmitter.emit(res[key][this.tempStorePayload.key]);

          if (this.logActive) console.debug('temp store:', [res, keys]);
        });
    }
    else {
      this.store.select(Selectors.temp)
        .pipe(first())
        .subscribe(res => {
          const key = this.router.url;
          this.store.dispatch(TempStoreAppend({
            [key]: {
              ...res[key],
              [this.tempStorePayload.key]: this.tempStorePayload.payload
            }
          }));
        });
    }
  }
}

interface TempStoreStateItem {
  [route: string]: TempStorePayload,
}

interface TempStoreState {
  type: string;
}

interface TempStorePayload {
  key: string;
  payload: any;
}
