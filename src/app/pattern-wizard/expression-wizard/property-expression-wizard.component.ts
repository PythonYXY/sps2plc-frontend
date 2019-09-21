import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Property } from '../../models/specification';
import { Validators} from '@angular/forms';
import { FormBuilder, FormArray } from '@angular/forms';
import { map, startWith, tap } from 'rxjs/operators';
import { RequirementService } from '../../services/requirement.service';
import {IoTableService} from '../../services/io-table.service';

@Component({
  selector: 'app-property-expression-wizard',
  templateUrl: './property-expression-wizard.component.html',
  styleUrls: ['./property-expression-wizard.component.css']
})
export class PropertyExpressionWizardComponent implements OnInit {

  _property: Property = null;
  _additionalProperties: Property[] = new Array<Property>();
  allProperties: Property[] = new Array<Property>();

  filteredOptions = [];

  propertyForm = this.fb.group({
    propertyFormArray: this.fb.array([])
  });

  @Input() projectId;
  @Output() propertyChanged = new EventEmitter<Property>();
  @Output() propertyValidChanged = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder,
              private reqService: RequirementService,
              private ioTableService: IoTableService) { }

  ngOnInit() {

  }

  private filter(value: string) {
    return this.ioTableService.getItems().filter(item => item.includes(value));
  }

  get propertyFormArray(): FormArray {
    return this.propertyForm.get('propertyFormArray') as FormArray;
  }

  get property(): Property {
    return this._property;
  }

  @Input()
  set property(property: Property) {
    this._property = property;
    this._property.target = '';

    while (this.propertyFormArray.length > 0) {
      this.propertyFormArray.removeAt(this.propertyFormArray.length - 1);
    }
    this.propertyFormArray.controls.push(this.fb.control('', [Validators.required, Validators.pattern(/^\S+$/)]));

    this.filteredOptions.splice(0, this.filteredOptions.length);
    this.filteredOptions[0] = this.propertyFormArray.controls[0].valueChanges.pipe(
      tap(value => {
        this._property.target = value;
        this.update();
      }),
      startWith(''),
      map(value => this.filter(value))
    );

    this.update();
  }

  get additionalProperties(): Property[] {
    return this._additionalProperties;
  }

  @Input()
  set additionalProperties(additionalProperties: Property[]) {
    this._additionalProperties = additionalProperties;
    if (this.additionalProperties.length !== 0) {
      let length = this._additionalProperties.length;
      let control = this.fb.control('', Validators.required);
      this.filteredOptions[length] = control.valueChanges.pipe(
        tap(value => {
          this._additionalProperties[length - 1].target = value;
          this.update();
        }),
        startWith(''),
        map(value => this.filter(value))
      );

      this.propertyFormArray.push(control);
      this.update();
    }
  }

  update() {
    this.allProperties = [this._property, ...this._additionalProperties];
    let properties: Property[] = this.allProperties;

    for (let index = 0; index < this.allProperties.length; index++) {
      this.allProperties[index].text = this.allProperties[index].template.replace(/{(\d+)}/g, function(match, number): string {
        return properties[index].target === '' ? `{${index + 1}}` : properties[index].target;
      });
    }

    this.propertyValidChanged.emit(this.propertyFormArray.controls.every(control => control.valid));
    this.propertyChanged.emit();
  }

  customTrackBy(index: number, obj: any): any {
    return obj;
  }

}
