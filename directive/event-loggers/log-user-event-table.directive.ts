// Angular
import { Directive, ElementRef, Injector, Input } from '@angular/core';
// Caloudi
import { LogUserEventCommon, Model } from '.';

@Directive({ selector: '[logSelected], [logRowExpand]' })
export class LogUserEventTableDirective extends LogUserEventCommon {

  @Input('logSelected') public selectedRow: Model.LogEventSelectedRow;
  @Input('logRowExpand') public rowExpand: Model.LogEventRowExpand;

  private readonly isTableRow: boolean;
  private readonly eventName: string;

  constructor(
    protected override readonly injector: Injector,
    private readonly el: ElementRef<HTMLTableRowElement | HTMLTableCellElement>,
  ) {
    super(injector);
    this.isTableRow = el.nativeElement instanceof HTMLTableCellElement;
    this.eventName = this.isTableRow ? this.AIEventName.rowExpansion : this.AIEventName.selectedRow;

    if (!this.prod && !this.isTableRow && this.eventName && this.logInit)
      this.logger.debug(`log ${this.eventName} init:`, [el.nativeElement]);
  }

  public override ngOnChanges(changes: Model.LogTableSimpleChanges): void {
    try {
      const data$ = changes.selectedRow || changes.rowExpand;
      if (this.changeCheck(data$, this.eventName)
        || (data$.currentValue.label === 'row_expansion' && (
          (<Model.LogEventRowExpand>data$.currentValue)?.expanded ===
          (<Model.LogEventRowExpand>data$.previousValue)?.expanded
          || !(<Model.LogEventRowExpand>data$.currentValue)?.expanded))
        || (data$.currentValue.label === 'selected_row'
          && data$.currentValue.rowNumber === null)
      ) return;

      const payload$: Model.LogUserEventTable = {
        ...data$.currentValue,
        payload: {
          ...data$.currentValue.label === 'selected_row'
            ? (<Model.LogEventSelectedRow>data$.currentValue)?.payload?.data
            : (<Model.LogEventRowExpand>data$.currentValue).payload
        },
      };
      if (data$.currentValue.tableName) payload$.tableName = data$.currentValue.tableName;

      if (this.logEvent) this.logger.debug(`${this.eventName} event:`, [data$, payload$, this.el]);
      if (this.selectedRow) return;
      this.appInsights.trackEvent(this.eventName, payload$, data$?.currentValue.properties);
    } catch (error) { this.appInsights.trackTrace(error, changes.selectedRow || changes.expand); }
  }
}
