// Angular
import { Directive, ElementRef, HostListener, Injector, Input, Optional } from '@angular/core';
import { RadioButton } from 'primeng/radiobutton';
// Caloudi
import { Button, LogUserEventCommon, Model, ToggleButton } from '.';

@Directive({ selector: '[logData], [logDialog], [logLink], [logButton], [logShare]' })
export class LogUserEventLinkDirective extends LogUserEventCommon {

  @Input('logData') public data: Model.LogUserEvent;
  @Input('logDialog') public dataDialog: Model.LogEventDialog;
  @Input('logLink') public dataLink: Model.LogEventLink;
  @Input('logButton') public dataButton: string | Model.LogEventButton;
  @Input('logShare') public dataShare: Model.LogUserEventTable;

  private eventName: string;

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement | HTMLButtonElement | HTMLAnchorElement>,
    @Optional() private readonly pButton: Button,
    @Optional() private readonly toggleButton: ToggleButton,
    @Optional() private readonly radioButton: RadioButton,
  ) {
    super(injector);
    // this.logger.debug(`log link init:`, [el.nativeElement]);

    if (radioButton) radioButton.onClick.subscribe((_event: PointerEvent) => {
      this.eventName = this.AIEventName.radioButton;
      const payload$: Model.LogUserEvent = {
        label: typeof this.dataButton === 'string' ? this.dataButton : this.dataButton.label,
        payload: { data: this.radioButton.value }
      };
      if (this.logEvent)
        this.logger.debug(`${this.eventName} event:`, [payload$, this.dataButton, _event, this.radioButton]);
      this.appInsights.trackEvent(this.eventName, payload$, (<Model.LogEventButton>this.dataButton)?.properties);
    });
  }

  @HostListener('click', ['$event'])
  public onClick(e: MouseEvent): void {
    try {
      if (this.radioButton) return;
      const data$ = this.data || this.dataDialog || this.dataLink || this.dataShare;
      const btn$ = this.dataButton;
      if (btn$) {
        if (this.pButton) this.eventName = this.AIEventName.button;
        else if (this.toggleButton) this.eventName = this.AIEventName.toggleButton;
        else this.eventName = this.AIEventName.button;
      } else switch (data$) {
        case this.data: this.eventName = this.AIEventName.data; break;
        case this.dataDialog: this.eventName = this.AIEventName.dialog; break;
        case this.dataLink: this.eventName = this.AIEventName.link; break;
        case this.dataShare: this.eventName = this.AIEventName.share; break;
        default: return;
      }

      if (this.logEvent)
        this.logger.debug(`${this.eventName} event:`, [data$ || btn$, this.pButton || this.toggleButton || this.el, e]);

      if (!btn$) this.appInsights.trackEvent(this.eventName, data$, data$?.properties);
      else {
        const payload$: Model.LogUserEvent = {
          label: typeof this.dataButton === 'string' ? this.dataButton : this.dataButton.label,
          payload: undefined
        };
        if (typeof this.dataButton === 'string') {
          if (this.toggleButton) payload$.payload = { checked: this.toggleButton.checked };
        } else payload$.payload = this.dataButton.payload;

        this.appInsights.trackEvent(this.eventName, payload$, (<Model.LogEventButton>this.dataButton)?.properties);
      }
    } catch (error) { this.appInsights.trackTrace(error); }
  }
}
