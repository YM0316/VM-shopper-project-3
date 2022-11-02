// Angular
import { Directive, ElementRef, Injector, Input, Optional } from '@angular/core';
// Rxjs
import { Observable, Subject, fromEvent, merge } from 'rxjs';
import { takeUntil, debounceTime, mergeMap, iif, of } from 'rxjs';
// Caloudi
import { LogUserEventCommon, Model, InputText } from '.';

@Directive({ selector: '[logInput]' })
export class LogUserEventInputDirective extends LogUserEventCommon {

  @Input('logInput') public data: string | Model.LogUserEvent;

  private readonly eventName: string;
  private previousValue: string;

  private readonly inputEvent: Observable<KeyboardEvent | FocusEvent>;
  private readonly inputSub = new Subject<KeyboardEvent | FocusEvent>();

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLInputElement>,
    @Optional() private readonly inputText: InputText,
  ) {
    super(injector);
    if (inputText) this.eventName = this.AIEventName.input;
    if (!this.prod && this.eventName && this.logInit)
      this.logger.debug(`log ${this.eventName} init:`, [inputText, this.el.nativeElement]);

    try {
      const blur$ = fromEvent(this.el.nativeElement, 'blur') as Observable<KeyboardEvent>;
      const keydown$ = fromEvent(this.el.nativeElement, 'keydown') as Observable<KeyboardEvent>;
      const keyup$ = fromEvent(this.el.nativeElement, 'keyup') as Observable<KeyboardEvent>;

      this.inputEvent = merge(blur$, keydown$, keyup$) as Observable<KeyboardEvent | FocusEvent>;

      this.inputEvent.pipe(
        takeUntil(this.inputSub),
        debounceTime(600),
        mergeMap(e =>
          iif(() => this.hasValue(), of(e), of())
        ),
      ).subscribe({
        next: (res) => {
          if (!inputText) return;

          const payload$: Model.LogUserEvent = {
            label: typeof this.data === 'string' ? this.data : this.data.label,
            payload: typeof this.data === 'string'
              ? (<HTMLInputElement>this.inputText.el.nativeElement).value : this.data.payload,
          };
          const properties$ = typeof this.data === 'string' ? undefined : this.data?.properties;

          if (this.logEvent)
            this.logger.debug(`${this.eventName} ${res.type} event:`, [res, payload$, properties$, this.previousValue]);
          this.previousValue = payload$.payload;
          this.appInsights.trackEvent(this.eventName, payload$, properties$);
        },
        error: (error: Error) => { this.appInsights.trackTrace(error); }
      });
    } catch (error) { this.appInsights.trackTrace(error); }
  }

  private hasValue(): boolean {
    const value = typeof this.data !== 'string'
      ? this.data?.payload : (<HTMLInputElement>this.inputText?.el.nativeElement).value;
    // return value !== undefined && value !== this.previousValue && value.length !== 0;
    return value !== undefined && value !== this.previousValue && value?.length !== 0 && value !== null;
  }

  public override ngOnChanges(changes: Model.LogSimpleChanges): void {
    // this.logger.debug('input log changes:', [changes.data]);
    if (changes.data.firstChange) this.previousValue = changes.data.currentValue.payload ?? '';
  }

  public ngOnDestroy(): void {
    this.inputSub?.next(undefined);
    this.inputSub?.unsubscribe();
  }
}
