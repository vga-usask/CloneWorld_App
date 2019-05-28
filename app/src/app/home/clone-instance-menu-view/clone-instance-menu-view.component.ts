import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-clone-instance-menu-view',
  templateUrl: './clone-instance-menu-view.component.html',
  styleUrls: ['./clone-instance-menu-view.component.scss'],
})
export class CloneInstanceMenuViewComponent implements OnInit {

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {}

  async openWithEditor(){
    await this.popoverController.dismiss(undefined, undefined, 'clone-instance-menu-popover');
    window.open('/editor');
  }

}
