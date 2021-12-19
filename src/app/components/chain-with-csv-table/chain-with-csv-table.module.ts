import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChainWithCSVComponent } from './chain-with-csv-table.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChildrenWithCSVTableComponent } from './children-element/children-with-csv-table.component';
import { SplitNodesComponent } from './split-nodes/split-nodes.component';
import { SharedModule } from 'src/app/shared/shared.module';

export const routes = [
  { path: '', component: ChainWithCSVComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    ChainWithCSVComponent,
    ChildrenWithCSVTableComponent,
    SplitNodesComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  providers: []
})
export class ChainWithCSVTableModule { }
