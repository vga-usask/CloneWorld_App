import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { GitCloneViewComponent } from './git-clone-view/git-clone-view.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private popoverController: PopoverController) { }

  async clone(ev: any){
    const popover = await this.popoverController.create({
      component: GitCloneViewComponent,
      event: ev,
      translucent: true,
      id: "git-clone-popover"
    });
    popover.present();
  }

}
