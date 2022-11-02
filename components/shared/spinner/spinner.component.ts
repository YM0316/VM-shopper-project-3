// Angular
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResolveStart, Router } from '@angular/router';

// Rxjs
import { filter, map, throttleTime } from 'rxjs/operators';
import { asyncScheduler, skip } from 'rxjs';

// Ngx
import { NgxSpinnerService, Spinner } from 'ngx-spinner';
import { NGXLogger } from 'ngx-logger';

// Store
import { AppState, BlockUIState } from '@store/reducer';
import { getBlockUI } from '@store/selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'spinner, [spinner]',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.sass'],
})
export class SpinnerComponent {

  @Input('name') public spinnerName: string = 'spinner';
  @Input('option') public spinnerOption: Spinner = {
    type: 'ball-spin-clockwise',
    fullScreen: true,
    zIndex: 2047,
  };

  public loading: boolean;
  @Output('loading') public isLoading: EventEmitter<boolean>;

  private loggerActive: boolean = false;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly router: Router,
    protected readonly spinnerService: NgxSpinnerService,
    protected readonly store: Store<AppState>,

  ) {
    this.logger.debug('Spinner in')

    this.isLoading = new EventEmitter<boolean>();

    this.router.events.pipe(
      filter(event => event instanceof ResolveStart),
    ).subscribe((_event: ResolveStart): void => {
      this.spinnerService.hide(this.spinnerName);
    });

    this.store.select<BlockUIState>(getBlockUI).pipe(
      skip(1),
      throttleTime(300, asyncScheduler, { leading: false, trailing: true }),
      map(v => { if (this.loggerActive) this.logger.debug('count', v); return v; }),
    ).subscribe({
      next: res => {
        this.loading = res.count > 0;
        this.isLoading.emit(res.count > 0);

        if (res.count <= 0) this.spinnerService.hide(this.spinnerName);
        else this.spinnerService.show(this.spinnerName);
      },
      error: (e) => { this.logger.error(e); this.spinnerService.hide(this.spinnerName); }
    });
  }
}
