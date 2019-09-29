import { Component, Input, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task';
import { AlertService } from '../../alert/alert.service';
import { saveAs } from 'file-saver/FileSaver';
import { Requirement } from '../../models/requirement';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {RequirementService} from '../../services/requirement.service';
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-tasks-tab',
  templateUrl: './tasks-tab.component.html',
  styleUrls: ['./tasks-tab.component.css'],
  animations: [
    trigger(
      'hiddenDisplay',
      [
        transition(
          ':enter', [
            style({opacity: 0}),
            animate('300ms', style({'opacity': 1}))
          ]
        ),
        transition(
          ':leave', [
            style({'opacity': 1}),
            animate('300ms', style({'opacity': 0}))
          ]
        )]
      )
  ]
})

export class TasksTabComponent implements OnInit {

  @Input() projectId: number;
  task: Task;
  reqArray: any[][];
  priorityArray: number[][];
  circularDependencyReqArray: string[][];
  isHidden: boolean[];

  codeLoading = false;
  priorityLoading = false;

  constructor(private taskService: TaskService,
              private alertService: AlertService,
              private requirementService: RequirementService) { }

  ngOnInit() {
    this.task = new Task({priority: false, generate: false, conflict: false});
    this.finishedTask();
  }

  // drop(event: CdkDragDrop<string[]>, index: number) {
  //   moveItemInArray(this.reqArray[index], event.previousIndex, event.currentIndex);
  //   moveItemInArray(this.priorityArray[index], event.previousIndex, event.currentIndex);
  // }

  finishedTask() {
    this.taskService.getFinishedTask(this.projectId).subscribe(
      response => {
        if (response !== null && (response.status === 200 || response.status === 201)) {
          if (response.body !== null) {
            this.task = new Task(response.body);
          }
        }
      },
      error => {
        this.alertService.error(error);
      }
    );
  }

  getObject(req: Requirement): string {
    return req.text.split(',').pop().trim().split(' ')[0];
  }

  showPriority() {
    this.priorityArray = new Array(this.task.priorityArray.length)
      .fill(null)
      .map((val, index) => this.task.priorityArray[index].split('<').map(id => Number(id)));

    this.isHidden = new Array(this.task.priorityArray.length).fill(false);
    this.reqArray = new Array(this.task.priorityArray.length);

    for (let i = 0; i < this.priorityArray.length; i++) {
      this.reqArray[i] = new Array(this.priorityArray[i].length);
      for (let j = 0; j < this.priorityArray[i].length; j++) {
        this.requirementService.getRequirement(this.priorityArray[i][j]).subscribe(
          req => {
            this.reqArray[i][j] = [this.priorityArray[i][j], req, ''];
          }
        );
      }
    }
  }

  showCircularDependencyArray() {
    let arr = this.task.circularDependencyArray.map(elem => elem.split(','));
    this.circularDependencyReqArray = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      this.circularDependencyReqArray[i] = new Array(arr[i].length);
      for (let j = 0; j < arr[i].length; j++) {
        this.requirementService.getRequirement(Number(arr[i][j])).subscribe(
          req => this.circularDependencyReqArray[i][j] = req.text
        );
      }
    }
  }

  getCode() {
    this.codeLoading = true;
    this.taskService.getTask(this.projectId).subscribe(
      response => {
        this.task = new Task(response);
        console.log(this.task);
        if (this.task.priority) {
          this.showPriority();
        } else if (this.task.circular) {
          this.showCircularDependencyArray();
        }
        this.codeLoading = false;
      },
      error => {
        this.alertService.error(error);
        this.codeLoading = false;
      }
    );
  }

  updatePriority(index: number) {
    this.isHidden[index] = true;
    if (this.isHidden.every(val => val === true)) {
      this.codeLoading = true;
      for (let i = 0; i < this.priorityArray.length; i++) {
        this.priorityArray[i].sort((a, b) => {
          return parseFloat(this.reqArray[i].find(elem => elem[0] === a)[2])
          - parseFloat(this.reqArray[i].find(elem => elem[0] === b)[2]);
        });
      }
      this.task.priorityArray = this.priorityArray.map(arr => arr.join('<'));

      this.taskService.postTask(this.task).subscribe(
        response => {
          this.task = new Task(response);
          this.codeLoading = false;
        },
        error => {
          this.alertService.error(error);
          this.codeLoading = false;
        }
      );
    }
  }

  downloadCode() {
    const blob = new Blob([this.task.code], { type: 'text/plain' });
    saveAs(blob, this.task.timestamp.replace(/ |:/g, '-') + '-ILCode');
  }

  downloadRequirements() {
    const blob = new Blob([this.task.requirements], { type: 'text/plain' });
    saveAs(blob, this.task.timestamp.replace(/ |:/g, '-') + '-Requirements');
  }

}
