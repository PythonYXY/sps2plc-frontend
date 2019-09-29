import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Project } from '../models/project';
import { ProjectService } from '../services/project.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../alert/alert.service';
import { Requirement } from '../models/requirement';

@Component({
  selector: 'app-project-dialog',
  templateUrl: './project-dialog.component.html'
})
export class ProjectDialogComponent implements OnInit {


  newProjectForm: FormGroup;

  project = new Project(null, '', '');


  @ViewChild('closeBtn') closeBtn: ElementRef;

  loading = false;

  constructor( private fb: FormBuilder,
               private projectService: ProjectService,
               private alertService: AlertService) {
    this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    this.newProjectForm = this.fb.group({
      name: new FormControl(this.project.name, [ Validators.required, Validators.minLength(3) ]),
      description: new FormControl(this.project.description)
    });
  }

  get name() { return this.newProjectForm.get('name'); }

  get description() { return this.newProjectForm.get('description'); }

  reset() {
    this.newProjectForm.reset();
  }

  createProject() {
    this.loading = true;
    const formModel = this.newProjectForm.value;

    this.project.name = formModel.name as string;
    this.project.description = formModel.description as string;

    this.projectService.createProject(this.project).subscribe(
      response => {
        if (response.status === 200 || response.status === 201) {
          this.alertService.success('New Project created successfully!');
        } else {
          console.log(response);
          this.alertService.error('Error creating the new project!');
        }
        this.closeBtn.nativeElement.click();
        this.loading = false;
      },
      error => {
        this.alertService.error('Error creating the new project!');
        this.loading = false;
      }
    );
  }


}
