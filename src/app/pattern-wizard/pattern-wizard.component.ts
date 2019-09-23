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

  delayWithEnd: Delay = new Delay(
    'With end',
    'delayL = {t1}, delayR = {t2}',
    2,
    'Delay with end使Scope的左端点成立时间相对原左端点延迟t1个时间单位，并且若原Scope的时间长度大于t2个时间单位，则Scope的右端点成立时间相对原左端点延迟t2个时间单位。'
  );

  delayWithoutEnd: Delay = new Delay(
    'Without end',
    'delayL = {t1}',
    1,
    'Delay without end使Scope的左端点成立时间相对原左端点延迟t1个时间单位。'
  );

  delayOnBothSides: Delay = new Delay(
    'On both sides',
    'delayL = {t1}, delayRE = {t2}',
    2,
    'Delay on both sides使Scope的左端点成立时间相对原左端点延迟t1个时间单位，同时使右端点成立时间相对原右端点延迟t2个时间单位。'
  );

  scopes: Scope[] = [
    new Scope(
      'Globally',
      'Globally',
      'Globally对Property的成立Scope无要求。',
      0,
      [this.delayWithEnd, this.delayWithoutEnd]
    ),
    new Scope(
      'After Q',
      'After {1}',
      'After Q要求Property在Q成立后必须成立。',
      1,
      [this.delayWithoutEnd, this.delayWithEnd]
    ),
    new Scope(
      'After Q until R',
      'After {1} until {2}',
      'After Q until R要求Property在Q成立之后，在R成立之前的Scope内必须成立。',
      2,
      [this.delayWithEnd, this.delayWithoutEnd, this.delayOnBothSides]
    ),
    new Scope(
      'When Q',
      'When {1}',
      'When Q要求Property在Q成立时也必须成立。',
      1,
      [this.delayOnBothSides, this.delayWithoutEnd, this.delayWithEnd]
    ),
  ];

  properties: Property[] = [
    new Property(
      'Universality',
      '{1} is true',
      'Universality要求控制对象在Scope内持续成立。'
    ),
    new Property(
      'Absence',
      '{1} is false',
      'Absence要求控制对象在Scope内始终不成立。'
    ),
    new Property(
      'Existence',
      '{1} exists',
      'Existence要求控制对象在Scope的第一个时间点成立一次，在其余时间点皆不成立。'
    ),
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
      (this.selectedDelay === null ? '' : this.selectedDelay.text + ', ') +
      propertiesTexts.join(' and ') +
      '.';
  }

  createRequirement() {
    if (this.req.indexOf('exists') !== -1 && this.selectedDelay !== null && this.selectedDelay !== this.delayWithoutEnd) {
      document.getElementById('wrongRequirementButton').click();
      return;
    }

    let savedReqText: string[]  = [this.selectedProperty.text]
      .concat(this.additionalProperties.map(property => property.text))
      .map(property =>
        this.selectedScope.text + ', ' + (this.selectedDelay === null ? '' : this.selectedDelay.text + ', ') + property + '.'
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