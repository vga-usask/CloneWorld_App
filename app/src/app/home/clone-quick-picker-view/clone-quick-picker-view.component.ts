import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { PopoverController } from '@ionic/angular';
import { CloneInstanceMenuViewComponent } from '../open-clone-view/clone-instance-menu-view.component';

@Component({
  selector: 'app-clone-quick-picker-view',
  templateUrl: './clone-quick-picker-view.component.html',
  styleUrls: ['./clone-quick-picker-view.component.scss'],
})
export class CloneQuickPickerViewComponent implements OnInit {

  cloneDictionary: {
    [revisionId: number]: {
      [filePath: string]: {
        [startLine: number]: {
          pcid: number,
          start_line: number,
          end_line: number,
          file: string,
          class_id: number,
          global_id: number,
          change_count: number
        }
      }
    }
  };
  globalIdDictionary: {
    [globalId: number]: {
      [revisionId: number]: {
        pcid: number,
        start_line: number,
        end_line: number,
        file: string,
        class_id: number,
        global_id: number,
        change_count: number
      }
    }
  };

  datasetInfo: {
    minRevision: number,
    maxRevision: number
  } = {} as any;

  frequentlyChangedCloneList: {
    pcid: number,
    start_line: number,
    end_line: number,
    file: string,
    class_id: number,
    global_id: number,
    change_count: number
  }[] = [];

  constructor(private popoverController: PopoverController) { }

  async ngOnInit() {
    // TODO those files are not syncing with Git
    this.cloneDictionary = await d3.json('assets/clone_map.json') as any;
    this.globalIdDictionary = await d3.json('assets/global_id_map.json') as any;
    this.obtainDatasetInfo();

    var globalIdChangeFrequencyMap = new Map<number, number>();

    for (const revisionNode of Object.values(this.globalIdDictionary)) {
      if (revisionNode[this.datasetInfo.maxRevision]) {
        for (const clone of Object.values(revisionNode)) {
          if (clone.change_count > 0) {
            globalIdChangeFrequencyMap.set(
              clone.global_id,
              globalIdChangeFrequencyMap.get(clone.global_id) ?
                globalIdChangeFrequencyMap.get(clone.global_id) + 1 :
                1
            );
          }
        }
      }
    }

    var globalIdChangeFrequencyList = Array.from(globalIdChangeFrequencyMap).sort((a, b) => b[1] - a[1]);
    for (const globalId of globalIdChangeFrequencyList.map(d => d[0])) {
      this.frequentlyChangedCloneList.push(this.globalIdDictionary[globalId][this.datasetInfo.maxRevision]);
    }
  }

  private obtainDatasetInfo() {
    var cloneDictionaryKeys = Object.keys(this.cloneDictionary).map(d => parseInt(d));

    this.datasetInfo.minRevision = Math.min(...cloneDictionaryKeys);
    this.datasetInfo.maxRevision = Math.max(...cloneDictionaryKeys);
  }

  async showCloneItemOptions(ev: any) {
    ev.preventDefault();
    const popover = await this.popoverController.create({
      component: CloneInstanceMenuViewComponent,
      event: ev,
      translucent: true,
      id: 'clone-instance-menu-popover'
    });
    popover.present();
  }

}
