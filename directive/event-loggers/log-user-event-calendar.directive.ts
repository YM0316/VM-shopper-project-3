// Angular
import { Directive, ElementRef, Injector, Input, Optional } from '@angular/core';
// Caloudi
import { Calendar, LogUserEventCommon, Model } from '.';

@Directive({ selector: '[logCalendar]' })
export class LogUserEventCalendarDirective extends LogUserEventCommon {

  @Input('logCalendar') public dataCalendar: string | Model.LogUserEvent;

  private eventName: string;

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement>,
    @Optional() private readonly calendar: Calendar,
  ) {
    super(injector);
  }

  public ngOnInit(): void {
    if (this.calendar) this.eventName = this.AIEventName.calendar;

    if (this.eventName && this.logInit) this.logger.debug(`log ${this.eventName} init:`, [
      this.calendar, this.el.nativeElement]);

    this.calendar.onSelect.subscribe((date: Date) => {
      if (typeof this.dataCalendar !== 'string') return;
      const payload$: Model.LogUserEvent = {
        label: this.dataCalendar,
        payload: date,
      };
      if (this.logEvent)
        this.logger.debug(`${this.eventName} event by label:`, [date, payload$, this.calendar]);
      this.appInsights.trackEvent(this.eventName, payload$);
    });
  }

  public override ngOnChanges(changes: LogEventCalendarChanges): void {
    try {
      const data$: Model.LogUserEventChange = changes.dataCalendar;
      if (!this.eventName
        || typeof this.dataCalendar === 'string'
        || (!data$?.currentValue.payload && !data$?.previousValue.payload)) return;

      if (this.changeCheck(data$, this.eventName)) return;

      if (this.logEvent)
        this.logger.debug(`${this.eventName} event:`, [data$, this.calendar]);
      this.appInsights.trackEvent(this.eventName, data$.currentValue, data$?.currentValue.properties);
    } catch (error) { this.appInsights.trackTrace(error); }
  }
}

interface LogEventCalendarChanges extends Model.LogSimpleChanges {
  dataCalendar: Model.LogUserEventChange,
}
