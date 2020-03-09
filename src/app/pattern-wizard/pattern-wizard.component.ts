import {Component, OnInit} from '@angular/core';
import {Item} from './item';
import {ProjectService} from '../services/project.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Project} from '../models/project';
import {RequirementService} from '../services/requirement.service';
import {ReqState, Requirement} from '../models/requirement';
import { Scope, Property, Delay } from '../models/specification';
import {forkJoin, Observable} from 'rxjs';

@Component({
  selector: 'app-pattern-wizard',
  templateUrl: './pattern-wizard.component.html',
  styleUrls: ['./pattern-wizard.component.css']
})
export class PatternWizardComponent implements OnInit {

  delayWithEnd1: Delay = new Delay(
    'DelayWithEnd1',
    'between {t1} timeUnits and {t2} timeUnits',
    2,
    'DelayWithEnd1使Scope的左端点成立时间相对原左端点延迟t1个时间单位，并且若原Scope的时间长度大于t2个时间单位，则Scope的右端点成立时间相对原左端点延迟t2个时间单位。'
  );

  delayWithEnd2: Delay = new Delay(
    'DelayWithEnd2',
    'within {t1} timeUnits',
    1,
    'DelayWithEnd2使Scope的左端点成立时间相对原左端点延迟0个时间单位，并且若原Scope的时间长度大于t1个时间单位，则Scope的右端点成立时间相对原左端点延迟t1个时间单位。'
  );

  delayWithoutEnd: Delay = new Delay(
    'DelayWithoutEnd',
    'after {t1} timeUnits',
    1,
    'DelayWithoutEnd使Scope的左端点成立时间相对原左端点延迟t1个时间单位。'
  );

  delayOnBothSides: Delay = new Delay(
    'DelayOnBothSides',
    'after {t1} timeUnits and the property still holds for {t2} timeUnits after the end of the scope',
    2,
    'DelayOnBothSides使Scope的左端点成立时间相对原左端点延迟t1个时间单位，同时使右端点成立时间相对原右端点延迟t2个时间单位。'
  );

  delayOnRightSide: Delay = new Delay(
    'DelayOnRightSide',
    'and the property still holds for {t1} timeUnits after the end of the scope',
    1,
    'DelayOnRightSide使Scope右端点成立时间相对原右端点延迟t1个时间单位。'
  );

  scopes: Scope[] = [
    new Scope(
      'Globally',
      'Globally',
      'Globally对Property的成立Scope无要求。',
      0,
      [this.delayWithoutEnd, this.delayWithEnd1, this.delayWithEnd2]
    ),
    new Scope(
      'After Q',
      'After {1}',
      'After Q要求Property在Q成立后必须成立。',
      1,
      [this.delayWithoutEnd, this.delayWithEnd1, this.delayWithEnd2]
    ),
    new Scope(
      'After Q until R',
      'After {1} until {2}',
      'After Q until R要求Property在Q成立之后，在R成立之前的Scope内必须成立。',
      2,
      [this.delayWithoutEnd, this.delayWithEnd1, this.delayWithEnd2, this.delayOnRightSide, this.delayOnBothSides]
    ),
    new Scope(
      'When Q',
      'When {1}',
      'When Q要求Property在Q成立时也必须成立。',
      1,
      [this.delayWithoutEnd, this.delayWithEnd1, this.delayWithEnd2, this.delayOnRightSide, this.delayOnBothSides]
    ),
  ];

  properties: Property[] = [
    new Property(
      'Universality',
      'it is always the case that {1} holds',
      1,
      'Universality要求控制对象在Scope内持续成立。'
    ),
    new Property(
      'Absence',
      'it is never the case that {1} holds',
      1,
      'Absence要求控制对象在Scope内始终不成立。'
    ),
    new Property(
      'Existence',
      '{1} exists immediately',
      1,
      'Existence要求控制对象在Scope的第一个时间点成立一次，在Scope内的其余时间点皆不成立。'
    ),
    new Property(
      'Interlock',
      'it is never the case that ({1} and {2}) hold',
      2,
      'Interlock要求两个控制对象在Scope内不能同时成立。'
    )
  ];

  selectedScope: Scope = null;
  selectedProperty: Property = null;
  selectedDelay: Delay = null;
  additionalProperties: Property[];

  req = '';
  project = new Project(null, null, null);
  scopeValid = false;
  propertyValid = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private projectService: ProjectService,
              private requirementService: RequirementService) {  }

  ngOnInit() {
    this.selectedScope = this.scopes[0];
    this.selectedProperty = this.properties[0];
    this.additionalProperties = new Array<Property>();
    this.getProject();
  }

  updateScopeValid(scopeValid: boolean) {
    this.scopeValid = scopeValid;
  }

  updatePropertyValid(propertyValid: boolean) {
    this.propertyValid = propertyValid;
  }

  getProject() {
    const projectId = +this.route.snapshot.paramMap.get('projectId');
    this.projectService.getProject(projectId).subscribe(project => this.project = project);
  }


  selectScope(selected: Scope) {
    this.selectedScope = selected;
    this.selectedDelay = null;
    this.updateRequirement();
  }

  selectProperty(selected: Property) {
    this.selectedProperty = selected;
    this.additionalProperties = [];
    this.updateRequirement();
  }

  selectAdditionalProperty(selected: Property) {
    this.additionalProperties = this.additionalProperties.concat([selected.copy()]);
    // console.log(this.additionalProperties);
  }

  selectDelay(delay: Delay) {
    this.selectedDelay = delay;
  }

  updateRequirement() {
    let propertiesTexts: string[] = [this.selectedProperty.text].concat(this.additionalProperties.map(property => property.text));
    this.req =  this.selectedScope.text +
      ', ' +
      propertiesTexts.join(' and ') +
      (this.selectedDelay === null ? '.' : ' ' + this.selectedDelay.text + '.');
  }

  createRequirement() {
    if ((this.selectedProperty.name === 'Existence' && this.selectedDelay !== null && this.selectedDelay !== this.delayWithoutEnd) ||
        (this.selectedProperty.name === 'Interlock' && this.selectedScope.name !== 'Globally')) {
      document.getElementById('wrongRequirementButton').click();
      return;
    }

    let savedReqText: string[]  = [this.selectedProperty.text]
      .concat(this.additionalProperties.map(property => property.text))
      .map(property =>
        this.selectedScope.text + ', ' + property + (this.selectedDelay === null ? '.' : ' ' + this.selectedDelay.text + '.')
      );

    let observableBatch = [];
    let projId = this.project.id;

    savedReqText.forEach(req => {
      let requirement = new Requirement();
      requirement.text = req;
      requirement.project = projId;
      requirement.disabled = false;
      requirement.state = ReqState.COMPLIANT;

      observableBatch.push(this.requirementService.createRequirement(requirement));
    });

    forkJoin(observableBatch).subscribe({
      complete: () => this.router.navigateByUrl('/projects/' + projId)
    });
  }
}
