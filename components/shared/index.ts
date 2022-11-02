// Import
import { PrimeDialogComponent } from './prime-dialog/prime-dialog.component';
import { PrimeTableComponent } from './prime-table/prime-table.component';
import { UninitializedComponent } from './uninitialized/uninitialized.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { ChartComponent } from './chart/chart.component';

// Export
export * from './spinner/spinner.component';
export * from './prime-dialog/prime-dialog.component';
export * from './prime-table/prime-table.component';
export * from './uninitialized/uninitialized.component';
export * from './chart/chart.component'

export const CUSTOM_COMPONENT = [
  SpinnerComponent,
  UninitializedComponent,
  ChartComponent
];

export const PRIME_NG_COMPONENT = [
  PrimeTableComponent,
  PrimeDialogComponent,
];

export const D3_CHARTS_COMPONENT = [
];
