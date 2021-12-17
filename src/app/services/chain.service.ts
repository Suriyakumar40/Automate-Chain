import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChainService {

  constructor(private http: HttpClient) { }

  getCSVData() {
    return this.http.get('assets/chain-data.csv', { responseType: 'text' })
  }
}
