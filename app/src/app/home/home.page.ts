import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { GitCloneViewComponent } from './git-clone-view/git-clone-view.component';
import { ElectronService } from 'ngx-electron';
import { FileMenuViewComponent } from './file-menu-view/file-menu-view.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  isWindowMaximized: boolean;

  constructor(private electronService: ElectronService, private popoverController: PopoverController) { }

  ngOnInit() {
    this.updateIsWindowMaximized();
    this.electronService.remote.getCurrentWindow().on('resize', () => this.updateIsWindowMaximized());
  }

  async openFileMenu(ev: any) {
    const popover = await this.popoverController.create({
      component: FileMenuViewComponent,
      event: ev,
      translucent: true,
      id: "file-menu-popover"
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
    }
    else {
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
