import { Component, OnInit, Injector } from '@angular/core';


import { BaseComponent } from '@base/base.component';

//VMQuery
import { X_RegionType, VMShopperQuery } from '../region-type';
// import { Query_DataItem } from '@tutorial/model';  //change!

import { DataTable, PrimeTableColumn } from '@base/model';

//USD to TWD
// import { CustomObject } from '@core/model';



//VmShopperServicex
import { VmShopperService } from '@app/tutorial/service/api/vm-shopper.service';

//select currency
interface item {
  value: string;
  viewValue: string;
}
//select currency

//test data api table
interface People {
    firstname?: string;
    lastname?: string;
    age?: string;
}
//test data api table

//test actuall data api table
interface VMQuery_ALLdata {
  Action?: boolean
  gPUs?: number
  latencyFromYou?: number
  machineType?: string
  memory?: number
  monthlyCost?: number
  preferredRegionMonthlyCost?: number
  recommend_index?: number
  region?: string
  regionId?: string
  saving?: number
  savings?: number
  vCPUs?: number
  vendor?: string
}
//test actuall data api table

//project server
import { projectService } from '../project_service';
//prog


@Component({
  selector: 'digi-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css']

})
export class MainpageComponent extends BaseComponent implements OnInit {

  //test data api table
  tableData: People[] = [];
  // cols: any[] = [];
  //test data api table



  //select currency
  public selectedcurrency: string = 'Select Currency';

  currencies: item[] = [
    { value: 'Select Currency', viewValue: 'Select Currency'},
    { value: 'TWD', viewValue: 'TWD' },
    { value: 'USD', viewValue: 'USD' },
  ];
  //select currency

  //select Platform
  public selectedPlatform: string = 'Select Platform';


  Platforms: item[] = [
   { value: 'Select Currency', viewValue: 'Select Platform'},
   { value: 'Linux', viewValue: 'Linux' },
   { value: 'Windows', viewValue: 'Windows' },
 ];

  //select Platform

  //Select CPU, GPU, RAM
  public selectedmemory: number =0.50;
  public selectedCPU: number=1;
  public selectedGPU: number=0;

  memory_api_value: any = [];
  CPU_api_value: any = [];
  GPU_api_value: any = [];
  //Select CPU, GPU

  //table status
  table_check: number = 0;
  loading: boolean = true;
  //table status

  //VMQuery
  public selectedVendor = ['Azure', 'GCP', 'AWS'];
  Query_data: VMShopperQuery;

  public Query_ALLdata: any;
  cols: any[] = [];
  recommendVM_check: number = 0;

  public alldata: VMQuery_ALLdata[] = [];
  all_query: VMShopperQuery[] = [];

  GCP_Region: X_RegionType[];
  GCP_region_value: any;
  Azure_Region: X_RegionType[];
  Azure_region_value: any;
  AWS_Region: X_RegionType[];
  AWS_region_value: any;

  public tableColumn: PrimeTableColumn[] = [{ field: 'vendor' }, { field: 'machineType' }, { field: 'vCPUs' }, { field: 'gPUs' }, { field: 'memory' }, { field: 'region' }, { field: 'monthlyCost' }, { field: 'latencyFromYou' }, { field: 'Action' }];

  //test data api table



  cors = 'https://cors-anywhere.herokuapp.com/'; // make sure to include the / at the end!
  institutionsUrl = this.cors + 'https://tw.rter.info/capi.php';

  USD_currency: any;

  //VMQuery

  //recommend_index
  GCP_cost_min: number = Number.MAX_SAFE_INTEGER;
  GCP_cost_max: number = 0;
  GCP_latency_min: number = Number.MAX_SAFE_INTEGER;
  GCP_latency_max: number = 0;
  GCP_recommend = [];

  AWS_cost_min: number = Number.MAX_SAFE_INTEGER;
  AWS_cost_max: number = 0;
  AWS_latency_min: number = Number.MAX_SAFE_INTEGER;
  AWS_latency_max: number = 0;
  AWS_recommend = [];

  Azure_cost_min: number = Number.MAX_SAFE_INTEGER;
  Azure_cost_max: number = 0;
  Azure_latency_min: number = Number.MAX_SAFE_INTEGER;
  Azure_latency_max: number = 0;
  Azure_recommend = [];
  //recoommend_index

  //test data
  // customers: Customer[];

  // selectedCustomers: Customer[];

  // representatives: Representative[];

  // statuses: any[];

  // loading: boolean = true;

  // activityValues: number[] = [0, 100];
  //test data

  selectedpreference: string = 'Choose your preference';
  preferences: item[] = [
    { value: 'Choose your preference', viewValue: 'Choose your preference'},
    { value: 'Add to cart', viewValue: 'Add to cart' },
    { value: 'Comparison', viewValue: 'Comparison' },
  ];





  constructor(
    public readonly injector: Injector,
    private readonly vmShopperService: VmShopperService,
    private ProjectService: projectService,
  ) {
    super(injector);
  }

  ngOnInit(): void {

    this.getCPU();
    this.getRAM();
    this.getGPU();

    this.xcloud_region();

    this.getUSDtoTWD();

    this.pre_query_VM();

    this.recommend_index();

    this.cols = [
            { field: 'vendor', header: 'Vendor' }, { field: 'machineType', header: 'MachineType' }, { field: 'vCPUs', header: 'CPU' }, { field: 'gPUs', header: 'GPU' },
            { field: 'memory', header: 'Memory' }, { field: 'region', header: 'Region' }, { field: 'monthlyCost', header: 'MonthlyCost' },
            { field: 'latencyFromYou', header: 'Latency' }, { field: 'Action', header: 'Action' },
        ];
    // this.tableData = [
    //         {
    //             firstname: 'David',
    //             lastname: 'ace',
    //             age: '40',
    //         },
    //         {
    //             firstname: 'AJne',
    //             lastname: 'west',
    //             age: '40',
    //         },
    //         {
    //             firstname: 'Mak',
    //             lastname: 'Lame',
    //             age: '40',
    //         },
    //         {
    //             firstname: 'Peter',
    //             lastname: 'raw',
    //             age: '40',
    //         },
    //         {
    //             firstname: 'Kane',
    //             lastname: 'James',
    //             age: '40',
    //         },
    //    ];

  //test data
  //   this.customerService.getCustomersLarge().then(customers => {
  //     this.customers = customers;
  //     this.loading = false;

  //     this.customers.forEach(customer => customer.date = new Date(customer.date));
  // });

  // this.representatives = [
  //     {name: "Amy Elsner", image: 'amyelsner.png'},
  //     {name: "Anna Fali", image: 'annafali.png'},
  //     {name: "Asiya Javayant", image: 'asiyajavayant.png'},
  //     {name: "Bernardo Dominic", image: 'bernardodominic.png'},
  //     {name: "Elwin Sharvill", image: 'elwinsharvill.png'},
  //     {name: "Ioni Bowcher", image: 'ionibowcher.png'},
  //     {name: "Ivan Magalhaes",image: 'ivanmagalhaes.png'},
  //     {name: "Onyama Limba", image: 'onyamalimba.png'},
  //     {name: "Stephen Shaw", image: 'stephenshaw.png'},
  //     {name: "Xuxue Feng", image: 'xuxuefeng.png'}
  // ];

  // this.statuses = [
  //     {label: 'Unqualified', value: 'unqualified'},
  //     {label: 'Qualified', value: 'qualified'},
  //     {label: 'New', value: 'new'},
  //     {label: 'Negotiation', value: 'negotiation'},
  //     {label: 'Renewal', value: 'renewal'},
  //     {label: 'Proposal', value: 'proposal'}
  // ];
  //test data
  this.loading = false;
  };

  //GET CPU, GPU, RAM
   public getCPU() {
    this.vmShopperService.xCloud_getCPU().subscribe(response => {
      this.CPU_api_value = response;
      // console.log('CPU api', this.CPU_api_value);
    });
  }
  public getGPU() {
    this.vmShopperService.xCloud_getGPU().subscribe(response => {
      this.GPU_api_value = response;
    });
  }
  public getRAM() {
    this.vmShopperService.xCloud_getRAM().subscribe(response => {
      this.memory_api_value = response;
    });
  }
  //Get CPU, GPU, RAM

  //VMQuery
  async getUSDtoTWD(): Promise<void> {
    const res = await fetch(this.institutionsUrl);
    this.USD_currency = await res.json();
    // console.log('this.USD_currency["USDTWD"]:', this.USD_currency["USDTWD"]);
    console.log('USD to TWD', this.USD_currency["USDTWD"]["Exrate"]);
  };


  public xcloud_region() {
    this.vmShopperService.xCloud_getRegion('GCP').subscribe(res => {
      this.GCP_Region = res;
      this.GCP_region_value = this.region_dict(this.GCP_Region);
      console.log('this.GCP_region_value', this.GCP_region_value);
    });
    this.vmShopperService.xCloud_getRegion('Azure').subscribe(res => {
      this.Azure_Region = res;
      this.Azure_region_value = this.region_dict(this.Azure_Region);
      console.log('this.Azure_region_value', this.Azure_region_value);
    });
    this.vmShopperService.xCloud_getRegion('Aws').subscribe(res => {
      this.AWS_Region = res;
      this.AWS_region_value = this.region_dict(this.AWS_Region);
      console.log('this.AWS_region_value', this.AWS_region_value);
    });
  }

  region_dict(region) {
  let region_value = [];
  region.forEach((v): void => {
    v.items.forEach((item: any): void => {
      region_value.push(item.value);
    });
  });
    return region_value;
  }

  public GetVMQuery() {
    this.Query_ALLdata = [];
    this.alldata = [];
    this.all_query = [];
    let Get_QueryAPI_time = 0;
    if (this.selectedcurrency != null && this.selectedPlatform != null && this.selectedCPU >= 0 && this.selectedmemory >= 0 && this.selectedGPU >= 0) {
      for (let i = 0; i < this.selectedVendor.length; i++) {
        console.log('this.selectedVendor', this.selectedVendor[i]);
        if (this.selectedVendor[i] == 'GCP') {
          for (let region_dict_temp = 0; region_dict_temp < this.GCP_region_value.length; region_dict_temp++) {
            this.Query_data = {
              preferedVendor: this.selectedVendor[i],
              preferedRegion: this.GCP_region_value[region_dict_temp],
              vCPUs: Number(this.selectedCPU),
              ram: Number(this.selectedmemory),
              operatingSystem: this.selectedPlatform,
              gpu: Number(this.selectedGPU),
              topN: 10
            };
            console.log('Get_QueryAPI_time=', ++Get_QueryAPI_time);
            this.all_query.push(this.Query_data);
          }
        }
        else if (this.selectedVendor[i] == 'Azure') {
          for (let region_dict_temp = 0; region_dict_temp < this.Azure_region_value.length; region_dict_temp++) {
            this.Query_data = {
              preferedVendor: this.selectedVendor[i],
              preferedRegion: this.Azure_region_value[region_dict_temp],
              vCPUs: Number(this.selectedCPU),
              ram: Number(this.selectedmemory),
              operatingSystem: this.selectedPlatform,
              gpu: Number(this.selectedGPU),
              topN: 10
            };
            console.log('Get_QueryAPI_time=', ++Get_QueryAPI_time);
            this.all_query.push(this.Query_data);
          }
        }
        else {
          for (let region_dict_temp = 0; region_dict_temp < this.AWS_region_value.length; region_dict_temp++) {
            this.Query_data = {
              preferedVendor: this.selectedVendor[i],
              preferedRegion: this.AWS_region_value[region_dict_temp],
              vCPUs: Number(this.selectedCPU),
              ram: Number(this.selectedmemory),
              operatingSystem: this.selectedPlatform,
              gpu: Number(this.selectedGPU),
              topN: 10
            };
            console.log('Get_QueryAPI_time=', ++Get_QueryAPI_time);
            this.all_query.push(this.Query_data);
          }
        }
        let each_machinetype: string;
        let each_region: string;
        let all_region: string[] = [];
        let all_machine: string[] = [];

        for (let i = 0; i < this.all_query.length; i++) {
          this.vmShopperService.xCloud_query(this.all_query[i]).subscribe((res: DataTable<VMQuery_ALLdata>): void => { //change!
            this.tableColumn = this.getDataTableColumns(res.columns, this.tableColumn);

            for (let p: number = 0; p < res.values.length; p++) {
              res.values[p]["Action"] = false;
              res.values[p]["recommend_index"] = 0;
              res.values[p]["monthlyCost"] = res.values[p]["monthlyCost"] / this.USD_currency["USDTWD"]["Exrate"];
              res.values[p]["Platform"] = this.selectedPlatform;
              each_machinetype = res.values[p].machineType as string;
              each_region = res.values[p].region as string;
              if (all_machine.includes(each_machinetype)) {
                if (all_region.includes(each_region)) {
                }
                else {
                  all_region.push(each_region);
                  this.alldata.push(res.values[p]);
                }
              }

              else {
                all_machine.push(each_machinetype);
                all_region.push(each_region);
                this.alldata.push(res.values[p]);
              }
            }
            this.Query_ALLdata = this.alldata;
            console.log('All VM data:', this.Query_ALLdata);
          }
          );
        }
      }
      this.deduplicateRegion() //calc latency
      this.table_check = 1;
    }
    else {
      this.table_check = 0;
      alert("Please select your desired VM condition");
    }
  }

  //latency code start
  delay(n) {
    return new Promise(function (resolve) {
      setTimeout(resolve, n * 1000);
    });
  }


  loopCount: number = 0;
  regionLatencys_GCP = [];
  regionLatencys_Azure = [];
  regionLatencys_AWS = [];
  ALLdata_length: number = 0;
  async deduplicateRegion(): Promise<void> {
    await this.delay(3);
    this.GCP_latency_min = 999999;
    this.GCP_latency_max = 0;
    this.AWS_latency_min = 999999;
    this.AWS_latency_max = 0;
    this.Azure_latency_min = 999999;
    this.Azure_latency_max = 0;

    this.ALLdata_length = this.Query_ALLdata.length;
    const dedpuSet_GCP: Set<string> = new Set();
    const dedpuSet_Azure: Set<string> = new Set();
    const dedpuSet_AWS: Set<string> = new Set();
    this.regionLatencys_GCP = [];
    this.regionLatencys_Azure = [];
    this.regionLatencys_AWS = [];
    let temp_length = 0;
    //while (temp_length < this.ALLdata_length) {
    temp_length = 0;
    this.Query_ALLdata.forEach((v: any): void => {
      if (v.vendor == 'GCP')
        dedpuSet_GCP.add(<string>v.regionId);
      else if (v.vendor == 'Azure')
        dedpuSet_Azure.add(<string>v.regionId);
      else
        dedpuSet_AWS.add(<string>v.regionId);
      temp_length += 1;
    });
    console.log('temp_length', temp_length);
    // }
    for (let regionId of Array.from(dedpuSet_GCP)) {
      this.regionLatencys_GCP.push({ region: regionId, latencys: [], count: this.loopCount });
    }
    for (let regionId of Array.from(dedpuSet_Azure)) {
      this.regionLatencys_Azure.push({ region: regionId, latencys: [], count: this.loopCount });
    }
    for (let regionId of Array.from(dedpuSet_AWS)) {
      this.regionLatencys_AWS.push({ region: regionId, latencys: [], count: this.loopCount });
    }
    console.log('letency dedpuSet_GCP', dedpuSet_GCP);
    console.log('letency dedpuSet_Azure', dedpuSet_Azure);
    console.log('letency dedpuSet_AWS', dedpuSet_AWS);

    this.regionLatencys_GCP.forEach((v: any): void => {
      this.calculateLatencys(v.region, 'GCP');
    });
    this.regionLatencys_Azure.forEach((v: any): void => {
      this.calculateLatencys(v.region, 'Azure');
    });
    this.regionLatencys_AWS.forEach((v: any): void => {
      this.calculateLatencys(v.region, 'AWS');
    });
    console.log('GCP letency regionLatencys', this.regionLatencys_GCP);
    console.log('Azure letency regionLatencys', this.regionLatencys_Azure);
    console.log('AWS letency regionLatencys', this.regionLatencys_AWS);
  }

  async calculateLatencys(region: string, vendor: string): Promise<void> {
    const startTime: number = new Date().getTime();
    // console.log('latency');
    // console.log('latency region', region);
    if (vendor == 'GCP') {
      try {
        const res: Response = await fetch(
          `https://storage.googleapis.com/c168${region}/latency-test.json?${startTime}`, //GCP
          {
            method: 'GET',
            cache: 'no-store',
          });
        if (res?.ok) {
          const endTime: number = new Date().getTime();
          for (let regionLatency of this.regionLatencys_GCP) {
            if (regionLatency.region === region) {
              regionLatency.latencys.push(endTime - startTime);
            }
          }
          this.Query_ALLdata.forEach((v: any): void => {
            if (v.regionId === region) {
              v.latencyFromYou = Number(endTime - startTime);
            }
          });

          //recommend index need latency max & min
          if ((endTime - startTime) < this.GCP_latency_min)
            this.GCP_latency_min = (endTime - startTime);
          if ((endTime - startTime) > this.GCP_latency_max)
            this.GCP_latency_max = (endTime - startTime);
        } else {
          throw new Error(`${res.status}`);
        }
      } catch (err) {

        for (let regionLatency of this.regionLatencys_GCP) {
          if (regionLatency.region === region) {
            regionLatency.latencys.push(0);
          }
        }
        this.logger.debug(`${region}: ${err}`);
        console.log('err', err);
      }

    }
    else if (vendor == 'Azure') {
      try {
        const res: Response = await fetch(
          `https://c168${region}.blob.core.windows.net/public/latency-test.json?${startTime}`, //Azure
          {
            method: 'GET',
            cache: 'no-store',
          });
        if (res?.ok) {
          const endTime: number = new Date().getTime();
          for (let regionLatency of this.regionLatencys_Azure) {
            if (regionLatency.region === region) {
              regionLatency.latencys.push(endTime - startTime);
            }
          }
          this.Query_ALLdata.forEach((v: any): void => {
            if (v.regionId === region) {
              v.latencyFromYou = Number(endTime - startTime);
            }
          });
          if ((endTime - startTime) < this.Azure_latency_min)
            this.Azure_latency_min = (endTime - startTime);
          if ((endTime - startTime) > this.Azure_latency_max)
            this.Azure_latency_max = (endTime - startTime);
        } else {
          throw new Error(`${res.status}`);
        }
      } catch (err) {

        for (let regionLatency of this.regionLatencys_Azure) {
          if (regionLatency.region === region) {
            regionLatency.latencys.push(0);
          }
          this.Query_ALLdata.forEach((v: any): void => {
            if (v.regionId === region) {
              v.latencyFromYou = Number(0);
            }
          });
        }
        this.logger.debug(`${region}: ${err}`);
        console.log('err', err);
      }
    }
    else if (vendor == 'AWS') {
      try {
        const res: Response = await fetch(
          `https://c168${region}.s3.${region}.amazonaws.com/latency-test.json?${startTime}`, //AWS
          {
            method: 'GET',
            cache: 'no-store',
          });
        if (res?.ok) {
          const endTime: number = new Date().getTime();
          for (let regionLatency of this.regionLatencys_AWS) {
            if (regionLatency.region === region) {
              regionLatency.latencys.push(endTime - startTime);
            }
          }
          this.Query_ALLdata.forEach((v: any): void => {
            if (v.regionId === region) {
              v.latencyFromYou = Number(endTime - startTime);
            }
          });
          if ((endTime - startTime) < this.AWS_latency_min)
            this.AWS_latency_min = (endTime - startTime);
          if ((endTime - startTime) > this.AWS_latency_max)
            this.AWS_latency_max = (endTime - startTime);
        } else {
          throw new Error(`${res.status}`);
        }
      } catch (err) {

        for (let regionLatency of this.regionLatencys_AWS) {
          if (regionLatency.region === region) {
            regionLatency.latencys.push(0);
          }
        }
        this.Query_ALLdata.forEach((v: any): void => {
          if (v.regionId === region) {
            v.latencyFromYou = Number(0);
          }
        });
        this.logger.debug(`${region}: ${err}`);
      }
    }
  };
  //latency code end


  //VMQuery

  //Next button func
  public shoppingCard_data: any = [];
  public Comparison_VMdata: any = [];
  Comparison_check = 0;
  public Next_button() {
    this.shoppingCard_data = [];
    this.Comparison_VMdata = [];
    console.log('Next button this.Query_ALLdata', this.Query_ALLdata);
    for (let i = 0; i < this.Query_ALLdata.length; i++) {
      if (this.Query_ALLdata[i]["Action"] == true) {
        this.shoppingCard_data.push(this.Query_ALLdata[i]);
        this.Comparison_VMdata.push(this.Query_ALLdata[i]);
      }
    }
    if (this.selectedpreference === 'Add to cart' && this.shoppingCard_data.length > 0) {
      this.ProjectService.setMessage_shoppingcart(this.shoppingCard_data); //send VM data to shopping cart
      this.ProjectService.store_query_VM(this.Query_ALLdata); //send selected VM data to service
      this.router.navigate(['/shopping']);
    }
    else if (this.selectedpreference === 'Comparison' && this.shoppingCard_data.length == 2) {
      this.Comparison_init();
      this.Comparison_check = 1;
    }
    else if (this.selectedpreference === 'Add to cart') {
      alert("Please select VM(s) to add to cart");
    }
    else if (this.selectedpreference === 'Comparison') {
      alert("Please select 2 VMs to compare");
    }
    else {
      alert("Please choose your preference");
      this.router.navigate(['/mainpage']);
    }
  }
 //Next button func

  //Cal Comparison latency save &  cost save
  cost_saved: number;
  latency_saved: number;
  public Comparison_init() {
    if (this.Comparison_VMdata[0]['monthlyCost'] > this.Comparison_VMdata[1]['monthlyCost']) {
      this.cost_saved = (this.Comparison_VMdata[0]['monthlyCost'] - this.Comparison_VMdata[1]['monthlyCost']) / this.Comparison_VMdata[0]['monthlyCost'];
    }
    else {
      this.cost_saved = (this.Comparison_VMdata[1]['monthlyCost'] - this.Comparison_VMdata[0]['monthlyCost']) / this.Comparison_VMdata[1]['monthlyCost'];
    }

    if (this.Comparison_VMdata[0]['latencyFromYou'] > this.Comparison_VMdata[1]['latencyFromYou']) {
      this.latency_saved = (this.Comparison_VMdata[0]['latencyFromYou'] - this.Comparison_VMdata[1]['latencyFromYou']) / this.Comparison_VMdata[0]['latencyFromYou'];
    }
    else {
      this.latency_saved = (this.Comparison_VMdata[1]['latencyFromYou'] - this.Comparison_VMdata[0]['latencyFromYou']) / this.Comparison_VMdata[1]['latencyFromYou'];
    }
  }

  //GO BACK TO QUERY PAGE BUTTON
  Prev_button(): void {
  this.Comparison_check = 0;
  }

    pre_query_VM() {
    //get query VM data from service

    this.ProjectService.get_query_VM().subscribe(response => {
      this.Query_ALLdata = response;
      console.log('get query VM from service:', response);
    });
    if (this.Query_ALLdata.length > 0) {
      this.table_check = 1;
    }
    else {
      this.table_check = 0;
    }
  }

    recommend_index() {
    this.delay(1);
    let GCP_temp_recommend_index = 0;
    let AWS_temp_recommend_index = 0;
    let Azure_temp_recommend_index = 0;
    this.GCP_cost_min = 999999999;
    this.GCP_cost_max = 0;
    this.AWS_cost_min = 999999999;
    this.AWS_cost_max = 0;
    this.Azure_cost_min = 999999999;
    this.Azure_cost_max = 0;

    this.GCP_recommend = [];
    this.AWS_recommend = [];
    this.Azure_recommend = [];
    // console.log('recommend_index  Query_ALLdata', this.Query_ALLdata);

    //計算各veondr min max cost
    this.Query_ALLdata.forEach((v: any): void => {
      if (v.vendor == 'GCP') {
        if (v.monthlyCost < this.GCP_cost_min)
          this.GCP_cost_min = v.monthlyCost;
        if (v.monthlyCost > this.GCP_cost_max)
          this.GCP_cost_max = v.monthlyCost;
      }
      else if (v.vendor == 'AWS') {
        if (v.monthlyCost < this.AWS_cost_min)
          this.AWS_cost_min = v.monthlyCost;
        if (v.monthlyCost > this.AWS_cost_max)
          this.AWS_cost_max = v.monthlyCost;
      }
      else {
        if (v.monthlyCost < this.Azure_cost_min)
          this.Azure_cost_min = v.monthlyCost;
        if (v.monthlyCost > this.Azure_cost_max)
          this.Azure_cost_max = v.monthlyCost;
      }
    });



    //計算推薦指數
    this.Query_ALLdata.forEach((v: any): void => {
      if (v.vendor == 'GCP') {
        // if (v.monthlyCost < this.GCP_cost_min)
        //   this.GCP_cost_min = v.monthlyCost;
        // if (v.monthlyCost > this.GCP_cost_max)
        //   this.GCP_cost_max = v.monthlyCost;
        if (this.GCP_cost_max == this.GCP_cost_min && this.GCP_latency_min == this.GCP_latency_max)
          v.recommend_index = 1;
        else if (this.GCP_cost_max == this.GCP_cost_min && this.GCP_latency_min != this.GCP_latency_max)
          v.recommend_index = 1 - ((v.latencyFromYou - this.GCP_latency_min) / (this.GCP_latency_max - this.GCP_latency_min));
        else if (this.GCP_cost_max != this.GCP_cost_min && this.GCP_latency_min == this.GCP_latency_max)
          v.recommend_index = 1 - ((v.monthlyCost - this.GCP_cost_min) / (this.GCP_cost_max - this.GCP_cost_min));
        else
          v.recommend_index = 1 - ((v.monthlyCost - this.GCP_cost_min) / (this.GCP_cost_max - this.GCP_cost_min) * 0.5 + (v.latencyFromYou - this.GCP_latency_min) / (this.GCP_latency_max - this.GCP_latency_min) * 0.5);

        if (v.recommend_index >= GCP_temp_recommend_index) {
          this.GCP_recommend.push(v);
          GCP_temp_recommend_index = v.recommend_index;
        }

      }
      else if (v.vendor == 'AWS') {
        // if (v.monthlyCost < this.AWS_cost_min)
        //   this.AWS_cost_min = v.monthlyCost;
        // if (v.monthlyCost > this.AWS_cost_max)
        //   this.AWS_cost_max = v.monthlyCost;
        if (this.AWS_cost_min == this.AWS_cost_max && this.AWS_latency_min == this.AWS_latency_max)
          v.recommend_index = 1;
        else if (this.AWS_cost_min == this.AWS_cost_max && this.AWS_latency_min != this.AWS_latency_max)
          v.recommend_index = 1 - ((v.latencyFromYou - this.AWS_latency_min) / (this.AWS_latency_max - this.AWS_latency_min));
        else if (this.AWS_cost_min != this.AWS_cost_max && this.AWS_latency_min == this.AWS_latency_max)
          v.recommend_index = 1 - ((v.monthlyCost - this.AWS_cost_min) / (this.AWS_cost_max - this.AWS_cost_min));
        else
          v.recommend_index = 1 - ((v.monthlyCost - this.AWS_cost_min) / (this.AWS_cost_max - this.AWS_cost_min) * 0.5 + (v.latencyFromYou - this.AWS_latency_min) / (this.AWS_latency_max - this.AWS_latency_min) * 0.5);
        if (v.recommend_index >= AWS_temp_recommend_index) {
          this.AWS_recommend = v;
          AWS_temp_recommend_index = v.recommend_index;
        }
      }
      else {
        // if (v.monthlyCost < this.Azure_cost_min)
        //   this.Azure_cost_min = v.monthlyCost;
        // if (v.monthlyCost > this.Azure_cost_max)
        //   this.Azure_cost_max = v.monthlyCost;
        if (this.Azure_cost_min == this.Azure_cost_max && this.Azure_latency_min == this.Azure_latency_max)
          v.recommend_index = 1;
        else if (this.Azure_cost_min == this.Azure_cost_max && this.Azure_latency_min != this.Azure_latency_max)
          v.recommend_index = 1 - ((v.latencyFromYou - this.Azure_latency_min) / (this.Azure_latency_max - this.Azure_latency_min));
        else if (this.Azure_cost_min != this.Azure_cost_max && this.Azure_latency_min == this.Azure_latency_max)
          v.recommend_index = 1 - ((v.monthlyCost - this.Azure_cost_min) / (this.Azure_cost_max - this.Azure_cost_min));
        else
          v.recommend_index = 1 - ((v.monthlyCost - this.Azure_cost_min) / (this.Azure_cost_max - this.Azure_cost_min) * 0.5 + (v.latencyFromYou - this.Azure_latency_min) / (this.Azure_latency_max - this.Azure_latency_min) * 0.5);
        if (v.recommend_index >= Azure_temp_recommend_index) {
          this.Azure_recommend = v;
          Azure_temp_recommend_index = v.recommend_index;
        }

      }

    });
    console.log('recommend_index GCP_cost_min', this.GCP_cost_min);
    console.log('recommend_index GCP_cost_max', this.GCP_cost_max);
    console.log('recommend_index GCP_latency_min', this.GCP_latency_min);
    console.log('recommend_index GCP_latency_max', this.GCP_latency_max);
    console.log('recommend_index AWS_cost_min', this.AWS_cost_min);
    console.log('recommend_index AWS_cost_max', this.AWS_cost_max);
    console.log('recommend_index AWS_latency_min', this.AWS_latency_min);
    console.log('recommend_index AWS_latency_max', this.AWS_latency_max);
    console.log('recommend_index Azure_cost_min', this.Azure_cost_min);
    console.log('recommend_index Azure_cost_max', this.Azure_cost_max);
    console.log('recommend_index Azure_latency_min', this.Azure_latency_min);
    console.log('recommend_index Azure_latency_max', this.Azure_latency_max);
    console.log('recommend GCP', this.GCP_recommend);
    console.log('recommend Azure', this.Azure_recommend);
    console.log('recommend AWS', this.AWS_recommend);

  }

  //for go back api data
  public temp_ALLdata: any = [];

  //推薦VM時，將API資料先暫存，並且放入推薦指數最高的VM
  public GetRecommendVM() {
    this.recommendVM_check = 1; //for go back api data
    console.log("print" + this.Query_ALLdata)
    this.temp_ALLdata = this.Query_ALLdata;
    console.log('temp_ALLdata', this.temp_ALLdata);

    this.recommend_index();
    this.Query_ALLdata = [];
    console.log("clean" + this.Query_ALLdata)
    //console.log("GCP"+ this.GCP_recommend, "Azure" + this.Azure_recommend, "AWS" + this.AWS_recommend['vendor'])

    if (this.GCP_recommend['vendor'] == 'GCP'){
      console.log("hi",this.GCP_recommend)
      this.Query_ALLdata.push(this.GCP_recommend);
    }

    if (this.Azure_recommend['vendor'] == 'Azure'){
      console.log("hi 1",this.Azure_recommend)
      this.Query_ALLdata.push(this.Azure_recommend);
    }
    if (this.AWS_recommend['vendor'] == 'AWS'){
      console.log("hi 2",this.AWS_recommend)
      this.Query_ALLdata.push(this.AWS_recommend);
    }


    console.log("query_alldata: " , this.Query_ALLdata)
  }

  //Get VM query data back
  public GobackVM() {
    this.recommendVM_check = 0; //for go back api data
    this.Query_ALLdata = this.temp_ALLdata;
  }




}

