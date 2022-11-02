// Angular
import { Directive, ElementRef, Injector, Input, Optional } from '@angular/core';
// Caloudi
import { LogUserEventCommon, Model, Panel } from '.';

@Directive({ selector: '[logPanel]' })
export class LogUserEventPanelDirective extends LogUserEventCommon {

  @Input('logPanel') public data: string | Model.LogUserEvent;

  private readonly eventName: string;

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement>,
    @Optional() private readonly panel: Panel,
  ) {
    super(injector);
    if (panel) this.eventName = this.AIEventName.panel;

    if (!this.prod && this.eventName && this.logInit)
      this.logger.debug(`log ${this.eventName} init:`, [panel, this.el.nativeElement]);

    this.panel.collapsedChange.subscribe(collapsed => {
      try {
        if (!this.eventName) return;
        const data$: Model.LogEventPanel = {
          label: typeof this.data === 'string' ? this.data : this.data.label,
          payload: {
            collapsed: collapsed,
            header: this.panel.header,
            data: typeof this.data === 'string' ? undefined : this.data.payload,
          },
        };

        if (this.logEvent) this.logger.debug(`${this.eventName} event:`, [data$, this.panel, collapsed, this.el]);
        this.appInsights.trackEvent(this.eventName, data$, data$?.properties);
      } catch (error) { this.appInsights.trackTrace(error); }
    });
  }
}
