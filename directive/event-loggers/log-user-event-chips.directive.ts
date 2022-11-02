// Angular
import { Directive, ElementRef, Injector, Input, Optional } from '@angular/core';
// Rxjs
import { merge, Observable } from 'rxjs';
// Caloudi
import { AutoComplete, Chips, LogUserEventCommon, Model, PEvent } from '.';

@Directive({ selector: '[logChips], [logAutoComplete]' })
export class LogUserEventChipsDirective extends LogUserEventCommon {

  @Input('logChips') public dataChips: string | Model.LogUserEvent;
  @Input('logAutoComplete') public dataAutoComplete: string | Model.LogUserEvent;

  private eventName: string;

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement>,
    @Optional() private readonly chips: Chips,
    @Optional() private readonly autoComplete: AutoComplete,
  ) {
    super(injector);
    try {
      if (this.chips) this.eventName = this.AIEventName.chips;
      if (this.autoComplete) this.eventName = this.AIEventName.autoComplete;

      if (this.eventName && this.logInit)
        this.logger.debug(`log ${this.eventName} init:`, [this.chips || this.autoComplete, this.el.nativeElement]);

      const properties$ = (<Model.LogUserEvent>this.dataChips)?.properties;

      if (this.chips) {
        const events$: Observable<ChipEvent> = merge(this.chips.onAdd, this.chips.onRemove);
        events$.subscribe(event => {
          const payload$: Model.LogUserEvent = {
            label: typeof this.dataChips === 'string' ? this.dataChips : this.dataChips.label,
            payload: this.chips.value,
          };
          if (!this.prod)
            this.logger.debug(`${this.eventName} event:`, [this.dataChips, event, payload$, properties$]);
          this.appInsights.trackEvent(this.eventName, payload$, properties$);
        });
      }
      else if (this.autoComplete) {
        this.autoComplete.onSelect.subscribe(item => {
          const payload$: Model.LogUserEvent = {
            label: typeof this.dataAutoComplete === 'string' ? this.dataAutoComplete : this.dataAutoComplete.label,
            payload: this.autoComplete.value,
          };
          if (!this.prod)
            this.logger.debug(`${this.eventName} event:`, [this.dataAutoComplete, item, payload$, properties$]);
          this.appInsights.trackEvent(this.eventName, payload$, properties$);
        });
      }
    } catch (error) { this.appInsights.trackTrace(error); }
  }
}

interface ChipEvent extends PEvent {
  value: any;
}
