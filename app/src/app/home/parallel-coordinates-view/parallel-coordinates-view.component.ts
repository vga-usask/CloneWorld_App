import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import ParCoords from 'parcoord-es';
import * as d3 from 'd3';
import { CloneReport } from 'src/app/data-structures/clone-report';

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

  @Input() gitRepositoryPath: string;

  private _cloneReport: CloneReport;
  get cloneReport() {
    return this._cloneReport;
  }
  @Input() set cloneReport(value: CloneReport) {
    this._cloneReport = value;
    this.initialize();
  }

  private _isIgnoringUnchangedClones: boolean;
  get isIgnoringUnchangedClones() {
    return this._isIgnoringUnchangedClones;
  }
  @Input() set isIgnoringUnchangedClones(value: boolean) {
    this._isIgnoringUnchangedClones = value;
    if (this.cloneReport) {
      this.initialize();
    }
  }

  private _brushedData: any[];
  get brushedData() {
    return this._brushedData;
  }
  @Input() set brushedData(value: any[]) {
    this._brushedData = value;
    this.brushedDataChange.emit(value);
  }
  @Output() brushedDataChange = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  updateChartByFindingRelatedClones = (filePath: string, lineNumber: number) => {
    // alert(filePath.substring(this.gitRepositoryPath.length + 1).replace(/\\/g, '/') + ':' + lineNumber);
    this.initialize(filePath.substring(this.gitRepositoryPath.length + 1).replace(/\\/g, '/'), lineNumber);
  }

  resetData = () => this.initialize();

  private initialize(filePath?: string, lineNumber?: number) {
    let chartData = this.generateChartData();
    if (filePath && lineNumber) {
      var queriedClone = Object.values(this.cloneReport.cloneDictionary[this.cloneReport.info.maxRevision][filePath]).find(d => d.start_line <= lineNumber && d.end_line >= lineNumber);
      chartData = chartData.filter(d => {
        const clone = this.cloneReport.globalIdDictionary[d.id][this.cloneReport.info.maxRevision];
        return queriedClone && clone && clone.class_id === queriedClone.class_id;
      });
    }
    chartData = chartData.filter(d => {
      let result = d[this.cloneReport.info.maxRevision] >= 0;
      if (this.isIgnoringUnchangedClones) {
        let hasChangeCount = false;
        for (let i = 0; i <= this.cloneReport.info.maxRevision; i++) {
          if (d[i] > 0) {
            hasChangeCount = true;
            break;
          }
        }
        result = result && hasChangeCount;
      }
      return result;
    });

    const removeUnchangedRevisionsFilter = (revisionId: number, chartData: any[]) => {
      for (const file of Object.values(this.cloneReport.cloneDictionary[revisionId])) {
        for (const clone of Object.values(file)) {
          if (chartData.find(d => d.id == clone.global_id) && clone.change_count > 0) {
            return true;
          }
        }
      }
      return false;
    };

    this.updateChart(chartData, this.cloneReport.info.minRevision, this.cloneReport.info.maxRevision, removeUnchangedRevisionsFilter);

    window.onresize = () => {
      this.updateChart(chartData, this.cloneReport.info.minRevision, this.cloneReport.info.maxRevision, removeUnchangedRevisionsFilter);
    };
  }

  private generateChartData() {
    const data = [];

    for (const globalId of Array.from(Object.keys(this.cloneReport.globalIdDictionary)) as unknown as number[]) {
      const revisionsNode = this.cloneReport.globalIdDictionary[globalId];
      const temp = {} as any;

      for (let i = this.cloneReport.info.minRevision; i <= this.cloneReport.info.maxRevision; i++) {
        temp[i] = revisionsNode[i] ? revisionsNode[i].change_count : Number.NEGATIVE_INFINITY;
      }
      temp.id = globalId.toString();
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
      .alpha(.3)
      .color('blue')
      .alphaOnBrushed(.35)
      .brushedColor('red')
      .on('brush', (d: any[]) => this.brushedData = d);
  }

  private generateDimensions(pc, minRevision: number, maxRevision: number, data, filter: (revisionId: number, chartData: any[]) => boolean) {
    const dimensions = {} as any;
    const range = pc.height() - pc.margin().top - pc.margin().bottom;
    const max = d3.max(Object.values(this.cloneReport.globalIdDictionary), d => d3.max(Object.values(d), dd => (dd as any).change_count));
    const scale = d3.scaleSqrt().domain([0, max]).range([range, 1]);

    for (let i = minRevision; i <= maxRevision; i++) {
      if (filter(i, data)) {
        dimensions[i] = {
          type: 'number',
          yscale: scale,
          ticks: 0
        };
      }
    }
    dimensions[d3.min(Object.keys(dimensions), d => parseInt(d))].ticks = 10;
    dimensions[d3.min(Object.keys(dimensions), d => parseInt(d))].orient = 'left';
    dimensions[d3.max(Object.keys(dimensions), d => parseInt(d))].ticks = 10;
    dimensions[d3.max(Object.keys(dimensions), d => parseInt(d))].orient = 'right';
    dimensions.id = {
      type: 'string',
      ticks: 0,
      tickValues: []
    };

    return dimensions;
  }

  private updateChart(data, minRevision: number, maxRevision: number, filter: (revisionId: number, chartData: any[]) => boolean) {
    const pc = this.initializeParcoords();
    const dimensions = this.generateDimensions(pc, minRevision, maxRevision, data, filter);
    pc
      .data(data)
      .dimensions(dimensions)
      .render()
      .createAxes()
      .reorderable()
      .brushMode('1D-axes-multi');
  }
}
