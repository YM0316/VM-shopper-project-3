// Angular
import { Directive, ElementRef, Injector, Input, Optional } from '@angular/core';
import { fromEvent, Observable, Subject, takeUntil } from 'rxjs';
// Caloudi
import { LogUserEventCommon, Model, Slider } from '.';

@Directive({ selector: '[logSlider]' })
export class LogUserEventSliderDirective extends LogUserEventCommon {

  /** Label only or custom payload object */
  @Input('logSlider') public data: string | Model.LogUserEvent;

  private readonly eventName: string;
  private element: boolean;
  private previousValue: string;

  private readonly mousedownEvent = new Subject<MouseEvent>();
  private readonly mouseupEvent = new Subject<MouseEvent>();

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement>,
    @Optional() private readonly slider: Slider,
  ) {
    super(injector);
    if (slider) this.eventName = this.AIEventName.slider;

    if (!this.prod && this.eventName && this.logInit)
      this.logger.debug(`log ${this.eventName} init:`, [slider, this.el.nativeElement]);

    const mousedown$ = fromEvent(this.el.nativeElement, 'mousedown') as Observable<MouseEvent>;
    const mouseup$ = fromEvent(document, 'mouseup') as Observable<MouseEvent>;

    mousedown$.pipe(takeUntil(this.mousedownEvent)).subscribe((_e: MouseEvent) => {
      this.element = true;
    });
    mouseup$.pipe(takeUntil(this.mouseupEvent)).subscribe((_e: MouseEvent) => {
      if (!this.element) return; else this.element = false;
      try {
        const data$ = typeof this.data === 'string' ? { label: this.data, payload: slider.value } : this.data;
        if (this.logEvent) this.logger.debug(`${data$.label} mouseup:`, [slider, this.data]);
        const payload$: Model.LogUserEvent = {
          ...data$,
          payload: {
            min: this.slider.min,
            max: this.slider.max,
            step: this.slider.step,
            range: this.slider.range,
            value: this.slider.value ?? this.slider.values,
          }
        };
        if (this.previousValue !== JSON.stringify(payload$))
          this.appInsights.trackEvent(this.eventName, payload$, data$?.properties);
        this.previousValue = JSON.stringify(payload$);
      } catch (error) { this.appInsights.trackTrace(error); }
    });
  }

  public ngOnDestroy(): void {
    this.mousedownEvent?.next(undefined);
    this.mouseupEvent?.next(undefined);
    this.mousedownEvent.unsubscribe();
    this.mouseupEvent?.unsubscribe();
  }
}
