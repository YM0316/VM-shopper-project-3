// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// Rxjs
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { SelectItemGroup, SelectItem } from 'primeng/api';
import { VMShopperQuery } from '@app/project3/region-type';


@Injectable({
  providedIn: 'root',
})
export class VmShopperService {
  constructor(private http: HttpClient) { }

  public getPreferedRegionGroupList(): Observable<Array<SelectItemGroup>> {
    return this.http.get<Array<SelectItemGroup>>(`${environment.cmpAPIServer.url}/api/vm/shopper/dimension/regionGroup`);
  }

  public getOperationSystemList(): Observable<Array<SelectItem>> {
    return this.http.get<Array<SelectItem>>(`${environment.cmpAPIServer.url}/api/vm/shopper/dimension/operatingSystem`);
  }

  public getCPUList(): Observable<Array<SelectItem>> {
    return this.http.get<Array<SelectItem>>(`${environment.cmpAPIServer.url}/api/vm/shopper/dimension/vCPU`);
  }

  public getRAMList(): Observable<Array<SelectItem>> {
    return this.http.get<Array<SelectItem>>(`${environment.cmpAPIServer.url}/api/vm/shopper/dimension/ram`);
  }


  public getCategoryList(): Observable<Array<SelectItem>> {
    return this.http.get<Array<SelectItem>>(`${environment.cmpAPIServer.url}/api/vm/shopper/dimension/category`);
  }

  public getGPUList(): Observable<Array<SelectItem>> {
    return this.http.get<Array<SelectItem>>(`${environment.cmpAPIServer.url}/api/vm/shopper/dimension/gpu`);
  }

  public getPriceList(): Observable<Array<SelectItem>> {
    return this.http.get<Array<SelectItem>>(`${environment.cmpAPIServer.url}/api/vm/shopper/price`);
  }

  public getRegion(): Observable<any> {
    return this.http.get(`${environment.cmpAPIServer.url}/api/vm/shopper/dimension/region`);
  }
  public xCloud_getRegion(selectedVendor: string): Observable<any> {
    // console.log(`${SelectVendorComponent.selectedVendor}`);
    return this.http.get(`${environment.xcloudAPIServer.url}/api/xCloud/vm/shopper/${selectedVendor}/dimension/regionGroup`);
  }
  public xCloud_getCPU(): Observable<any> {
    // console.log(`${SelectVendorComponent.selectedVendor}`);
    return this.http.get(`${environment.xcloudAPIServer.url}/api/xCloud/vm/shopper/dimension/vCPU`);
  }
  public xCloud_getGPU(): Observable<any> {
    // console.log(`${SelectVendorComponent.selectedVendor}`);
    return this.http.get(`${environment.xcloudAPIServer.url}/api/xCloud/vm/shopper/dimension/gpu`);
  }
  public xCloud_getRAM(): Observable<any> {
    // console.log(`${SelectVendorComponent.selectedVendor}`);
    return this.http.get(`${environment.xcloudAPIServer.url}/api/xCloud/vm/shopper/dimension/ram`);
  }
  public xCloud_query(vmShopperQuery: VMShopperQuery): Observable<any> {
    // console.log('vm shopper xCloud query start');
    // console.log('vmShopperQuery', vmShopperQuery);
    return this.http.post(`${environment.xcloudAPIServer.url}/api/xCloud/vm/shopper/query`, vmShopperQuery);
  }

  public getData_USDTWD(): Observable<any> {
    return this.http.get('https://free.currconv.com/api/v7/convert?q=USD_TWD&compact=ultra&apiKey=2e2282f1c1fd83c440ff');
  }
  // public queryVMTable(vmShopperQuery: VMShopperQuery): Observable<DataTable<CustomObject>> {
  //   return this.http.post<DataTable<CustomObject>>(`${environment.cmpAPIServer.url}/api/vm/shopper/query`, vmShopperQuery);
  // }

  // // vm provision

  // public getTimeZoneList(): Observable<Array<TimeZoneSelectItem>> {
  //   return this.http.get<Array<TimeZoneSelectItem>>(`${environment.cmpAPIServer.url}/api/shopper/provision/dimension/timeZone`);
  // }

  // public getTimeZoneNow(timeZoneId: string): Observable<Array<string>> {
  //   return this.http.get<Array<string>>(`${environment.cmpAPIServer.url}/api/shopper/provision/timeZone/${timeZoneId}/nowTime`);
  // }

  // public getTenantList(): Observable<SelectItem[]> {
  //   return this.http.get<SelectItem[]>(`${environment.cmpAPIServer.url}/api/shopper/provision/dimension/tenant`);
  // }

  // public getTenantSubscriptionList(tenantId: string): Observable<SelectItem[]> {
  //   return this.http.get<SelectItem[]>(`${environment.cmpAPIServer.url}/api/shopper/provision/tenant/${tenantId}/dimension/subscription`);
  // }

  // public getAvailableSKUResult(tenantId: string, subscriptionGuid: string, regionId: string, skuId: string): Observable<CustomObject> {
  //   return this.http.get<CustomObject>(`${environment.cmpAPIServer.url}/api/shopper/provision/tenant/${tenantId}/subscription/${subscriptionGuid}/region/${regionId}/sku/${skuId}/isAvailable`);
  // }


  // public getResourceGroupList(tenantId: string, subscriptionGuid: string): Observable<ShopperResourceGroup[]> {
  //   return this.http.get<ShopperResourceGroup[]>(`${environment.cmpAPIServer.url}/api/shopper/provision/tenant/${tenantId}/subscription/${subscriptionGuid}/dimension/resourceGroup`);
  // }

  // public getExistedVMNameList(tenantId: string, subscriptionGuid: string, resourceGroupName: string): Observable<string[]> {
  //   return this.http.get<string[]>(`${environment.cmpAPIServer.url}/api/shopper/provision/tenant/${tenantId}/subscription/${subscriptionGuid}/resourceGroup/${resourceGroupName}/dimension/existedVM`);
  // }

  // public getVMImageList(operatingSystem: string): Observable<SelectItem[]> {
  //   return this.http.get<SelectItem[]>(`${environment.cmpAPIServer.url}/api/shopper/provision/operatingSystem/${operatingSystem}/dimension/vmImage`);
  // }

  // public getOSDiskTypeList(): Observable<SelectItem[]> {
  //   return this.http.get<SelectItem[]>(`${environment.cmpAPIServer.url}/api/shopper/provision/dimension/osDiskType`);
  // }

  // // only for azure vm provision cost
  // public getAzureVMProvisionCost(provisionAzureVM: ProvisionAzureVM): Observable<ProvisionCostNG> {
  //   return this.http.post<ProvisionCostNG>(`${environment.cmpAPIServer.url}/api/shopper/provision/vm/provisionCost`, provisionAzureVM);
  // }

  // // on fit all for provision cost
  // public getProvisionCost(vendorId: string, serviceName: string, CustomObject: CustomObject): Observable<ProvisionCost> {
  //   return this.http.post<ProvisionCost>(`${environment.cmpAPIServer.url}/api/shopper/provision/vendor/${vendorId}/service/${serviceName}/provisionCost`, CustomObject);
  // }

  // public checkDatetime(provisionAzureVM: ProvisionAzureVM): Observable<CommonResponse> {
  //   return this.http.post<CommonResponse>(`${environment.cmpAPIServer.url}/api/shopper/provision/checkDateTime`, provisionAzureVM);
  // }

  // public creatVMProvision(provisionAzureVM: ProvisionAzureVM): Observable<Message> {
  //   return this.http.put<Message>(`${environment.cmpAPIServer.url}/api/shopper/provision/vm`, provisionAzureVM);
  // }



}
