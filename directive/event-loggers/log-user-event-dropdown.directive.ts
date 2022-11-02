// Angular
import { Directive, ElementRef, Injector, Input, Optional } from '@angular/core';
// Caloudi
import { LogUserEventCommon, Model, Dropdown, MultiSelect, PEvent } from '.';

@Directive({ selector: '[logDropdown]' })
export class LogUserEventDropdownDirective extends LogUserEventCommon {

  @Input('logDropdown') public data: string | Model.LogUserEvent;

  private readonly eventName: string;

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement>,
    @Optional() private readonly dropdown: Dropdown,
    @Optional() private readonly multiselect: MultiSelect,
  ) {
    super(injector);
    if (multiselect) this.eventName = this.AIEventName.multiSelect;
    if (dropdown) this.eventName = this.AIEventName.dropdown;
    if (!this.prod && this.eventName && this.logInit)
      this.logger.debug(`log ${this.eventName} init:`, [multiselect || dropdown, this.el.nativeElement]);
  }

  public ngAfterViewInit(): void {
    if (typeof this.data !== 'string') return;
    this.multiselect?.onChange.subscribe((res: DropdownEvent) =>
      this.eventEmmit({ label: <string>this.data, payload: res.value }));
    this.dropdown?.onChange.subscribe((res: DropdownEvent) =>
      this.eventEmmit({ label: <string>this.data, payload: res.value }));
  }

  public override ngOnChanges(changes: Model.LogSimpleChanges): void {
    try {
      const data$: Model.LogUserEventChange = changes?.data;
      if (typeof this.data === 'string'
        || this.changeCheck(data$, this.eventName)
        || (this.eventName === this.AIEventName.dropdown
          && data$.currentValue && !data$.previousValue.payload)) return;
      this.eventEmmit(data$.currentValue);
    } catch (error) { this.appInsights.trackTrace(error); }
  }

  private eventEmmit(payload: Model.LogUserEvent): void {
    try {
      if (this.logEvent) this.logger.debug(`${this.eventName} event:`, [payload, this.el.nativeElement]);
      this.appInsights.trackEvent(this.eventName, payload, payload.properties);
    } catch (error) { this.appInsights.trackTrace(error); }
  }
}

interface DropdownEvent extends PEvent {
  value: Model.LogUserEvent,
}
