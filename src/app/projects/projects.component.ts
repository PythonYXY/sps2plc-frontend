import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projects: Project[];

  selectedProject: Project = new Project(null, '', '');

  loading = true;

  constructor(private projectService: ProjectService,
              private alertService: AlertService) {  }

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    this.projectService.getProjects().subscribe( projects => {
      this.projects = projects;
      this.loading = false;
    });
  }

  deleteProject(project: Project) {
    this.projects = this.projects.filter(proj => proj !== project);
    this.alertService.success('Project deleted successfully!');
    this.projectService.deleteProject(project).subscribe();
  }

  select(project: Project): void {
    this.selectedProject = project;
  }

  getSelectedProject(): Project {
    return this.selectedProject;
  }

  deleteSelectedProject(): void {
    this.deleteProject(this.selectedProject);
  }

}
