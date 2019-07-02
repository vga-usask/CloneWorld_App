import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { PopoverController } from '@ionic/angular';
import { CloneInstanceMenuViewComponent } from '../clone-instance-menu-view/clone-instance-menu-view.component';
import { CloneReport, CloneInstance } from 'src/app/data-structures/clone-report';

@Component({
  selector: 'app-clone-quick-picker-view',
  templateUrl: './clone-quick-picker-view.component.html',
  styleUrls: ['./clone-quick-picker-view.component.scss'],
})
export class CloneQuickPickerViewComponent implements OnInit {

  private _cloneReport: CloneReport;
  get cloneReport() {
    return this._cloneReport;
  }
  @Input() set cloneReport(value: CloneReport) {
    this._cloneReport = value;
    this.initialize();
  }

  frequentlyChangedCloneList: CloneInstance[];

  @Input() gitRepositoryPath: string;

  private _cloneListMaxCount: number;
  get cloneListMaxCount() {
    return this._cloneListMaxCount;
  }
  @Input() set cloneListMaxCount(value: number) {
    this._cloneListMaxCount = value;
    if (this.cloneReport) {
      this.initialize();
    }
  }

  constructor(private popoverController: PopoverController) { }

  ngOnInit() { }

  initialize() {
    this.frequentlyChangedCloneList = [];

    var globalIdChangeFrequencyMap = new Map<number, number>();

    for (const revisionNode of Object.values(this.cloneReport.globalIdDictionary)) {
      if (revisionNode[this.cloneReport.info.maxRevision]) {
        for (const clone of Object.values(revisionNode) as CloneInstance[]) {
          if (clone.change_count > 0) {
            globalIdChangeFrequencyMap.set(
              clone.global_id,
              globalIdChangeFrequencyMap.get(clone.global_id) ?
                globalIdChangeFrequencyMap.get(clone.global_id) + 1 : 1
            );
          }
          else {
            if (!globalIdChangeFrequencyMap.get(clone.global_id)) {
              globalIdChangeFrequencyMap.set(clone.global_id, 0);
            }
          }
        }
      }
    }

    var globalIdChangeFrequencyList = Array.from(globalIdChangeFrequencyMap).sort((a, b) => b[1] - a[1]);
    for (const item of globalIdChangeFrequencyList) {
      var globalId = item[0];
      var clone = this.cloneReport.globalIdDictionary[globalId][this.cloneReport.info.maxRevision];
      clone.global_change_count = item[1];
      this.frequentlyChangedCloneList.push(clone);
    }
    this.frequentlyChangedCloneList = this.frequentlyChangedCloneList.slice(0, this.cloneListMaxCount);
  }

  async showCloneItemOptions(ev: any, clone) {
    ev.preventDefault();
    const popover = await this.popoverController.create({
      component: CloneInstanceMenuViewComponent,
      event: ev,
      translucent: true,
      id: 'clone-instance-menu-popover',
      componentProps: {
        gitRepositoryPath: this.gitRepositoryPath,
        filePath: clone.file,
        language: 'java',
        startLine: clone.start_line,
        endLine: clone.end_line
      }
    });
    popover.present();
  }

}
