import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ChildProcessService } from 'ngx-childprocess';

@Component({
  selector: 'app-open-view',
  templateUrl: './open-view.component.html',
  styleUrls: ['./open-view.component.scss'],
})
export class OpenViewComponent implements OnInit {

  constructor(private electronService: ElectronService, private childProcessService: ChildProcessService) { }

  ngOnInit() { }

  confirm(gitLink: string) {
    var appPath = this.electronService.remote.app.getAppPath().replace(/\\/g, "/");
    var command = "git clone " + gitLink;
    var cwd = appPath + "/repos";

    this.childProcessService.childProcess.exec(
      command,
      { cwd: cwd } as any,
      (err, stdout, stderr) => alert(stdout)
    );
  }

}
