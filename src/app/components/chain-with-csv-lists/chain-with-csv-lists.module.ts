import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChainWithCSVListsComponent } from './chain-with-csv-lists.component';
import { ChildrenWithCSVListsComponent } from './children-element/children-with-csv-lists.component';
import { SharedModule } from 'src/app/shared/shared.module';

export const routes = [
  { path: '', component: ChainWithCSVListsComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    ChainWithCSVListsComponent,
    ChildrenWithCSVListsComponent,
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
export class ChainWithCSVListsModule { }
