import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import { Requirement } from '../models/requirement';
import {Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class RequirementService {

  private requirementsUrl = 'api/requirements';
  private reqFileUrl = 'api/requirements/file';
  private reqTranslateUrl = 'api/requirements/translate';

  private requirements: Requirement[];

  private items: Map<number, Set<string>> = new Map<number, Set<string>>();
  private wordsList: string[] = [
    'Globally',
    'After',
    'When',
    'until',
    'is',
    'true',
    'false',
    'exists',
    'delayL',
    'delayR',
    'delayRE',
    'and',
    'or',
    'not',
    '='
  ];

  constructor(private http: HttpClient) { }

  ObjectFilter(req: string): string[] {
    return req.slice(0, req.length - 1).split(/\(|\)| |,/)
      .filter(value => {
        return value.length > 0 && this.wordsList.indexOf(value) === -1 && !/^\d+$/.test(value);
      });
  }

  getRequirements(projectId: number): Observable<Requirement[]> {

    const params = new HttpParams().set('project', projectId.toString());

    return this.http.get<Requirement[]>(this.requirementsUrl, {params: params, headers: httpOptions.headers })
      .pipe(
        catchError(this.handleError('getRequirements', null)),
        tap(requirements => {
          this.requirements = requirements;
          this.requirements.forEach(req => {
            this.ObjectFilter(req.text).forEach(value =>
              this.items.has(req.project) ?
                this.items.get(req.project).add(value) :
                this.items.set(req.project, new Set([value]))
            );
          });
        })
      );
  }

  getRequirement(id: number): Observable<Requirement> {
    if (this.requirements !== null) {
      let req = this.requirements.find(val => val.id === id);
      if (req !== null) {
        return of(req);
      }
    }

    return this.http.get<Requirement>(this.requirementsUrl + '/' + id, httpOptions)
      .pipe(
        catchError(this.handleError('getRequirement ' + id, null)),
        tap(req => {
          this.requirements.push(req);
          this.ObjectFilter(req.text).forEach(value =>
            this.items.has(req.project) ?
              this.items.get(req.project).add(value) :
              this.items.set(req.project, new Set([value]))
          );
          })
      );
  }

  createRequirement(req: Requirement): Observable<Requirement> {
    return this.http.post<Requirement>(this.requirementsUrl, req, httpOptions)
      .pipe(
        catchError(this.handleError('createRequirement', null)),
        tap(requirement => {
          this.requirements.push(requirement);
          this.ObjectFilter(requirement.text).forEach(value =>
            this.items.has(requirement.project) ?
              this.items.get(requirement.project).add(value) :
              this.items.set(requirement.project, new Set([value]))
          );
        })
      );
  }

  updateRequirement(req: Requirement): Observable<Requirement> {
    return this.http.put<Requirement>(this.requirementsUrl, req, httpOptions)
      .pipe(
        catchError(this.handleError('updateRequirement ' + req.id, null)),
        tap(requirement => {
          this.requirements.splice(this.requirements.findIndex(val => val.id === requirement.id), 1, requirement);
          this.ObjectFilter(requirement.text).forEach(value =>
            this.items.has(requirement.project) ?
              this.items.get(requirement.project).add(value) :
              this.items.set(requirement.project, new Set([value]))
          );
        })
      );
  }

  deleteRequirement(id: number): Observable<HttpResponse<any>> {
    return this.http.delete(this.requirementsUrl  + '/' + id, {observe: 'response', headers: httpOptions.headers})
      .pipe(
        catchError(this.handleError('deleteRequirement ' + id, null)),
        tap(
          requirement => {
            this.requirements.splice(this.requirements.findIndex(val => val.id === requirement.body.id), 1);
            this.items = new Map<number, Set<string>>();
            this.requirements.forEach(req => {
              this.ObjectFilter(req.text).forEach(value =>
                this.items.has(requirement.project) ?
                  this.items.get(requirement.project).add(value) :
                  this.items.set(requirement.project, new Set([value]))
              );
            });
          }
        )
      );
  }

  uploadFile(file: File, projectId: number): Observable<Requirement[]> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('pId', projectId.toString());

    return this.http.post<Requirement[]>(this.reqFileUrl, formData);

  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ': ' + error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
