// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Rxjs
import { Observable } from 'rxjs';

// Caloudi
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class DelayTestService {
  constructor(private http: HttpClient) { }

  public apiDelayTest(milliseconds: number): Observable<ArrayBuffer> {
    return this.http.get<ArrayBuffer>(`${environment.cmpAPIServer.url}/api/digi/delay/milliseconds/${milliseconds}`);
  }

  public getRegion(): Observable<any> {
    return this.http.get(`${environment.cmpAPIServer.url}/api/vm/shopper/dimension/region`);
  }
}
