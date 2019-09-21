export enum TaskStatus {
  PRIORITY = 'PRIORITY',
  GENERATE = 'GENERATE',
}

export class Task {
  projectId: number;
  description: string;
  status: TaskStatus;
  timestamp: string;
  priorityArray: string[];
  code: string;

  constructor(task: any) {
    this.projectId = task.projectId;
    this.description = task.description;
    this.status = task.status;
    this.timestamp = task.timestamp;
    this.priorityArray = task.priorityArray;
    this.code = task.code;
  }

  get priority(): boolean { return this.status === TaskStatus.PRIORITY; }

  get generate(): boolean { return this.status === TaskStatus.GENERATE; }

}
