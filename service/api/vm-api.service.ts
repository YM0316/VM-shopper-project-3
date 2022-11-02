// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Caloudi
import { environment } from '@environments/environment';
import { DataTable } from '@base/model';
import { DataItem } from '@tutorial/model';

@Injectable({ providedIn: 'root' })
export class VMAPIService {

  constructor(private http: HttpClient) { }

  public getTableDataItems(payload: APIPayload = { isfGroupArray: [], skuNameArray: [] }): Observable<DataTable<DataItem>> {
    return this.http.post<DataTable<DataItem>>(`${environment.cmpAPIServer.url}/api/ri/vm/flexibilityRatio/query`, payload);
  }

  // public getRegion(): Observable<any> {
  //   return this.http.post(`${environment.cmpAPIServer.url}/api/ri/vm/flexibilityRatio/query`);
  // }
}

export interface APIPayload {
  isfGroupArray: string[];
  skuNameArray: string[];
}


