import {Injectable} from '@angular/core';
import {Project} from '../models/project';
import {InMemoryDbService} from 'angular-in-memory-web-api';
import {ReqState, Requirement} from '../models/requirement';
import {TaskStatus} from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService extends InMemoryDbService{

  createDb() {
    const projects: Project[] = [
      { id: 1, name: 'Project-1', description: 'This is a test project.' },
      { id: 2, name: 'Project-2', description: 'This is a test project.' },
    ];

    const requirements = [
      { id: 1, text: 'After (I0.0 and (I0.1 or I0.2)) until not I0.3, delayL = 10, delayRE = 30, Q0.0 is true and Q0.1 is false.', project: 1, errorDescription: '',
        state: ReqState.COMPLIANT, disabled: false },
      { id: 2, text: 'When (((I0.0 and I0.1) and I0.2) and I0.3), delayL = 100, Q0.0 exists.', project: 1, errorDescription: '',
        state: ReqState.COMPLIANT, disabled: false },
    ];


    return {projects, requirements};
  }

  genId(projects: Project[]): number {
    return projects.length > 0 ? Math.max(...projects.map(project => project.id)) + 1 : 1;
  }
}
