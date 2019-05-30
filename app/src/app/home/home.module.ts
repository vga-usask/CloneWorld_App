import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { GitCloneViewComponent } from './git-clone-view/git-clone-view.component';
import { ParallelCoordinatesViewComponent } from './parallel-coordinates-view/parallel-coordinates-view.component';
import { CloneQuickPickerViewComponent } from './clone-quick-picker-view/clone-quick-picker-view.component';
import { CloneInstanceMenuViewComponent } from './clone-instance-menu-view/clone-instance-menu-view.component';
import { FileMenuViewComponent } from './file-menu-view/file-menu-view.component';
import { ControlViewComponent } from './control-view/control-view.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage, GitCloneViewComponent, ParallelCoordinatesViewComponent, CloneQuickPickerViewComponent, CloneInstanceMenuViewComponent, FileMenuViewComponent, ControlViewComponent],
  entryComponents: [GitCloneViewComponent, CloneInstanceMenuViewComponent, FileMenuViewComponent]
})
export class HomePageModule {}
