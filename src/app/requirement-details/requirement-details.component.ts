import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Requirement } from '../models/requirement';
import { RequirementService } from '../services/requirement.service';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-requirement-details',
  templateUrl: './requirement-details.component.html',
  styleUrls: ['./requirement-details.component.css']
})
export class RequirementDetailsComponent implements OnInit {

  requirement: Requirement;
  @Output() update = new EventEmitter<Requirement>();

  @ViewChild('openModalBtn') openModalBtn: ElementRef;
  @ViewChild('closeBtn') closeBtn: ElementRef;

  loading = false;

  caretPos = [1, 1];

  constructor(private requirementService: RequirementService,
              private alertService: AlertService) { }

  ngOnInit() {
  }

  @Input()
  set req(req: Requirement) {
    if (req) {
      this.requirement = req;
      this.openModalBtn.nativeElement.click();
    }

  }

  save() {
    this.loading = true;
    this.requirementService.updateRequirement(this.requirement).subscribe(
      data => {
        this.loading = false;
        this.update.emit(new Requirement().create(data));
        this.closeBtn.nativeElement.click();
      },
      error => {
        this.loading = false;
        console.error(error);
        this.alertService.error('Error during requirement update, try again.');
      }
    );
  }

  getCaretPos(oField) {
    if (!isNaN(oField.selectionStart)) {
      let i = this.requirement.text.indexOf('\n', 0);
      let j = 0;
      let row = 1;
      while (i >= 0 && i < oField.selectionStart) {
        j = i + 1;
        i = this.requirement.text.indexOf('\n', i + 1);
        ++row;
      }
      this.caretPos[0] = row;
      this.caretPos[1] = oField.selectionStart - j;
    }
  }

}
