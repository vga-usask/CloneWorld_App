import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import ParCoords from 'parcoord-es';
import * as d3 from 'd3';

@Component({
  selector: 'app-parallel-coordinates-view',
  templateUrl: './parallel-coordinates-view.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './parallel-coordinates-view.component.scss',
    '../../../../node_modules/parcoord-es/dist/parcoords.css'
  ]
})
export class ParallelCoordinatesViewComponent implements OnInit {

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

  constructor() { }

  async ngOnInit() {
    // TODO those files are not syncing with Git
    this.cloneDictionary = await d3.json("assets/clone_map.json") as any;
    this.globalIdDictionary = await d3.json("assets/global_id_map.json") as any;

    this.obtainDatasetInfo();
    var chartData = this.generateChartData();

    var removeUnchangedRevisionsFilter = (revisionId:number)=>{
      for (const file of Object.values(this.cloneDictionary[revisionId])) {
        for (const clone of Object.values(file)) {
          if (clone.change_count > 0){
            return true;
          } 
        }
      }
      return false;
    }

    setTimeout(() => this.updateChart(chartData, this.datasetInfo.minRevision, this.datasetInfo.maxRevision, removeUnchangedRevisionsFilter), 1000);

    window.onresize = () => {
      this.updateChart(chartData, this.datasetInfo.minRevision, this.datasetInfo.maxRevision, removeUnchangedRevisionsFilter);
    };
  }

  private obtainDatasetInfo() {
    var cloneDictionaryKeys = Object.keys(this.cloneDictionary).map(d => parseInt(d));

    this.datasetInfo.minRevision = Math.min(...cloneDictionaryKeys);
    this.datasetInfo.maxRevision = Math.max(...cloneDictionaryKeys);
  }

  private generateChartData() {
    var data = [];

    for (const globalId of Array.from(Object.keys(this.globalIdDictionary)) as unknown as number[]) {
      var revisionsNode = this.globalIdDictionary[globalId];
      var temp = {};

      for (var i = this.datasetInfo.minRevision; i < this.datasetInfo.maxRevision; i++) {
        temp[i] = revisionsNode[i] ? revisionsNode[i].change_count : 0;
      }
      data.push(temp);
    }

    return data;
  }

  private initializeParcoords() {
    d3.selectAll('div.pc-main-div').selectAll('*').remove();
    return ParCoords()('div.pc-main-div')
      .margin({
        top: 20,
        left: 20,
        right: 20,
        bottom: 20
      })
      .mode('queue')
      .alpha(.3);
  }

  private generateDimensions(pc, minRevision: number, maxRevision: number, filter: (revisionId: number) => boolean) {
    var dimensions = {};
    var range = pc.height() - pc.margin().top - pc.margin().bottom;
    var max = d3.max(Object.values(this.globalIdDictionary), d => d3.max(Object.values(d), dd => dd.change_count));
    var scale = d3.scaleLinear().domain([0, max]).range([range, 1]);

    for (var i = minRevision; i < maxRevision; i++) {
      if (filter(i)) {
        dimensions[i] = {
          type: "number",
          yscale: scale,
          ticks: i > minRevision ? 0 : undefined
        }
      }
    }

    return dimensions;
  }

  private updateChart(data, minRevision: number, maxRevision: number, filter: (revisionId: number) => boolean) {
    var pc = this.initializeParcoords();
    var dimensions = this.generateDimensions(pc, minRevision, maxRevision, filter);
    pc
      .data(data)
      .dimensions(dimensions)
      .render()
      .createAxes()
      .reorderable()
      .brushMode('1D-axes-multi');
  };
}
