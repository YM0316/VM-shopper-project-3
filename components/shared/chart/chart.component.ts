// Angular
import { Component, Injector, SimpleChange } from '@angular/core';
import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { HostListener } from '@angular/core';
import { ElementRef } from '@angular/core';
// Caloudi
import { BaseComponent } from '@base/base.component';
import { CommonUtil } from '@core/util';
import { GoogleChartService } from '@base/service';
// Store
// import { Selectors } from '@store/selector';
// Interface
import { ChartTypes } from '@core/enum';
import { GoogleChartData, GoogleChartOptions } from '@base/model';
// import { pairwise } from 'rxjs';

@Component({
  selector: 'caloudi-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.sass'],
})
export class ChartComponent extends BaseComponent implements OnChanges {

  @Input('chartType') public chartType: string = ChartTypes.ColumnChart;
  @Input('data') public data: GoogleChartData;
  @Input('options') public _options: GoogleChartOptions;
  @Input() public columns: any[];
  @Input() public columnFormats: any[];

  @HostListener('window:resize', ['$event'])
  public onresize(_event: Event): void {
    // this.logger.trace('this', this.elementRef.nativeElement)
    // this.logger.trace('window resize:', [_event]);
    this.drawChart();
  }

  private options: GoogleChartOptions;
  private element: HTMLElement = this.elementRef.nativeElement;

  constructor(
    public readonly injector: Injector,
    private readonly chartService: GoogleChartService,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {
    super(injector);
  }

  public ngOnChanges(changes: GoogleChartChanges): void {
    this.logger.trace('any changes:', [changes]);

    if (changes.options?.currentValue) this.options = { ...this._options };

    if (CommonUtil.ngIsChanges(changes.data)) this.drawChart();
  }

  private drawChart(): void {
    const parent = this.element.parentElement;
    if (!parent) return;
    this.options = {
      ...this._options,
      width: parent.clientWidth,
      height: this.getAutoHeight(parent.clientWidth),
    };
    if (this.chartType !== ChartTypes.Gauge) this.options = {
      ...this.options,
      backgroundColor: {
        fill: 'transparent',
        ...this._options['backgroundColor'],
      },
      chartArea: { ...this._options['chartArea'], backgroundColor: 'transparent' },
      legend: {
        ...this._options['legend'],
        alignment: 'start',
        textStyle: {
          ...this._options['legend']?.textStyle,
          color: 'var(--text-color)',
          fontSize: '1rem',
        },
      },
    };
    if (this.chartType !== ChartTypes.PieChart && this.chartType !== ChartTypes.Gauge) this.options = {
      ...this.options,
      annotations: {
        ...this._options['annotations'],
        textStyle: { ...this._options['annotations']?.textStyle, color: 'var(--text-color)' },
      },
      vAxis: {
        ...this._options['vAxis'],
        textStyle: { ...this._options['vAxis']?.textStyle, color: 'var(--text-color)' },
      },
      hAxis: {
        ...this._options['hAxis'],
        textStyle: { ...this._options['hAxis']?.textStyle, color: 'var(--text-color)' },
      },
    };

    // this.changeColor(this.options);
    this.logger.trace('draw:', [this.element, this.options, this.chartType, this.isLayoutLightMode]);
    this.chartService.buildChart(
      this.chartType,
      this.elementRef,
      this.data,
      this.options,
      this.columns,
      this.columnFormats,
    );
    // this.logger.trace(this.chartType, 'clientWidth:', parent.clientWidth, 'clientHeight:', parent.clientHeight);
    // this.logger.trace(this.chartType, 'width:', this.options.width, 'height:', this.options.height);
  }

  public getAutoHeight(parentWidth: number): number {
    if (this._options.height === undefined || this._options.height === 0) {
      if (Object.keys(this._options).some(key => key === 'isStacked' || key === 'is3D'))
        return this._options['isStacked'] || this._options['is3D']
          ? window.innerHeight - (parentWidth * 0.3) : parentWidth * 0.3;
      return this._options.height;
    } else return this._options.height;
  }

  // private changeColor(option: GoogleChartOptions): void {
  //   this.options['vAxis'] = {
  //     ...option['vAxis'],
  //     textStyle: { ...option['vAxis']?.textStyle, color: 'var(--text-color)' },
  //   };
  //   this.options['hAxis'] = {
  //     ...option['hAxis'],
  //     textStyle: { ...option['hAxis']?.textStyle, color: 'var(--text-color)' },
  //   };
  //   this.options['legend'] = {
  //     ...option['legend'],
  //     textStyle: { ...option['legend']?.textStyle, color: 'var(--text-color)' },
  //   };
  //   this.options['annotations'] = {
  //     ...option['annotations'],
  //     textStyle: { ...option['annotations']?.textStyle, color: 'var(--text-color)' },
  //   };
  // }
}

interface GoogleChartChanges extends SimpleChanges {
  chartType: GoogleChartChangesData<string>;
  data: GoogleChartChangesData<GoogleChartData>;
  options: GoogleChartChangesData<GoogleChartOptions>;
  columns: GoogleChartChangesData<any[]>;
  columnFormats: GoogleChartChangesData<any[]>;
}

interface GoogleChartChangesData<T> extends SimpleChange {
  currentValue: T;
  previousValue: T;
}
