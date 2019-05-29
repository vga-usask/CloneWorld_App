import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ElectronService } from 'ngx-electron';

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

  constructor(private electronService: ElectronService, private popoverController: PopoverController) { }

  ngOnInit() { }

  async openWithEditor() {
    await this.popoverController.dismiss(undefined, undefined, 'clone-instance-menu-popover');
    window.open(
      './index.html#/editor' +
      '?filePath=' + this.gitRepositoryPath + "/" + this.filePath +
      '&language=' + this.language +
      '&startLine=' + this.startLine +
      '&endLine=' + this.endLine
    );
  }

  async openWithExternalEditor() {
    await this.popoverController.dismiss(undefined, undefined, 'clone-instance-menu-popover');
    this.electronService.shell.openItem(this.gitRepositoryPath + "/" + this.filePath);
  }

}
