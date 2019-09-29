import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {IOMap} from '../../models/io';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {IoTableService} from '../../services/io-table.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AlertService} from '../../alert/alert.service';

@Component({
  selector: 'app-io-table-tab',
  templateUrl: './io-table-tab.component.html',
  styleUrls: ['./io-table-tab.component.css']
})
export class IoTableTabComponent implements OnInit {

  @Input() projectId: number;
  ioTable: IOMap[];
  rows: IOMap[] = [];
  searchValue = '';
  selected: IOMap[] = [];
  IOForm: FormGroup;

  @ViewChild('closeBtn') closeBtn: ElementRef;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(private ioTableService: IoTableService,
              private fb: FormBuilder,
              private alertService: AlertService) {
    this.IOForm = fb.group({
      'IOName': new FormControl(''),
      'IONumber': new FormControl('')
    });
  }

  ngOnInit() {
    this.getIOTable();
  }

  getIOTable() {
    this.ioTableService.getIoTable(this.projectId).subscribe(
      ioTable => {
        this.ioTable = ioTable.map(ioMap => new IOMap(ioMap));
        this.rows = ioTable;
      });
  }

  getRowClass(row: any) {
    return {
      'row-green': true
    };
  }

  addIO() {
    let ioName = this.IOForm.value.IOName as string;
    let ioNumber = this.IOForm.value.IONumber as string;

    this.ioTableService.addIOMap(new IOMap({
      id: null,
      projectId: this.projectId,
      IOName: ioName,
      IONumber: ioNumber}))
      .subscribe(
        ioMap => {
          this.ioTable.push(ioMap);
          this.updateFilter(null);
          this.closeBtn.nativeElement.click();
        }
    );
  }

  deleteSelected() {
    const ioMaps = this.selected;
    ioMaps.forEach(ioMap => {
      this.ioTableService.deleteIOMap(ioMap.id).subscribe(
        response => {
          const index = this.ioTable.findIndex(val => val.id === response.body.id);

          if (index !== -1) {
            this.ioTable.splice(index, 1);
          }
          this.updateFilter(null);
        },
        error => this.alertService.error(error)
      );
    });
  }

  updateFilter(event) {
    const val = this.searchValue.toLowerCase();

    const temp = this.ioTable.filter(ioMap => {
      return ioMap.IONumber.toLowerCase().indexOf(val) !== -1 || ioMap.IOName.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;

    if (event != null) {
      this.table.offset = 0;
    }

    this.selected = [];
  }

  reset() {
    this.IOForm.reset();
  }

}
