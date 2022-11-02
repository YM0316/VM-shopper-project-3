import { Injectable, Injector, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
// Caloudi
import { CaloudiAppInsightsService } from '@core/service';
import { CommonUtil } from '@core/util';
// Interface
import { AppInsightsEventName } from '@base/const';
// ENV
import { environment } from '@environments/environment';
import { NGXLogger } from 'ngx-logger';
// Model
import * as Model from '@base/model';
// Export
export * as Model from '@base/model';
export { PEvent } from '@base/model';
export * from './primeng-modules';

@Injectable({ providedIn: 'root' })
export class LogUserEventCommon implements OnChanges {

  protected readonly appInsights: CaloudiAppInsightsService;
  protected readonly prod: boolean = environment.production;
  protected readonly AIEventName: typeof AppInsightsEventName = AppInsightsEventName;
  protected readonly ngIsChanges: typeof CommonUtil.ngIsChanges = (v: SimpleChange) => CommonUtil.ngIsChanges(v);
  protected readonly logger: NGXLogger;

  protected readonly logInit: boolean = false;
  protected readonly logVerbose: boolean = false;
  protected readonly logEvent: boolean = true;

  constructor(
    protected readonly injector: Injector,
  ) {
    this.logger = injector.get(NGXLogger);
    this.appInsights = injector.get(CaloudiAppInsightsService);
  }

  /**
   * Check if **it's first change** or **is same from preview value** or **don't have eventName**
   */
  protected changeCheck(data: Model.LogUserEventChange, eventName: string): boolean {
    try {
      return data?.firstChange || typeof !data?.previousValue.payload === 'undefined' || !this.ngIsChanges(data) || !eventName;
    } catch (error) { this.appInsights.trackTrace(error); return false; }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.logVerbose) this.logger.debug('log common changes:', [changes]);
  }
}
