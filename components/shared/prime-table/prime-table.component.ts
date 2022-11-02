import { Component, ViewChild, Input, TemplateRef } from '@angular/core';
import { Injector, SimpleChange, ElementRef } from '@angular/core';
import { ViewEncapsulation, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
// Primeng
import { MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { ObjectUtils } from 'primeng/utils';
// Caloudi
import { CommonUtil, CSVUtil } from '@core/util';
// Interface
import { FilterMetaData, LogUserEventTable, PageEvent, RowSelectEvent, SortingEvent } from '@base/model';
import { LazyLoadingEvent, FilterEvent, RowExpandEvent, TableStateEvent } from '@base/model';
import { PrimeTableColumn, LogEventRowExpand } from '@base/model';
import { PaginatorPosition, SelectionMode } from '@core/enum';
// Third Party
import { sum } from 'lodash';

@Component({
  selector: 'prime-table',
  templateUrl: './prime-table.component.html',
  styleUrls: ['./prime-table.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class PrimeTableComponent {

  /** Table Instance */
  @ViewChild('dt') public primeTable: Table;

  @Input() public selection: TableItem;
  @Input() public caption: boolean = false;
  @Input() public paginator: boolean = true;
  @Input() public autoLayout: boolean = true;
  @Input() public values: TableItem[];
  @Input() public columns: PrimeTableColumn[];
  @Input() public scrollHeight: string;
  @Input() public rowExpansion: boolean = false;
  @Input() public stickyColumn: number;
  @Input() public pageSize: number = 10;
  @Input() public excludeList: string[] = [];
  @Input() public rowExpandMode: 'multiple' | 'single' = 'single';
  @Input() public columnTemplate: TemplateRef<HTMLElement>;
  @Input() public pivotTemplate: TemplateRef<HTMLElement>;
  @Input() public captionTemplate: TemplateRef<HTMLElement>;
  @Input() public paginatorPosition: PaginatorPosition = PaginatorPosition.top;
  @Input() public selectionMode: string = SelectionMode.single;
  @Input() public expandedRowKeys: Record<string, boolean> = {};
  @Input() public rowExpansionTemplate: TemplateRef<HTMLElement>;
  @Input('dataKey') public _dataKey: string | boolean;
  @Input('pivotKey') public _pivotKey: number;
  @Input('tableName') public set _tableName(payload: string) {
    this.tableName = payload
      .trim()
      .toLowerCase()
      .replace(/\s/gi, '_')
      .replace(/(.*)_table$/, '$1');
  }
  public tableName: string;

  public sortOrder: -1 | 1 = 1;
  public get dataKey(): string {
    try {
      if (typeof this._dataKey === 'boolean' && this._dataKey)
        return [...this.columns].filter(el =>
          el.field.toLowerCase() !== 'actiongroup'
          && el.field.toLowerCase() !== 'edit'
          && el.field.toLowerCase() !== 'billingperiod'
          && el.field.toLowerCase() !== 'billingperiodid')[0].field;
      else return this._dataKey as string || null;
    } catch (e) { return null; }
  }

  private dialogElement: Element;
  public get stateKey(): string {
    try {
      const dialog = this.el.nativeElement.closest('p-dialog');
      const key = location.pathname.slice(1) + (this.tableName ? ':' + this.tableName : '');
      if (this.primeTable && dialog && this.dialogElement !== dialog) {
        this.dialogElement = dialog;
        // this.logger.debug('table:', [this.primeTable, dialog, this.values]);
        setTimeout(() => this.bindPageSize(this.values));
      }
      // this.logger.debug('state key:', [this.primeTable, this.el.nativeElement, this.tableName]);
      if (!dialog) return key.toLowerCase();
      else return null;
    } catch (e) {
      // this.logger.error('error:', [e]);
      return null;
    }
  }

  public get pivotKey(): string[] {
    try {
      return this._pivotKey > 0
        ? this.columns.slice(0, this._pivotKey).map(el => el.field)
        : undefined;
    } catch (e) { return undefined; }
  }

  public filterInput = '';

  // Custom Control
  @Input('emptyValueMessage') public emptyValueMessage: string;
  @Input('loading') public manualLoading = false;
  @Input('emptyCell') public stringReplacement: string | boolean = '-';

  // all events are same as p-table's events
  @Output('onFilter') public onFilterEmitter = new EventEmitter<FilterEvent<any>>();
  @Output('onLazyLoad') public onLazyLoadEmitter = new EventEmitter<LazyLoadingEvent>();
  @Output('onPage') public onPageEmitter = new EventEmitter<PageEvent>();
  @Output('onRowCollapse') public onRowCollapseEmitter = new EventEmitter<RowExpandEvent<any>>();
  @Output('onRowExpand') public onRowExpandEmitter = new EventEmitter<RowExpandEvent<any>>();
  @Output('onRowSelect') public onRowSelectEmitter = new EventEmitter<RowSelectEvent<any>>();
  @Output('onRowUnselect') public onRowUnselectEmitter = new EventEmitter<RowSelectEvent<any>>();
  @Output('onSort') public onSortEmitter = new EventEmitter<SortingEvent<any>>();
  @Output('onStateRestore') public onStateRestoreEmitter = new EventEmitter<TableStateEvent>();
  @Output('onStateSave') public onStateSaveEmitter = new EventEmitter<TableStateEvent>();

  public readonly exportFilename = 'Caloudi CMP';

  public replaceEmptyCell = true;
  public loading = true;
  public hasData = false;
  public selectedRow: any;
  public globalFilterFields: string[];
  public filters: TableStateEvent['filters'] = {};

  private readonly pageItemsArray: number[] = [5, 10, 15, 25, 50, 100];
  public pageItems: number[];

  private searchBoxValue: string;
  public get searchBoxInputValue(): LogUserEventTable {
    const item: LogUserEventTable = { label: 'table_search', payload: this.searchBoxValue };
    if (this.tableName) item.tableName = this.tableName; return item;
  }
  public get logEventTableColumns(): LogUserEventTable {
    const item: LogUserEventTable = { label: 'table_export', payload: this.columns };
    if (this.tableName) item.tableName = this.tableName; return item;
  }

  public exportItems: MenuItem[] = [
    { label: 'CSV', icon: 'pi pi-file', command: () => this.exportCSV() },
    // { label: 'EXCEL', icon: 'pi pi-file', command: () => this.exportExcel() },
    // { label: 'PRINT', icon: 'pi pi-file', command: () => this.printTable() },
    // { label: 'COPY', icon: 'pi pi-file', command: () => { } },
  ];

  private timeFormCell: string[] = ['syncTime', 'lastSeenOn', 'createdOn', 'updatedOn'];

  private readonly logger: NGXLogger;
  private readonly log: boolean = false;
  public readonly rowspanDebug: boolean = false;

  constructor(
    private readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement>,
  ) { this.logger = this.injector.get(NGXLogger); }

  public ngOnChanges(changes: TableSimpleChanges): void {
    const col = changes.columns;
    const val = changes.values;
    const colValue = changes.columns?.currentValue;
    const valValue = changes.values?.currentValue;
    const colPre = changes.columns?.previousValue;
    const valPre = changes.values?.previousValue;
    const colChange = CommonUtil.ngIsChanges(col);
    const valChange = CommonUtil.ngIsChanges(val);
    const dialog: HTMLElement = this.el.nativeElement.closest('p-dialog');
    [this.dialogElement, this.excludeList] = [undefined, [...this.timeFormCell]];

    if (valValue === undefined && valPre) this.loading = true;

    if (this.log) this.logger.debug(
      ['chg:', changes, this.columns?.length, this.values?.length, this.pageSize, this.pageItems],
      ['col:', col?.currentValue?.length, colPre?.length, colChange],
      ['val:', val?.currentValue?.length, valPre?.length, valChange],
      ['fin:', this.loading, !!col?.currentValue, !!val?.currentValue],
      ['dialog:', dialog, this.dialogElement],
      ['table:', this.primeTable?.rows, this.primeTable?.first],
    );

    /** Empty Cell Replacement */
    if (changes?.stringReplacement?.firstChange && this.stringReplacement === false)
      this.replaceEmptyCell = false;
    if (changes?.excludeList?.firstChange && CommonUtil.ngIsChanges(changes?.excludeList))
      this.excludeList = [...this.timeFormCell, ...this.excludeList];

    /** Bind Page Size Triggers */
    if (colValue && valValue) {
      if (this.log) this.logger.debug('a:', [valChange, colChange]);
      this.bindPageSize(this.values);
      if ((valValue.length || -1) < (valPre ? valPre.length - valPre.length % this.pageSize : 0)) {
        if (this.log) this.logger.debug('b:', [valChange, valValue.length, valPre?.length]);
        this.tableReset();
      }
    }
    else if (!colChange && valChange) {
      if (this.log) this.logger.debug('c:', [valChange]);
      this.bindPageSize(this.values);
      this.tableReset();
    }

    if (changes.selection?.currentValue) {
      this.logger.debug('selection', [changes.selection.currentValue, this.primeTable]);
      const value = CommonUtil.deepCopy(this.values);
      value.forEach((v: any, i: number) => {
        if (CommonUtil.equals(v, changes.selection.currentValue)) {
          // this.logger.debug('result:', [v, i])
          this.primeTable.scrollToVirtualIndex(i);
        }
      });
    }
    setTimeout(() => {
      if (!dialog && !val?.firstChange && typeof valPre !== 'undefined')
        this.primeTable.saveState();
      if (this.log) this.logger.debug('table:', [this.primeTable.filters, this.filters]);
    });
  }

  private bindPageSize(val: TableItem[]): void {
    if (!Array.isArray(val)) return;
    if (this.log) this.logger.debug('pagesize init:', [val.length, this.pageSize, this.pageItems, this.primeTable?.rows]);
    this.pageItems = [];

    /** Bind Page Items list */
    if (val.length > 0 && val.length < 100) {
      this.pageItemsArray.forEach(item => { if (item < val.length) this.pageItems.push(item); });
      this.pageItems.push(val.length);
    } else { this.pageItems = [...this.pageItemsArray]; }

    if (this.log) this.logger.debug('pageitem:', [this.pageSize, this.pageItems, this.primeTable?.rows]);

    /** Bind Page Size */
    setTimeout(() => {
      const currentRow = this.pageItems.findIndex(item => item === this.primeTable.rows);
      this.pageSize = this.pageItems.length <= 2 && this.pageSize !== this.pageItems[0]
        ? this.pageItems[1] || this.pageItems[0]
        : this.pageSize = currentRow >= 0 ? this.pageItems[currentRow] : this.pageItems[1];
      this.primeTable.rows = this.pageSize;
      if (this.log) this.logger.debug('bind pagesize:', [this.pageSize, this.pageItems, currentRow, this.primeTable.rows]);
    });

    /** Finalize */
    this.hasData = this.values?.length > 0 && this.columns?.length > 0;
    this.globalFilterFields = this.columns?.map((item: PrimeTableColumn) => item.field);
    this.loading = false;
  }

  public getPivotGroup(item: TableItem, rowIndex: number, colIndex: number = 0): boolean {
    let [result, index, list]: [boolean, number, TableItem[]] =
      [true, 0, rowIndex === 0 ? [...this.values] : this.values.slice(rowIndex - 1)];
    index = this.getNextDiffRow(item, rowIndex, this.pivotKey[colIndex]);

    if (rowIndex > 0) for (let key of this.pivotKey) {
      result = list.some(val => typeof val !== 'undefined' && val[key] === item[key]);
    }
    return (result && rowIndex >= 0 && index === rowIndex) || rowIndex === 0;
  }

  public isPivotKey(field: string): boolean {
    return this.pivotKey && this.pivotKey.some(k => k === field);
  }

  public getRowspan(item: TableItem, rowIndex: number, colIndex: number = 0, debug?: boolean): number {
    if (this.rowspanDebug && !debug) return 1;
    return this.getGroupRange(item, rowIndex, this.pivotKey[colIndex]).range?.length || null;
  }

  public getGroupRange(item: TableItem, rowIndex: number, key: string): RangeItem {
    const list = this.getSlicedList(rowIndex);
    let first = list.findIndex(val => typeof val !== 'undefined' && val[key] === item[key]);
    let last = list.findIndex(val => typeof val !== 'undefined' && val[key] !== item[key]);

    if (last === -1) last = list.length + 1;
    return { range: this.values.slice(first, last), rest: this.values.slice(last), first: first, last: last };
  }

  public getNextDiffRow(item: TableItem, rowIndex: number, key?: string): number {
    const list = this.getSlicedList(rowIndex, -1);
    if (key) return list.findIndex(val => typeof val !== 'undefined' && val[key] !== item[key]);
    else return list.findIndex(val => typeof val !== 'undefined' && val !== item);
  }

  public getNextDiffCol(_item: TableItem, rowIndex: number, key?: string): boolean {
    const list = [...this.values];
    if (!list[rowIndex] || !list[rowIndex + 1]) return false;
    if (typeof key === 'string' && key.length > 0)
      return list[rowIndex][key] !== list[rowIndex + 1][key];
    else
      return !this.pivotKey.every(k => list[rowIndex][k] === list[rowIndex + 1][k]);
  }

  private getSlicedList(rowIndex: number, add: number = 0): TableItem[] {
    const list = rowIndex === 0 ? [...this.values] : this.values.slice(rowIndex + add);
    for (let i = 0; i < rowIndex; i++) { list.unshift(undefined); }
    return list;
  }

  /**
   * TODO: bind sum row into data
   */
  // private bindSumData(): void {
  //   return;
  // }

  public sumData(item: TableItem[], key: string): number {
    return sum(item.map(el => el[key] as number));
  }

  public actionGroupFix(col: PrimeTableColumn): boolean {
    return col.sort !== undefined ? !col.sort : false;
  }

  public searchBoxInput(e: Event): void {
    this.searchBoxValue = ((<HTMLInputElement>e.target).value ?? '').trim();
    this.primeTable.filterGlobal(this.searchBoxValue, 'contains');
  }

  public getExpandLogItem(rowData: any, expanded: boolean): LogEventRowExpand {
    const item: LogEventRowExpand = { label: 'row_expansion', payload: rowData, expanded: expanded };
    if (this.tableName) item.tableName = this.tableName;
    return item;
  }

  /**
   * Export CSV File
  */
  public exportCSV(): void {
    this.caloudiExportCSV();
  }

  private caloudiExportCSV(options?: { selectionOnly: boolean; }): void {
    // let objectutils_1 = require("primeng/utils/objectutils");
    let table = this.primeTable;
    let data = this.primeTable.filteredValue || this.primeTable.value;
    let csv = '';
    if (options?.selectionOnly) {
      data = this.primeTable.selection || [];
    }
    // Headers
    for (let i = 0; i < this.primeTable.columns.length; i++) {
      let column = this.primeTable.columns[i] as PrimeTableColumn;
      if (column.exportable !== false && column.field) {
        csv += `"${column.field}"`;
        if (i < (this.primeTable.columns.length - 1)) {
          csv += this.primeTable.csvSeparator;
        }
      }
    }
    // Body
    data.forEach(record => {
      csv += '\n';
      for (let i_1 = 0; i_1 < table.columns.length; i_1++) {
        let column = table.columns[i_1] as PrimeTableColumn;
        if (column.exportable !== false && column.field) {
          let cellData = ObjectUtils.resolveFieldData(record, column.field);
          if (cellData != null) {
            if (table.exportFunction) {
              cellData = table.exportFunction({
                data: cellData,
                field: column.field
              });
            }
            else
              cellData = String(cellData).replace(/"/g, '""');
          }
          else
            cellData = '';
          csv += '"' + cellData + '"';
          if (i_1 < (table.columns.length - 1)) {
            csv += table.csvSeparator;
          }
        }
      }
    });

    CSVUtil.exportCSV(csv, this.primeTable.exportFilename);
  }

  public onRowSelect(event: RowSelectEvent<any>): void {
    this.selectedRow = event;
    this.onRowSelectEmitter.emit(event);
  }
  public onRowUnselect(event: RowSelectEvent<any>): void {
    this.selectedRow = undefined;
    this.onRowUnselectEmitter.emit(event);
  }
  public onPage(event: PageEvent): void {
    this.onPageEmitter.emit(event);
  }
  public onSort(event: SortingEvent<any>): void {
    if (!this.values) return;
    this.onSortEmitter.emit(event);
  }
  public onFilter(event: FilterEvent<any>): void {
    setTimeout(() => this.bindPageSize(event?.filteredValue));
    this.onFilterEmitter.emit(event);
  }
  public onRowExpand(event: RowExpandEvent<any>): void {
    this.onRowExpandEmitter.emit(event);
  }
  public onRowCollapse(event: RowExpandEvent<any>): void {
    this.onRowCollapseEmitter.emit(event);
  }
  public onLazyLoad(event: LazyLoadingEvent): void {
    this.onLazyLoadEmitter.emit(event);
  }
  public onStateSave(event: TableStateEvent): void {
    this.onStateSaveEmitter.emit(event);
  }
  public onStateRestore(event: TableStateEvent): void {
    if (this.log) this.logger.debug('restore:', [event]);
    this.filterInput = (<FilterMetaData>event.filters?.global)?.value || '';
    // this._dataKey = event.sortField;
    this.sortOrder = event.sortOrder || 1;
    this.filters = event.filters || {};
    this.pageSize = event.rows;
    this.onStateRestoreEmitter.emit(event);
  }

  private tableReset(): void {
    setTimeout(() => {
      this.filters = {};
      this.filterInput = '';
      this.primeTable.reset();
    });
  }

  public valueEmpty<T extends Record<string, any>>(rowData: T, field: string): boolean {
    if (!this.replaceEmptyCell) return true;
    const data = String(rowData[field]);
    return (data?.length > 0 || typeof rowData[field] === 'undefined');
  }

  public specificColumn(field: string): boolean {
    return this.excludeList.some(item => item === field);
  }

  public specificColumnfilter(field: string): boolean {
    return [...this.timeFormCell].some(item => item === field);
  }

  public bindSelection(rowData: TableItem): void {
    this.selection = rowData;
  }
}

interface TableItem {
  [x: string]: any,
}

interface RangeItem<T = TableItem> {
  range: T[],
  rest: T[],
  first: number,
  last: number,
}

interface TableSimpleChanges extends SimpleChanges {
  selection: TableSimpleChange<TableItem>,
  caption: TableSimpleChange<boolean>,
  paginator: TableSimpleChange<boolean>,
  autoLayout: TableSimpleChange<boolean>,
  values: TableSimpleChange<TableItem[]>,
  columns: TableSimpleChange<PrimeTableColumn[]>,
  scrollHeight: TableSimpleChange<string>,
  rowExpansion: TableSimpleChange<boolean>,
  stickyColumn: TableSimpleChange<number>,
  pageSize: TableSimpleChange<number>,
  _dataKey: TableSimpleChange<string | boolean>,
  excludeList: TableSimpleChange<string[]>,
  rowExpandMode: TableSimpleChange<'multiple' | 'single'>,
  columnTemplate: TableSimpleChange<TemplateRef<HTMLElement>>,
  pivotTemplate: TableSimpleChange<TemplateRef<HTMLElement>>,
  captionTemplate: TableSimpleChange<TemplateRef<HTMLElement>>,
  paginatorPosition: TableSimpleChange<typeof PaginatorPosition>,
  selectionMode: TableSimpleChange<typeof SelectionMode>,
  expandedRowKeys: TableSimpleChange<Record<string, boolean>>,
  rowExpansionTemplate: TableSimpleChange<TemplateRef<HTMLElement>>,
  tableName: TableSimpleChange<string>,
  _pivotKey: TableSimpleChange<string>,
  emptyValueMessage: TableSimpleChange<string>,
  manualLoading: TableSimpleChange<boolean>,
  stringReplacement: TableSimpleChange<string | boolean>,
}

interface TableSimpleChange<T> extends SimpleChange {
  previousValue: T,
  currentValue: T,
}
