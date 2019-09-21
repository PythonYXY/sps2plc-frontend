import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../models/project';
import { ProjectService } from '../services/project.service';


@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {

  projectId: number;
  project: Project;

  constructor(private route: ActivatedRoute,
              private projectService: ProjectService) { }

  ngOnInit() {
    this.projectId = +this.route.snapshot.paramMap.get('projectId');
    this.getProject();
  }

  getProject() {
    this.projectService.getProject(this.projectId).subscribe(
      project => this.project = project);
  }

}
