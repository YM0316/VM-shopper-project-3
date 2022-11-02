import { DataColumn } from '@base/model/data-table/data-column.model';

export interface DataTable<T = Record<string, unknown>> {
  columns: DataColumn[];
  values: T[];
}
