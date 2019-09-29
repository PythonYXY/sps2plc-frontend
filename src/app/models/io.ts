export class IOMap {
  id: number;
  projectId: number;
  IOName: string;
  IONumber: string;


  constructor(ioMap: IOMap) {
    this.id = ioMap.id;
    this.projectId = ioMap.projectId;
    this.IOName = ioMap.IOName;
    this.IONumber = ioMap.IONumber;
  }


}
