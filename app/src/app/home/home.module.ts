import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { OpenViewComponent } from './open-view/open-view.component';
import { ParallelCoordinatesViewComponent } from './parallel-coordinates-view/parallel-coordinates-view.component';
import { CloneQuickPickerViewComponent } from './clone-quick-picker-view/clone-quick-picker-view.component';

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
  declarations: [HomePage, OpenViewComponent, ParallelCoordinatesViewComponent, CloneQuickPickerViewComponent],
  entryComponents: [OpenViewComponent]
})
export class HomePageModule {}
