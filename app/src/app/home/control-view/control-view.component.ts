import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChildProcessService } from 'ngx-childprocess';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-control-view',
  templateUrl: './control-view.component.html',
  styleUrls: ['./control-view.component.scss'],
})
export class ControlViewComponent implements OnInit {

  @Input() gitRepositoryPath: string;

  private _cloneListMaxCount: number;
  get cloneListMaxCount() {
    return this._cloneListMaxCount;
  }
  @Input() set cloneListMaxCount(value: number) {
    this._cloneListMaxCount = value;
    this.cloneListMaxCountChange.emit(value);
  }
  @Output() cloneListMaxCountChange = new EventEmitter();


  constructor(private childProcessService: ChildProcessService, private alertController: AlertController) { }

  ngOnInit() { }

  gitDetectFileChanges() {
    const command = 'git diff --name-only';
    this.childProcessService.childProcess.exec(command, { cwd: this.gitRepositoryPath } as any, async (err, stdout, stderr) => {
      const alert = await this.alertController.create({
        header: 'Detect File Changes',
        subHeader: (stdout && stdout != '') ? 'Some files have been changed.' : 'No Changes Detected.',
        message: stdout,
        buttons: ['OK']
      });

      await alert.present();
    });
  }

  gitDiscardFileChanges() {
    const command = 'git checkout .';
    this.childProcessService.childProcess.exec(command, { cwd: this.gitRepositoryPath } as any, async (err, stdout, stderr) => {
      const alert = await this.alertController.create({
        header: 'Done',
        message: stderr,
        buttons: ['OK']
      });
      await alert.present();
    });
  }

}
