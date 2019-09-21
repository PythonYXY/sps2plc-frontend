import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Project } from '../models/project';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IOMap } from '../models/io';
import { Requirement } from '../models/requirement';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class IoTableService {

  // URL to web api
  private ioMapUrl = 'api/ioMap';
  private ioTable: IOMap[] = null;
  private items: string[] = [];

  constructor(private http: HttpClient) { }

  getItems() { return this.items; }

  getIoTable(projectId: number): Observable<IOMap[]> {
    const params = new HttpParams().set('project', projectId.toString());

    return this.http.get<IOMap[]>(this.ioMapUrl, {params: params, headers: httpOptions.headers })
      .pipe(
        tap(ioTable => {
          this.ioTable = ioTable;
          this.items = this.ioTable.map(ioMap => ioMap.IOName);
        })
      );
  }

  addIOMap(ioMap: IOMap): Observable<IOMap> {
    return this.http.post<IOMap>(this.ioMapUrl, ioMap, httpOptions)
      .pipe(
        tap(ret => {
          this.ioTable.push(ret);
          this.items.push(ret.IOName);
        })
      );
  }

  deleteIOMap(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<IOMap>(this.ioMapUrl + '/' + id.toString(), { observe: 'response', headers: httpOptions.headers })
        .pipe(
          tap(response => {
            this.ioTable.splice(this.ioTable.findIndex(val => val.id === response.body.id), 1);
            this.items.splice(this.items.findIndex(item => item === response.body.IOName), 1);
          })
        );
  }

}
