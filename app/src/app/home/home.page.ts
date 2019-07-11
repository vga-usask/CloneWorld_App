import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { GitCloneViewComponent } from './git-clone-view/git-clone-view.component';
import { ElectronService } from 'ngx-electron';
import { FileMenuViewComponent } from './file-menu-view/file-menu-view.component';
import { CloneReport } from '../data-structures/clone-report';
import { FsService } from 'ngx-fs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  isWindowMaximized: boolean;
  gitRepositoryName = 'No Git Repo Opened';
  isReportOpened = false;

  cloneReport: CloneReport;

  cloneListMaxCount = 100;
  isIgnoringUnchangedClones = true;
  brushedData: any[];

  private _gitRepositoryPath: string;
  get gitRepositoryPath() {
    return this._gitRepositoryPath;
  }
  set gitRepositoryPath(value: string) {
    this._gitRepositoryPath = value;
    if (value && value != '') {
      const pathSplit = value.split('/');
      this.gitRepositoryName = pathSplit[pathSplit.length - 1];
    } else {
      this.gitRepositoryName = 'No Git Repo Opened';
    }
  }

  private _reportPath: string;
  get reportPath() {
    return this._reportPath;
  }
  set reportPath(value: string) {
    this._reportPath = value;

    if (value && value != '') {
      // the fs service does not implement types
      const fs = this.fsService.fs as any;
      this.cloneReport = new CloneReport(
        JSON.parse(fs.readFileSync(value + '/clone_map.json', 'utf8')),
        JSON.parse(fs.readFileSync(value + '/global_id_map.json', 'utf8'))
      );
    }

    this.isReportOpened = this.cloneReport && this.cloneReport.hasLoaded;
  }

  constructor(private electronService: ElectronService, private fsService: FsService, private popoverController: PopoverController) { }

  ngOnInit() {
    this.updateIsWindowMaximized();
    this.electronService.remote.getCurrentWindow().on('resize', () => this.updateIsWindowMaximized());
  }

  async openFileMenu(ev: any) {
    const popover = await this.popoverController.create({
      component: FileMenuViewComponent,
      event: ev,
      translucent: true,
      id: 'file-menu-popover',
      componentProps: {
        updateGitRepositoryPath: (value: string) => this.gitRepositoryPath = value,
        updateReportPath: (value: string) => this.reportPath = value,
      }
    });
    popover.present();
  }

  openDebugger() {
    this.electronService.remote.getCurrentWebContents().openDevTools();
  }

  minimizeWindow() {
    this.electronService.remote.getCurrentWindow().minimize();
  }

  maximizeOrUnmaximizeWindow() {
    if (this.isWindowMaximized) {
      this.electronService.remote.getCurrentWindow().unmaximize();
    } else {
      this.electronService.remote.getCurrentWindow().maximize();
    }
  }

  close() {
    this.electronService.remote.getCurrentWindow().close();
  }

  updateIsWindowMaximized() {
    this.isWindowMaximized = this.electronService.remote.getCurrentWindow().isMaximized();
  }

}
