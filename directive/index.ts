import * as Temp from './temp-store.directive';
import * as EventLoggers from './event-loggers';

export * from './temp-store.directive';
export * from './event-loggers';

export const CUSTOM_DIRECTIVES = [
  // module error resource
  Temp.TempStoreDirective,
  EventLoggers.LogUserEventCalendarDirective,
  EventLoggers.LogUserEventCheckboxDirective,
  EventLoggers.LogUserEventChipsDirective,
  EventLoggers.LogUserEventDropdownDirective,
  EventLoggers.LogUserEventInputDirective,
  EventLoggers.LogUserEventLinkDirective,
  EventLoggers.LogUserEventPanelDirective,
  EventLoggers.LogUserEventPeriodSelectorDirective,
  EventLoggers.LogUserEventSliderDirective,
  EventLoggers.LogUserEventTableDirective,
  EventLoggers.LogUserEventTabviewDirective,
];
