// Angular
import { Directive, ElementRef, Injector, Input } from '@angular/core';
// Caloudi
import { LogUserEventCommon, Model } from '.';

@Directive({ selector: '[logPeriod]' })
export class LogUserEventPeriodSelectorDirective extends LogUserEventCommon {

  @Input('logPeriod') public data: Model.LogEventPeriod;

  private readonly tagMatch: boolean;
  private readonly eventName: string;

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLInputElement>,
  ) {
    super(injector);
    const parent = el?.nativeElement?.parentElement;
    this.tagMatch = parent?.tagName.toLowerCase() === 'caloudi-common-period-selector'
      || parent?.tagName.toLowerCase() === 'cps'
      || !!parent?.attributes.getNamedItem('cps');
    if (this.tagMatch)
      this.eventName = this.AIEventName.period;
    if (!this.prod && this.eventName && this.logInit)
      this.logger.debug(`log ${this.eventName} init:`, [parent, this.data]);
  }

  public override ngOnChanges(changes: Model.LogSimpleChanges): void {
    try {
      const data$ = changes.data as Model.LogUserEventChange<Model.LogEventPeriod>;
      if (this.changeCheck(data$, this.eventName)) return;
      if (typeof data$.previousValue.payload === 'undefined') return;
      const payload$: Model.LogEventPeriod = {
        label: data$.currentValue.label,
        payload: {
          defaultRange: data$.currentValue.payload.defaultRange,
          displayTitle: data$.currentValue.payload.displayTitle,
          start: data$.currentValue.payload.start,
          end: data$.currentValue.payload.end,
        },
        properties: data$.currentValue.properties,
      };

      if (this.logEvent) this.logger.debug(`${this.eventName} event:`, [data$, payload$, this.data, this.el]);
      this.appInsights.trackEvent(this.eventName, payload$, data$?.currentValue.properties);
    } catch (error) { this.appInsights.trackTrace(error); }
  }
}
