import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ChildProcessService } from 'ngx-childprocess';
import { FsService } from 'ngx-fs';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-generate-reports-view',
  templateUrl: './generate-reports-view.component.html',
  styleUrls: ['./generate-reports-view.component.scss'],
})
export class GenerateReportsViewComponent implements OnInit {
  sourceRepositoryPath: string;
  sourceBranchName: string;
  nicadPath: string;
  nicadGranularity: string;
  nicadLanguage: string;
  outputPath: string;

  constructor(private electronService: ElectronService, private childProcessService: ChildProcessService, private fsService: FsService, private popoverController: PopoverController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.sourceBranchName = 'master';
    this.nicadGranularity = 'functions';
    this.nicadLanguage = 'java';
  }

  obtainSourceRepositoryPath() {
    this.sourceRepositoryPath = this.electronService.remote.dialog.showOpenDialog({
      title: 'Select Git Repo Directory',
      properties: ['openDirectory']
    })[0].replace(/\\/g, '/');
  }

  obtainNiCadPath() {
    this.nicadPath = this.electronService.remote.dialog.showOpenDialog({
      title: 'Select NiCad Directory',
      properties: ['openDirectory']
    })[0].replace(/\\/g, '/');
  }

  obtainOutputPath() {
    this.outputPath = this.electronService.remote.dialog.showOpenDialog({
      title: 'Select Output Directory',
      properties: ['openDirectory']
    })[0].replace(/\\/g, '/');
  }

  async run() {
    var command = this.electronService.isWindows ? 'wsl ls' : 'ls';
    var appPath = this.electronService.remote.app.getAppPath().replace(/\\/g, '/');
    var cwd: string;

    // the fs service does not implement types
    const fs = this.fsService.fs as any;
    if (fs.existsSync(appPath + '/assets')) {
      cwd = appPath + '/assets/clone_detecting_scripts';
    }
    else {
      cwd = appPath + '/src/assets/clone_detecting_scripts';
    }
    alert(cwd);
    var spawn = this.electronService.isWindows ?
      this.childProcessService.childProcess.spawn(
        'wsl',
        [
          './run.sh',
          '$(wslpath ' + this.sourceRepositoryPath + ')',
          '$(wslpath ' + this.sourceBranchName + ')',
          '$(wslpath ' + this.nicadPath + ')',
          '$(wslpath ' + this.nicadGranularity + ')',
          '$(wslpath ' + this.nicadLanguage + ')',
          '$(wslpath ' + this.outputPath + ')'
        ],
        { cwd } as any
      ) :
      this.childProcessService.childProcess.spawn(
        './run.sh',
        [
          this.sourceRepositoryPath,
          this.sourceBranchName,
          this.nicadPath,
          this.nicadGranularity,
          this.nicadLanguage,
          this.outputPath
        ],
        { cwd } as any
      );

    await this.popoverController.dismiss(undefined, undefined, 'generate-reports-popover');
    spawn.stdout.on('data', (data) => console.log(data.toString()));
    spawn.stderr.on('data', (data) => console.log(data.toString()));
  }

}
