export enum ReqState {
  COMPLIANT = 'COMPLIANT',
  ERROR = 'ERROR',
  NOT_CHECKED = 'NOT_CHECKED'
}

export class Requirement {
  id: number;
  text: string;
  project: number;
  errorDescription: string;
  state: ReqState;
  disabled: boolean;



  create(req: any): Requirement {
    this.id = req.id;
    this.text = req.text;
    this.project = req.project;
    this.errorDescription = req.errorDescription;
    this.state = req.state;
    this.disabled = req.disabled;
    return this;
  }

  get compliant(): boolean { return this.state === ReqState.COMPLIANT; }

  get error(): boolean { return this.state === ReqState.ERROR; }

  get notChecked(): boolean { return this.state === ReqState.NOT_CHECKED; }

}
