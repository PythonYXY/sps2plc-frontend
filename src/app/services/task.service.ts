import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { Task } from '../models/task';
import {catchError, delay, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable()
export class TaskService {
  private taskUrl = 'api/task';
  private finishedTaskUrl = 'api/task/finished';

  constructor(private http: HttpClient) { }

  public getTask(projectId: number): Observable<Task> {
    const url = this.taskUrl + '/' + projectId;
    return this.http.get(url, httpOptions)
      .pipe(
        delay(500),
        catchError(this.handleError('getTask ' + projectId, null))
      );
  }

  public getFinishedTask(projectId: number): Observable<HttpResponse<Task>> {
    const url = this.finishedTaskUrl + '/' + projectId;
    return this.http.get(url, {observe: 'response', headers: httpOptions.headers})
      .pipe(
        catchError(this.handleError('getFinishedTask ' + projectId, null))
      );
  }

  public postTask(task: Task): Observable<Task> {
    return this.http.post(this.taskUrl, task, httpOptions)
      .pipe(
        delay(500),
        catchError(this.handleError('postTask ' + task.projectId, null))
      );
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
