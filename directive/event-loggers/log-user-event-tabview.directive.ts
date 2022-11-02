// Angular
import { Directive, ElementRef, Injector, Input, Optional } from '@angular/core';
// Caloudi
import { LogUserEventCommon, Model, TabView } from '.';

@Directive({ selector: '[logTabview]' })
export class LogUserEventTabviewDirective extends LogUserEventCommon {

  @Input('logTabview') public data: string | Model.LogUserEvent;

  private readonly eventName: string;

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement>,
    @Optional() private readonly tabview: TabView,
  ) {
    super(injector);
    if (tabview) this.eventName = this.AIEventName.tabview;

    if (!this.prod && this.eventName && this.logInit)
      this.logger.debug(`log ${this.eventName} init:`, [tabview, this.el.nativeElement]);

    this.tabview.activeIndexChange.subscribe(index => {
      try {
        if (!this.eventName) return;
        const data$: Model.LogEventTabview = {
          label: typeof this.data === 'string' ? this.data : this.data.label,
          payload: {
            data: typeof this.data !== 'string' ? this.data.payload : undefined,
            tabIndex: index,
            tabHeader: this.tabview.tabs[index]?.header,
          },
        };

        if (this.logEvent) this.logger.debug(`${this.eventName} event:`, [data$, this.tabview, index, this.el]);
        this.appInsights.trackEvent(this.eventName, data$, data$?.properties);

      } catch (error) { this.appInsights.trackTrace(error); }
    });
  }
}
