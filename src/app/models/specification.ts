
export class Scope {
  name: string;
  description: string;
  template: string;
  text: string;
  endPointsNum: number;

  leftEndpoint: Endpoint;
  rightEndpoint: Endpoint;

  candidateDelay: Delay[];

  constructor(name: string, template: string, description: string, endPointsNum: number, candidateDelay: Delay[]) {
    this.name = name;
    this.template = template;
    this.description = description;
    this.candidateDelay = candidateDelay;
    this.text = this.template;
    this.endPointsNum = endPointsNum;

    this.leftEndpoint = null;
    this.rightEndpoint = null;
  }

  getAllEndPoints(): Endpoint[] {
    let endPointsList: Endpoint[] = new Array<Endpoint>();

    function tempFunc(_endPoint: Endpoint): void {
      if (_endPoint === null) {
        return;
      }

      if (_endPoint.andGroup !== null) {
        tempFunc(_endPoint.andGroup[0]);
        tempFunc(_endPoint.andGroup[1]);
        return;
      }

      if (_endPoint.orGroup !== null) {
        tempFunc(_endPoint.orGroup[0]);
        tempFunc(_endPoint.orGroup[1]);
        return;
      }

      endPointsList.push(_endPoint);
    }

    tempFunc(this.leftEndpoint);
    tempFunc(this.rightEndpoint);
    return endPointsList;
  }
}

export class Endpoint {
  name: string;
  isNot: boolean;

  andGroup: Endpoint[];
  orGroup: Endpoint[];

  constructor(name: string, isNot: boolean, andGroup: Endpoint[], orGroup: Endpoint[]) {
    this.name = name;
    this.isNot = isNot;
    this.andGroup = andGroup;
    this.orGroup = orGroup;
  }

  toText(index: Index): string {
    let notStr: String = this.isNot ? 'not ' : '';

    if (this.andGroup !== null) {
      return notStr + `(${this.andGroup[0].toText(index)} and ${this.andGroup[1].toText(index)})`;
    }

    if (this.orGroup !== null) {
      return notStr + `(${this.orGroup[0].toText(index)} or ${this.orGroup[1].toText(index)})`;
    }

    index.value++;
    return this.name === '' ? notStr + `{${index.value}}` : notStr + this.name;
  }
}

export class Delay {
  name: string;
  description: string;
  template: string;
  text: string;
  varNum: number;
  vars: string[];

  constructor(name: string, template: string, varNum: number, description: string) {
    this.name = name;
    this.template = template;
    this.description = description;
    this.varNum = varNum;
    this.text = this.template;
    this.vars = new Array(varNum).fill('');
  }
}

export class Property {
  name: string;
  description: string;
  template: string;
  text: string;
  target: string;

  constructor(name: string, template: string, description: string) {
    this.name = name;
    this.template = template;
    this.description = description;
    this.text = template;
    this.target = '';
  }

  copy() {
    return new Property(this.name, this.template, this.description);
  }
}


export class Index {
  value: number;

  constructor(value: number) {
    this.value = value;
  }
}
