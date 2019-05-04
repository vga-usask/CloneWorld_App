import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { OpenViewComponent } from './open-view/open-view.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private popoverController: PopoverController) { }

  async open(ev: any){
    const popover = await this.popoverController.create({
      component: OpenViewComponent,
      event: ev,
      translucent: true
    });
    popover.present();
  }

}
