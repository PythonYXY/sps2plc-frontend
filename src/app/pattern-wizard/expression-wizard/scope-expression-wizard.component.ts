import { Component, OnInit, Input, Output } from '@angular/core';
import { Scope, Endpoint, Index, Delay } from '../../models/specification';
import { EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { RequirementService } from '../../services/requirement.service';
import { map, startWith, tap } from 'rxjs/operators';
import { validate } from 'codelyzer/walkerFactory/walkerFn';
import {IoTableService} from '../../services/io-table.service';

@Component({
  selector: 'app-scope-expression-wizard',
  templateUrl: './scope-expression-wizard.component.html',
  styleUrls: ['./scope-expression-wizard.component.css']
})
export class ScopeExpressionWizardComponent implements OnInit {

  _scope: Scope = null;
  _delay: Delay = null;

  scopeForm = this.fb.group({
    scopeFormArray: this.fb.array([]),
  });

  delayForm = this.fb.group({
    delayFormArray: this.fb.array([]),
  });

  filteredOptions = [];

  @Input() projectId;
  @Output() scopeChanged = new EventEmitter<Scope>();
  @Output() scopeValidChanged = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder,
              private reqService: RequirementService,
              private ioTableService: IoTableService) { }

  ngOnInit() {
  }


  private filter(value: string) {
    return this.ioTableService.getItems().filter(item => item.includes(value));
  }

  private onChange() {
    while (this.scopeFormArray.length > 0) {
      this.scopeFormArray.removeAt(this.scopeFormArray.length - 1);
    }
    this.filteredOptions.splice(0, this.filteredOptions.length);

    this._scope.getAllEndPoints().forEach((endPoint, index) => {
      let control = this.fb.control(endPoint.name, [Validators.required, Validators.pattern(/^\S+$/)]);

      this.filteredOptions[index] = control.valueChanges.pipe(
        tap(value => { endPoint.name = value; this.update(); }),
        startWith(''),
        map(value => this.filter(value))
      );

      this.scopeFormArray.push(control);
    });
  }

  get scopeFormArray(): FormArray {
    return this.scopeForm.get('scopeFormArray') as FormArray;
  }

  get delayFormArray(): FormArray {
    return this.delayForm.get('delayFormArray') as FormArray;
  }

  get scope(): Scope {
    return this._scope;
  }

  @Input()
  set scope(scope: Scope) {
    this._scope = scope;
    switch (this._scope.endPointsNum) {
      case 1: {
        this._scope.leftEndpoint = new Endpoint('', false, null, null);
        break;
      }

      case 2: {
        this._scope.leftEndpoint = new Endpoint('', false, null, null);
        this._scope.rightEndpoint = new Endpoint('', false, null, null);
        break;
      }

      default: {
        break;
      }
    }

    this.onChange();
    this.update();
  }

  get delay(): Delay {
    return this._delay;
  }

  @Input()
  set delay(delay: Delay) {
    this._delay = delay;
    if (this._delay !== null) {
      this._delay.vars = new Array(this._delay.varNum).fill('');

      while (this.delayFormArray.length > 0) {
        this.delayFormArray.removeAt(this.delayFormArray.length - 1);
      }

      for (let index = 0; index < this._delay.varNum; index++) {
        let control = this.fb.control('', [Validators.required, Validators.pattern('^[0-9]|[1-9][0-9]*$')]);
        control.valueChanges.subscribe(value => {
          this._delay.vars[index] = value;
          this.update();
        });
        this.delayFormArray.push(control);
      }

      this.update();
    }
  }

  add(endPoint: Endpoint, catg: string, index: number) {
    let newLeftChild = new Endpoint(endPoint.name, false, null, null);
    let newRightChild = new Endpoint('', false, null, null);

    switch (catg) {
      case 'and': {
        endPoint.andGroup = [newLeftChild, newRightChild];
        break;
      }

      case 'or': {
        endPoint.orGroup = [newLeftChild, newRightChild];
        break;
      }

      default: {
        break;
      }
    }

    endPoint.name = '';

    this.onChange();
    this.update();
  }

  not(endPoint: Endpoint) {
    endPoint.isNot = !endPoint.isNot;
    this.update();
  }

  updateDelay() {
    if (this._delay !== null) {
      let delay = this._delay;

      this._delay.text = this._delay.template.replace(/{t(\d+)}/g, function (match, number) {
        return delay.vars[parseInt(number, 10) - 1] === '' ? match : delay.vars[parseInt(number, 10) - 1];
      });
    }
  }

  update() {
    this.updateDelay()
    let leftEndPoint = this._scope.leftEndpoint;
    let rightEndPoint = this._scope.rightEndpoint;

    let index = new Index(0);

    this._scope.text = this.scope.template.replace(/{(\d+)}/g, function (match, number) {

      switch (number as string) {
        case '1': {
          return leftEndPoint.toText(index);
        }

        case '2': {
          return rightEndPoint.toText(index);
        }

        default: {
          console.log('match: ' + match + ', ' + typeof match);
          console.log('number: ' + number + ', ' + typeof number);
          break;
        }
      }
    });

    this.scopeValidChanged.emit(
      this.scopeFormArray.controls.every(control => control.valid) &&
      this.delayFormArray.controls.every(control => control.valid)
    );

    this.scopeChanged.emit(this._scope);
  }

  customTrackBy(index: number, obj: any): any {
    return obj;
  }
}
