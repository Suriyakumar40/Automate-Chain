import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChainService {

  constructor(private http: HttpClient) { }

  getCSVData(sheetName: string) {
    const url = `assets/${sheetName}`;
    return this.http.get(url, { responseType: 'text' })
  }
}
