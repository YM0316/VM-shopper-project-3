// Angular
import { Directive, ElementRef, Injector, Input, Optional } from '@angular/core';
// Caloudi
import { Checkbox, InputSwitch, LogUserEventCommon, Model, PEvent, TriStateCheckbox } from '.';

@Directive({ selector: '[logCheckbox], [logSwitch]' })
export class LogUserEventCheckboxDirective extends LogUserEventCommon {

  @Input('logCheckbox') public dataCheckbox: string | Model.LogUserEvent;
  @Input('logSwitch') public dataInputSwitch: string | Model.LogUserEvent;

  private eventName: string;

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement>,
    @Optional() private readonly checkbox: Checkbox,
    @Optional() private readonly tribox: TriStateCheckbox,
    @Optional() private readonly inputSwitch: InputSwitch,
  ) {
    super(injector);
  }

  public ngOnInit(): void {
    if (this.tribox) this.eventName = this.AIEventName.tribox;
    if (this.inputSwitch) this.eventName = this.AIEventName.inputSwitch;
    if (this.checkbox) this.eventName = this.checkbox.binary
      ? this.AIEventName.checkbox : this.AIEventName.arrayCheckbox;
    if (this.eventName && this.logInit)
      this.logger.debug(`log ${this.eventName} init:`,
        [this.checkbox || this.tribox || this.inputSwitch, this.el.nativeElement]);

    if (this.checkbox && typeof this.dataCheckbox === 'string')
      this.checkbox.onChange.subscribe((event: CheckboxEvnet) => {
        this.bindDataFromLabel(<string>this.dataCheckbox, event);
      });
    if (this.tribox && typeof this.dataCheckbox === 'string')
      this.tribox.onChange.subscribe((event: TriboxEvnet) => {
        this.bindDataFromLabel(<string>this.dataCheckbox, event);
      });
    if (this.inputSwitch && typeof this.dataInputSwitch === 'string')
      this.inputSwitch.onChange.subscribe((event: InputSwitchEvnet) => {
        this.bindDataFromLabel(<string>this.dataInputSwitch, event);
      });
  }

  private bindDataFromLabel(label: string, payload: PayloadEvent): void {
    this.logger.debug(`${this.eventName} event by label:`, [label, payload]);
    const payload$: boolean = (payload).checked || (payload).value;
    const data$: Model.LogUserEvent = { label: label, payload: payload$ };
    this.appInsights.trackEvent(this.eventName, data$);
  }

  public override ngOnChanges(changes: LogEventCheckboxChanges): void {
    try {
      let data$: Model.LogUserEventChange = changes.dataCheckbox || changes.dataInputSwitch;
      if (!this.eventName || typeof data$.currentValue === 'string') return;
      if (this.inputSwitch && typeof data$.previousValue.payload === 'undefined') return;

      if (typeof data$.previousValue?.payload === 'undefined') data$ = {
        ...data$,
        isFirstChange: data$.isFirstChange,
        currentValue: {
          ...data$.currentValue,
          payload: data$.currentValue.payload || !!data$.currentValue.payload,
        },
        previousValue: {
          ...data$.previousValue,
          label: !data$.previousValue ? data$.currentValue.label : data$.previousValue.label,
          payload: this.eventName === this.AIEventName.checkbox ? !!data$.previousValue?.payload : data$.previousValue?.payload,
        },
      };

      if (this.logVerbose) this.logger.debug(`${data$.currentValue.label} origin:`, [changes.dataCheckbox || changes.dataInputSwitch]);
      if (this.logEvent) this.logger.debug(`${data$.currentValue.label} event:`, [data$, this.eventName]);
      if (this.changeCheck(data$, this.eventName)) return;
      this.appInsights.trackEvent(this.eventName, data$.currentValue, data$?.currentValue.properties);
    } catch (error) { this.appInsights.trackTrace(error); }
  }
}

interface LogEventCheckboxChanges extends Model.LogSimpleChanges {
  dataCheckbox: Model.LogUserEventChange,
  dataInputSwitch: Model.LogUserEventChange,
}

class CheckboxEvnet implements PEvent {
  originalEvent: PointerEvent | KeyboardEvent;
  checked?: boolean | null;
}

class TriboxEvnet implements PEvent {
  originalEvent: PointerEvent | KeyboardEvent;
  value: boolean | null;
}

class InputSwitchEvnet implements PEvent {
  originalEvent: PointerEvent | KeyboardEvent;
  checked: boolean | null;
}

class PayloadEvent implements PEvent {
  originalEvent: PointerEvent | KeyboardEvent;
  checked?: boolean | null;
  value?: boolean | null;
}
