import { Component, OnInit, Input } from '@angular/core';
import { ChildProcessService } from 'ngx-childprocess';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-control-view',
  templateUrl: './control-view.component.html',
  styleUrls: ['./control-view.component.scss'],
})
export class ControlViewComponent implements OnInit {

  @Input() gitRepositoryPath: string;

  constructor(private childProcessService: ChildProcessService, private alertController: AlertController) { }

  ngOnInit() { }

  gitDetectFileChanges() {
    var command = 'git diff --name-only';
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
    var command = 'git checkout .';
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
