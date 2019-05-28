import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { GitCloneViewComponent } from '../git-clone-view/git-clone-view.component';

@Component({
  selector: 'app-file-menu-view',
  templateUrl: './file-menu-view.component.html',
  styleUrls: ['./file-menu-view.component.scss'],
})
export class FileMenuViewComponent implements OnInit {

  constructor(private popoverController: PopoverController) { }

  ngOnInit() { }

  async cloneNewRepository(ev: any) {
    const popover = await this.popoverController.create({
      component: GitCloneViewComponent,
      event: ev,
      translucent: true,
      id: 'git-clone-popover'
    });
    popover.present();
  }

}
