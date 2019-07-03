import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ChildProcessService } from 'ngx-childprocess';
import { FsService } from 'ngx-fs';
import { LoadingController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-git-clone-view',
  templateUrl: './git-clone-view.component.html',
  styleUrls: ['./git-clone-view.component.scss'],
})
export class GitCloneViewComponent implements OnInit {

  constructor(private electronService: ElectronService, private childProcessService: ChildProcessService, private fsService: FsService, private loadingController: LoadingController, private popoverController: PopoverController) { }

  ngOnInit() { }

  confirm(gitLink: string) {
    this.gitClone(gitLink, this.askUserForOutDirectory()[0]);
  }

  private async gitClone(gitLink: string, outDirectory: string) {
    if (outDirectory && outDirectory != '') {
      const command = 'git clone ' + gitLink;

      // the fs service does not implement types
      const fs = this.fsService.fs as any;
      if (!fs.existsSync(outDirectory)) {
        fs.mkdirSync(outDirectory);
      }

      const cloneLoadingController = await this.loadingController.create({
        message: 'Cloning...',
      });
      await cloneLoadingController.present();

      this.childProcessService.childProcess.exec(command, { cwd: outDirectory } as any, async (err, stdout, stderr) => {
        await cloneLoadingController.dismiss();
        await this.popoverController.dismiss(undefined, undefined, 'git-clone-popover');
      });
    }
  }

  askUserForOutDirectory() {
    return this.electronService.remote.dialog.showOpenDialog({
      title: 'Select Out Directory',
      properties: ['openDirectory']
    });
  }

}
