import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { GitCloneViewComponent } from '../git-clone-view/git-clone-view.component';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-file-menu-view',
  templateUrl: './file-menu-view.component.html',
  styleUrls: ['./file-menu-view.component.scss'],
})
export class FileMenuViewComponent implements OnInit {

  private _gitRepositoryPath: string;
  get gitRepositoryPath() {
    return this._gitRepositoryPath;
  }
  set gitRepositoryPath(value: string) {
    this._gitRepositoryPath = value;
    this.updateGitRepositoryPath(value);
  }
  @Input() updateGitRepositoryPath: (value: string) => void;

  private _reportPath: string;
  get reportPath() {
    return this._reportPath;
  }
  set reportPath(value: string) {
    this._reportPath = value;
    this.updateReportPath(value);
  }
  @Input() updateReportPath: (value: string) => void;

  constructor(private electronService: ElectronService, private popoverController: PopoverController) { }

  ngOnInit() { }

  async cloneNewRepository() {
    const popover = await this.popoverController.create({
      component: GitCloneViewComponent,
      translucent: true,
      id: 'git-clone-popover'
    });
    popover.present();
  }

  async openRepository() {
    await this.popoverController.dismiss(undefined, undefined, 'file-menu-popover');
    this.gitRepositoryPath = this.electronService.remote.dialog.showOpenDialog({
      title: 'Select Git Repo Directory',
      properties: ['openDirectory']
    })[0].replace(/\\/g, '/');
  }

  async openReport() {
    await this.popoverController.dismiss(undefined, undefined, 'file-menu-popover');
    this.reportPath = this.electronService.remote.dialog.showOpenDialog({
      title: 'Select Report Directory',
      properties: ['openDirectory']
    })[0].replace(/\\/g, '/');
  }

}
