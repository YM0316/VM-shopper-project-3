import { Component, Injector, Input, OnInit } from '@angular/core';
import { projectService } from '../project_service';
import { SelectItem } from '@base/directive';
import { UntypedFormControl } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { BaseComponent } from '@base/base.component';
interface item {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'digi-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.css']
})
export class ComparisonComponent extends BaseComponent implements OnInit {
  @Input() Comparison_VMdata: any;
  @Input() Comparison_selected_data: any;

  selectedVendor: any;
  selectedcurrency?: string;
  selectedPlatform?: string;
  selectedregion?: string;
  memory_max: number;
  CPU_max: number;
  GPU_max: number;
  cost_saved: number;
  Prev_btn_text: string = '<-Prev';

  VendorLists: SelectItem<string>[] = [{ label: 'Azure', value: 'Azure' }, { label: 'GCP', value: 'GCP' }, { label: 'AWS', value: 'AWS' }];
  Vendor = new UntypedFormControl('');
  regions: item[] = [
    { value: 'Canada', viewValue: 'Canada' },
    { value: 'Europe', viewValue: 'Europe' },
    { value: 'United States', viewValue: 'United States' },
    { value: 'Asia Pacific', viewValue: 'Asia Pacific' },
    { value: 'South America', viewValue: 'South America' },
    { value: 'Middle East', viewValue: 'Middle East' },
  ];

  currencies: item[] = [
    { value: 'TWD', viewValue: 'TWD' },
    { value: 'USD', viewValue: 'USD' },
  ];

  Platforms: item[] = [
    { value: 'Linux', viewValue: 'Linux' },
    { value: 'Windows', viewValue: 'Windows' },
  ];
  memory_options: Options = {
    floor: 1,
    ceil: 24576
  };
  CPU_options: Options = {
    floor: 1,
    ceil: 448
  };
  GPU_options: Options = {
    floor: 0,
    ceil: 16
  };

  constructor(
    public readonly injector: Injector,
    private ProjectService: projectService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.get_shoppingcart_data();
    this.get_comparison_data();
    this.Test();
  }
  public get_shoppingcart_data() {
    this.Comparison_VMdata = 0;
    this.ProjectService.getMessage_comparison().subscribe(response => {
      this.Comparison_VMdata = response;
    });

    if (this.Comparison_VMdata.length == null) {
      alert("Please select two VMs on the main page");
      this.router.navigate(['/mainpage']);
    }

    if (this.Comparison_VMdata[0]['monthlyCost'] > this.Comparison_VMdata[1]['monthlyCost']) {
      this.cost_saved = (this.Comparison_VMdata[0]['monthlyCost'] - this.Comparison_VMdata[1]['monthlyCost']) / this.Comparison_VMdata[0]['monthlyCost'];
    }
    else {
      this.cost_saved = (this.Comparison_VMdata[1]['monthlyCost'] - this.Comparison_VMdata[0]['monthlyCost']) / this.Comparison_VMdata[1]['monthlyCost'];
    }
    console.log('saving_money=', this.cost_saved);

  }
  Test() {
    console.log('comparison VM data', this.Comparison_VMdata);
    console.log('comparison selected data', this.Comparison_selected_data);
  }

  public get_comparison_data() {
    // console.log('Shopping cart Query data', this.shoppingCard_data);
    this.Comparison_selected_data = 0;
    this.ProjectService.get_comparison_Message().subscribe(response => {
      this.Comparison_selected_data = response;
      // console.log('Comparison selected get data:', response);
      // console.log(response);
    });

    this.selectedVendor = this.Comparison_selected_data[0];
    this.selectedregion = this.Comparison_selected_data[1];
    this.selectedcurrency = this.Comparison_selected_data[2];
    this.selectedPlatform = this.Comparison_selected_data[3];
    this.memory_max = this.Comparison_selected_data[4];
    this.CPU_max = this.Comparison_selected_data[5];
    this.GPU_max = this.Comparison_selected_data[6];
  }

  Prev_button() {
    this.router.navigate(['/mainpage']);
  }
}
