import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ChainWithCSVTableComponent } from './chain-with-csv-table.component';
import { ChildrenWithCSVTableComponent } from './children-element/children-with-csv-table.component';
import { SplitNodesComponent } from './split-nodes/split-nodes.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChainDetailsComponent } from './chain-details/chain-details.component';

export const routes = [
  { path: '', component: ChainWithCSVTableComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    ChainWithCSVTableComponent,
    ChildrenWithCSVTableComponent,
    ChainDetailsComponent,
    SplitNodesComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
  ],
  providers: []
})
export class ChainWithCSVTableModule { }
