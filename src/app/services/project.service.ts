import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Project } from '../models/project';
import { catchError, tap } from 'rxjs/operators';
import { RequirementService } from './requirement.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ProjectService {

  // URL to web api
  private projectsUrl = 'api/projects';
  private projects: Project[] = null;

  constructor(private http: HttpClient, private reqService: RequirementService) { }


  /** GET projects */
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.projectsUrl, httpOptions)
      .pipe(
        catchError(this.handleError('getProjects', null)),
        tap(projects => {
          this.projects = projects;
        }),
      );
  }

  /** GET project */
  getProject(id): Observable<Project> {

    if (this.projects !== null) {
      const project = this.projects.find(prj => prj.id === id);
      if (project) {
        return of(project);
      }
    }

    return this.http.get<Project>(this.projectsUrl + '/' + id, httpOptions)
      .pipe(
        tap(project => this.projects === null ? this.projects = [project] : this.projects.push(project)),
        catchError(this.handleError('getProjects ' + id, null))
      );
  }


  /** POST new project */
  createProject(project: Project): Observable<HttpResponse<Project>> {
    /**
     * 响应体可能并不包含你需要的全部信息。有时候服务器会返回一个特殊的响应头或状态码，以标记出特定的条件，因此读取它们可能是必要的。
     * 要这样做，你就要通过 observe 选项来告诉 HttpClient，你想要完整的响应信息，而不是只有响应体：
     */
    return this.http.post<Project>(this.projectsUrl, project, {
      headers: httpOptions.headers,
      observe: 'response'})
      .pipe(
        catchError(this.handleError('createProject', null)),
        tap(response => {
          this.projects.push(response.body);
        })
      );
  }

  /** DELETE project */
  deleteProject(project: Project | number): Observable<Project> {
    const id = typeof project === 'number' ? project : project.id;
    const url = `${this.projectsUrl}/${id}`;

    return this.http.delete<Project>(url, httpOptions).pipe(
      catchError(this.handleError('deleteProject ' + id, null)),
      tap(proj => {
        this.reqService.getRequirements(id).subscribe(requirements => {
          requirements.forEach(req => this.reqService.deleteRequirement(req.id).subscribe());
        });
        this.projects.filter(val => {
          return proj.id !== val.id;
        });
      })
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
