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
import { GenerateReportsViewComponent } from './generate-reports-view/generate-reports-view.component';
import { VisViewComponent } from './vis-view/vis-view.component';
import { EditorViewComponent } from './editor-view/editor-view.component';

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
  declarations: [
    HomePage,
    GitCloneViewComponent,
    ParallelCoordinatesViewComponent,
    CloneQuickPickerViewComponent,
    CloneInstanceMenuViewComponent,
    FileMenuViewComponent,
    ControlViewComponent,
    GenerateReportsViewComponent,
    VisViewComponent,
    EditorViewComponent
  ],
  entryComponents: [
    GitCloneViewComponent,
    CloneInstanceMenuViewComponent,
    FileMenuViewComponent,
    GenerateReportsViewComponent,
    VisViewComponent,
    EditorViewComponent
  ]
})
export class HomePageModule { }
