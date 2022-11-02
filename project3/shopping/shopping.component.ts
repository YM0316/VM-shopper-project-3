import {
  Component,
  OnInit,
  Input,
  Injector
} from '@angular/core';

import {
  projectService
} from '../project_service';
import {
  Subscription
} from 'rxjs';
import {
  DataTable,
  PrimeTableColumn
} from '@base/model/data-table';

import {
  VMShopperQuery
} from '../region-type';
import {
  VmShopperService
} from '@app/tutorial/service/api/vm-shopper.service';
import {
  Query_DataItem
} from '@tutorial/model';
import {
  BaseComponent
} from '@base/base.component';

//  import xlsx file
import * as XLSX from 'xlsx';


@Component({
  selector: 'digi-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})


export class ShoppingComponent extends BaseComponent implements OnInit {
  @Input() shoppingCard_data: any;
  message: any;
  subscription: Subscription;
  shopping_cart_sum: number = 0;
  shoppingCard_data_length: number = 0;
  title = 'angular-app';
  fileName = 'ExcelSheet.xlsx';
  send_data: any;

  Shopping_cart_Recommend_api: any;


  public tableColumn: PrimeTableColumn[] = [{
    field: 'vendor'
  }, {
    field: 'machineType'
  }, {
    field: 'monthlyCost'
  }, {
    field: 'Quantity'
  }, {
    field: 'total Cost'
  }, {
    field: 'Action'
  }];
  public tableData: Query_DataItem[];
  responsiveOptions;


  constructor(
    public readonly injector: Injector,
    private ProjectService: projectService,
    private readonly vmShopperService: VmShopperService
  ) {
    super(injector);
    this.responsiveOptions = [{
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
      },
      {
        breakpoint: '765px',
        numVisible: 2,
        numScroll: 2
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }

  ngOnInit(): void {
    this.get_shoppingcart_data();
    console.log('shopping cart webpage get data:', this.shoppingCard_data);

    // this.shopping_init();

    this.Recommended();
  }

  shopping_init(item) {
    this.shoppingCard_data_length = 0;
    for (let i = 0; i < item.length; i++) {
      console.log('item:', item[i]);
      item[i]["Delete"] = false;
      item[i]["Quantity"] = 1;
      item[i]["total Cost"] = item[i]["Quantity"] * item[i]["monthlyCost"];
      this.shopping_cart_sum += this.shoppingCard_data[i]["total Cost"];
      console.log('item:', item[i]);
    }
    this.shoppingCard_data_length = this.shoppingCard_data.length;
  }
  shopping_cart_item_sum() {
    this.shopping_cart_sum = 0;
    for (let i = 0; i < this.shoppingCard_data.length; i++) {
      this.shoppingCard_data[i]["total Cost"] = this.shoppingCard_data[i]["Quantity"] * this.shoppingCard_data[i]["monthlyCost"];
      this.shopping_cart_sum += this.shoppingCard_data[i]["total Cost"];
    }
  }

  public get_shoppingcart_data() {
    // console.log('Shopping cart Query data', this.shoppingCard_data);
    this.shoppingCard_data = 0;
    this.ProjectService.getMessage_shoppingcart().subscribe(response => {
      this.shoppingCard_data = response;

    });
    this.shopping_init(this.shoppingCard_data);
  }

  //  delete main item
  Delete_button(element) {
    console.log('Delete start:');
    console.log('element:', element);
    element['Delete'] = true;
    console.log('after delete data:', this.shoppingCard_data);

    for (let i = 0; i < this.shoppingCard_data.length; i++) {
      if (this.shoppingCard_data[i]["Delete"] == true) {
        console.log('delete:', this.shoppingCard_data[i]);
        delete this.shoppingCard_data[i];
      }
      this.shoppingCard_data[i] = this.shoppingCard_data[i + 1];
    }
    this.shoppingCard_data.pop();
    this.shopping_cart_item_sum();
    console.log('after delete:', this.shoppingCard_data);
  }


  Sub_button_Quantity(element) {
    element['Quantity'] -= 1;

    element['Quantity'] = Math.max(1, element['Quantity']);

    this.shopping_cart_item_sum();

  }

  Add_button_Quantity(element) {
    element['Quantity'] += 1;


    this.shopping_cart_item_sum();
  }


  //Recommended code
  recommended_Testdata: any = [];
  recommended_Testdata_length: number = 0;
  rec_gcp: any = [];
  rec_aws: any = [];
  rec_azure: any = [];
  rec_tabel: number;
  rec_url = 'http://35.204.125.116:3389/';

  recom_aws_length :number=0;
  recom_azure_length :number=0;
  recom_gcp_length :number=0;

  recom_aws_index :number=0;
  recom_azure_index :number=0;
  recom_gcp_index :number=0;
  rec_temp : any = [];

  public recommended_apidata: VMShopperQuery = {
    preferedVendor: 'GCP',
    preferedRegion: 'us-central1',
    vCPUs: 32,
    ram: 16,
    operatingSystem: 'Linux',
    gpu: 1,
    topN: 2
  };

  //  azure recom
  async Rec_Azure(azure_VM) {
    let body_data = {
      vendor: azure_VM['vendor'],
      cpu: azure_VM['vCPUs'],
      memory: azure_VM['memory'] * 1024,
      gpu: azure_VM['gPUs'],
      region: azure_VM['regionId'],
      OS: azure_VM['Platform'],
      name: azure_VM['machineType'],
      "topN":5
    };
    console.log('body_data', body_data);
    const res = await fetch(this.rec_url + 'azure_v2', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(body_data)
    });
    this.Shopping_cart_Recommend_api = await res.json();

    console.log('Shopping_cart_Recommend_api', this.Shopping_cart_Recommend_api);
    if (this.Shopping_cart_Recommend_api == 'norec') {
      this.rec_tabel = 0;
    } else {
      this.rec_tabel = 1;
      for (let i = 0; i < this.Shopping_cart_Recommend_api.length; i++) {
        this.Shopping_cart_Recommend_api[i]["Action"] = false;
        this.Shopping_cart_Recommend_api[i]["Quantity"] = 1;

        if (this.shoppingCard_data[0]['Platform'] == "Windows") {
          this.Shopping_cart_Recommend_api[i]["monthlyCost"] = this.Shopping_cart_Recommend_api[i]["Windows Cost"];
        } else {
          this.Shopping_cart_Recommend_api[i]["monthlyCost"] = this.Shopping_cart_Recommend_api[i]["Linux Cost"];
        }
        this.Shopping_cart_Recommend_api[i]["total Cost"] = this.Shopping_cart_Recommend_api[i]["Quantity"] * this.Shopping_cart_Recommend_api[i]["monthlyCost"];
      }
      this.rec_azure = this.Shopping_cart_Recommend_api;

      this.recom_azure_length = this.Shopping_cart_Recommend_api.length;
      console.log('recom_azure_length', this.recom_azure_length );

      for (let i = 0; i < this.rec_azure.length; i++) {
        this.recommended_Testdata.push(this.rec_azure[i]);
      }
      console.log('recommended ', this.recommended_Testdata);
    }
  }

  //  aws recom
  async Rec_AWS(aws_VM) {
    let body_data = {
      vendor: aws_VM['vendor'],
      cpu: aws_VM['vCPUs'],
      memory: aws_VM['memory'],
      gpu: aws_VM['gPUs'],
      region: aws_VM['region'],
      OS: aws_VM['Platform'],
      name: aws_VM['machineType'],
      "topN":5
    };
    console.log('body_data', body_data);
    const res = await fetch(this.rec_url + 'aws_v2', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(body_data)
    });
    this.Shopping_cart_Recommend_api = await res.json();

    console.log('Shopping_cart_Recommend_api', this.Shopping_cart_Recommend_api);
    if (this.Shopping_cart_Recommend_api == 'norec') {
      this.rec_tabel = 0;
    } else {
      this.rec_tabel = 1;
      for (let i = 0; i < this.Shopping_cart_Recommend_api.length; i++) {
        this.Shopping_cart_Recommend_api[i]["Action"] = false;
        this.Shopping_cart_Recommend_api[i]["Quantity"] = 1;
        this.Shopping_cart_Recommend_api[i]["total Cost"] = this.Shopping_cart_Recommend_api[i]["Quantity"] * this.Shopping_cart_Recommend_api[i]["monthlyCost"];
      }

      this.rec_aws = this.Shopping_cart_Recommend_api;
      this.recom_aws_length = this.Shopping_cart_Recommend_api.length;
      console.log('this.recom_aws_length : ' , this.recom_aws_length);

      // this.recommended_Testdata.push(this.rec_aws);
      for (let i = 0; i < this.rec_aws.length; i++) {
        this.recommended_Testdata.push(this.rec_aws[i]);
      }
      console.log('recommended ', this.recommended_Testdata);
    }
  }


  //  gcp recom
  async Rec_GCP(azure_VM) {
    let body_data = {
      vendor: azure_VM['vendor'],
      cpu: azure_VM['vCPUs'],
      memory: azure_VM['memory'],
      gpu: azure_VM['gPUs'],
      region: azure_VM['regionId'],
      OS: azure_VM['Platform'],
      name: azure_VM['machineType'],
      "topN":5
    };
    console.log('body_data', body_data);
    const res = await fetch(this.rec_url + 'gcp_v2', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(body_data)
    });
    this.Shopping_cart_Recommend_api = await res.json();

    console.log('Shopping_cart_Recommend_api', this.Shopping_cart_Recommend_api);
    if (this.Shopping_cart_Recommend_api == 'norec') {
      this.rec_tabel = 0;
    } else {
      this.rec_tabel = 1;
      for (let i = 0; i < this.Shopping_cart_Recommend_api.length; i++) {
        this.Shopping_cart_Recommend_api[i]["Action"] = false;
        this.Shopping_cart_Recommend_api[i]["Quantity"] = 1;


        if (this.shoppingCard_data[0]['Platform'] == "Windows") {
          this.Shopping_cart_Recommend_api[i]["monthlyCost"] = this.Shopping_cart_Recommend_api[i]["Windows Cost"];
        } else {
          this.Shopping_cart_Recommend_api[i]["monthlyCost"] = this.Shopping_cart_Recommend_api[i]["Linux Cost"];
        }
        this.Shopping_cart_Recommend_api[i]["total Cost"] = this.Shopping_cart_Recommend_api[i]["Quantity"] * this.Shopping_cart_Recommend_api[i]["monthlyCost"];
      }
      this.rec_gcp = this.Shopping_cart_Recommend_api;
      // this.recommended_Testdata.push(this.rec_azure);

      this.recom_gcp_length = this.Shopping_cart_Recommend_api.length;
      console.log('this.recom_gcp_length : ', this.recom_gcp_length);

      for (let i = 0; i < this.rec_gcp.length; i++) {
        this.recommended_Testdata.push(this.rec_gcp[i]);
      }
      console.log('recommended ', this.recommended_Testdata);
    }
  }

  // shuffle
  shuffle(element, aws_length) {
    console.log('start shuffling data');
    console.log('element', element);

    //  check each length
    console.log('recom_azure_length', this.recom_azure_length );
    console.log('this.recom_aws_length : ' , aws_length);
    console.log('this.recom_gcp_length : ', this.recom_gcp_length);
    console.log(' this.recommended_Testdata_length : ',  this.recommended_Testdata_length);

    this.recom_azure_index = 0 ;
    this.recom_aws_index = this.recom_azure_index + 1 ;
    this.recom_gcp_index = this.recom_aws_index +1 ;

    for (let i = this.recom_azure_index; i < this.recommended_Testdata_length; i+=3) {
      this.rec_temp.push(this.rec_gcp[i]);
    }

    this.recommended_Testdata = this.rec_temp ;

    console.log('end loop');

    console.log("this.recommended_Testdata", this.recommended_Testdata);
};

  async Recommended() {

    // Get api example data
    this.vmShopperService.xCloud_query(this.recommended_apidata).subscribe((res: DataTable < Query_DataItem > ): void => {
      console.log('table data:', [res]);
      this.tableColumn = this.getDataTableColumns(res.columns, this.tableColumn);

    });

    console.log('this.shoppingCard_data.length:', this.shoppingCard_data.length);
    // this.recommended_Testdata = [];

    for (let num = 0; num < this.shoppingCard_data.length; num++) {
      this.Shopping_cart_Recommend_api = [];
      this.rec_azure = [];
      this.rec_aws = [];
      if (this.shoppingCard_data[num]['vendor'] == 'Azure') {
        this.Rec_Azure(this.shoppingCard_data[num]);
      } else if (this.shoppingCard_data[num]['vendor'] == 'AWS') {
        this.Rec_AWS(this.shoppingCard_data[num]);
      } else {
        this.Rec_GCP(this.shoppingCard_data[num]);
      }
    }


    console.log('rec service data', this.recommended_Testdata);
    // this.delay(3);
    this.shuffle(this.recommended_Testdata, this.rec_aws.length);
    // this.suf_recom_data_length = this.suf_recom_data.length;
    console.log('suffle_recom_data', this.recommended_Testdata);
  }

  delay(n) {
    return new Promise(function (resolve) {
      setTimeout(resolve, n * 1000);
    });
  }



  ReAdd_button(element) {
    console.log('before Recommended add:', this.shoppingCard_data);
    this.shoppingCard_data.push(element);
    element['Action'] = true;

    for (let i = 0; i < this.recommended_Testdata.length; i++) {
      if (this.recommended_Testdata[i]["Action"] == true) {
        console.log('delete:', this.recommended_Testdata[i]);
        delete this.recommended_Testdata[i];
      }
      this.recommended_Testdata[i] = this.recommended_Testdata[i + 1];
    }
    this.recommended_Testdata.pop();
    element['Action'] = false;
    this.shopping_cart_item_sum();
    console.log('after Recommended add:', this.shoppingCard_data);
  }


  // delete recommendation item
  Delete_Recom_button(element) {
    console.log('Delete start:');
    console.log('element:', element);
    element['Delete'] = true;
    console.log('after delete data:', this.recommended_Testdata);

    for (let i = 0; i < this.recommended_Testdata.length; i++) {
      if (this.recommended_Testdata[i]["Action"] == true) {
        console.log('delete:', this.recommended_Testdata[i]);
        delete this.recommended_Testdata[i];
      }
      this.recommended_Testdata[i] = this.recommended_Testdata[i + 1];
    }
    this.recommended_Testdata.pop();
    // this.shopping_cart_item_sum();
    console.log('after delete:', this.recommended_Testdata);
  }


  ReSub_button_Quantity(element) {
    element['Quantity'] -= 1;

    element['Quantity'] = Math.max(1, element['Quantity']);

    this.shopping_cart_item_sum();
  }

  ReAdd_button_Quantity(element) {
    element['Quantity'] += 1;
    this.shopping_cart_item_sum();
  }


  //  export to excel

  exportexcel(): void {
    /* pass here the table id */
    let element = document.getElementById('table_style');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);

  }

}
