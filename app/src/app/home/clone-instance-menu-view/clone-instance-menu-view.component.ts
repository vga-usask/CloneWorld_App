import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, AlertController } from '@ionic/angular';
import { ElectronService } from 'ngx-electron';
import { FsService } from 'ngx-fs';

@Component({
  selector: 'app-clone-instance-menu-view',
  templateUrl: './clone-instance-menu-view.component.html',
  styleUrls: ['./clone-instance-menu-view.component.scss'],
})
export class CloneInstanceMenuViewComponent implements OnInit {

  @Input() gitRepositoryPath: string;
  @Input() filePath: string;
  @Input() language: string;
  @Input() startLine: number;
  @Input() endLine: number;
  @Input() generateEditorhandler: (filePath: string, language: string, startLine: number, endLine: number) => void;

  private get fileFullPath() {
    return this.gitRepositoryPath + '/' + this.filePath;
  }

  constructor(private electronService: ElectronService, private fsService: FsService, private popoverController: PopoverController, private alertController: AlertController) { }

  ngOnInit() { }

  async openWithEditor() {
    await this.popoverController.dismiss(undefined, undefined, 'clone-instance-menu-popover');

    this.checkIfFileExistThenRun(this.fileFullPath, path => {
      this.generateEditorhandler(path, this.language, this.startLine, this.endLine);
    });
  }

  async openWithExternalEditor() {
    await this.popoverController.dismiss(undefined, undefined, 'clone-instance-menu-popover');

    this.checkIfFileExistThenRun(this.fileFullPath, path => this.electronService.shell.openItem(path));
  }

  private async checkIfFileExistThenRun(fileFullpath: string, functionToRun: (fileFullpath: string) => void) {
    // the fs service does not implement types
    const fs = this.fsService.fs as any;
    if (fs.existsSync(fileFullpath)) {
      functionToRun(fileFullpath);
    } else {
      const alert = await this.alertController.create({
        header: 'File Does Not Exist',
        subHeader: 'Please check if you opened correct Git repo directory.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

}
