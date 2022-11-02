import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class projectService {

  shoppingcard_data = new Subject<any>();
  comparison_data = new Subject<any>();
  comparison_selected_data = new Subject<any>();
  // private URL_availability = 'https://tdx.transportdata.tw/api/basic/v2/Bike/Availability/City/Taipei?%24top=100&%24format=JSON';
  constructor(private httpClient: HttpClient) { }

  public getData_USDTWD(): Observable<any> {
    // return this.httpClient.get(this.URL_availability);
    // return this.httpClient.get('https://free.currconv.com/api/v7/convert?q=USD_TWD&compact=ultra&apiKey=2e2282f1c1fd83c440ff');
    return this.httpClient.get('https://tw.rter.info/capi.php');
  }

  public getregion_dict(): Observable<any> {
    return this.httpClient.get('assets/region_dict.json');
  }

  selected_VM = new Subject<any>();


  setMessage_shoppingcart(value: any) {
    // this.shoppingcard_data.next(value);
    this.shoppingcard_data = value;
    // console.log('send Message:', value);
    // console.log('service GET shopping cart data', this.shoppingcard_data);
  }

  getMessage_shoppingcart(): Observable<any> {

    // console.log('service Send shopping cart data');
    // console.log('get message:', this.shoppingcard_data);
    return of(this.shoppingcard_data);
  }

  //store queried VM and colume
  store_query_VM(value: any) {
    this.selected_VM = value;
    console.log('stored selected VM', this.selected_VM);
  }
  get_query_VM(): Observable<any> {
    return of(this.selected_VM);
  }

  setMessage_comparison(value: any) {
    // this.shoppingcard_data.next(value);
    this.comparison_data = value;
    // console.log('send Message:', value);
    // console.log('service GET shopping cart data', this.shoppingcard_data);
  }

  getMessage_comparison(): Observable<any> {

    // console.log('service Send shopping cart data');
    // console.log('get message:', this.shoppingcard_data);
    return of(this.comparison_data);
  }

  set_comparison_Message(value: any) {
    // this.shoppingcard_data.next(value);
    this.comparison_selected_data = value;
    // console.log('send Message:', value);
    // console.log('service GET comparison data', this.comparison_selected_data);
  }
  get_comparison_Message(): Observable<any> {

    console.log('service Send comparison data');
    console.log('get comparison message:', this.comparison_selected_data);
    return of(this.comparison_selected_data);
  }


}
