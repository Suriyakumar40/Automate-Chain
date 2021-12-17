import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChainComponent } from './chain.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChildrenNodeComponent } from './children-element/children-element.component';

export const routes = [
  { path: '', component: ChainComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    ChainComponent,
    ChildrenNodeComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
  ],
  providers: []
})
export class ChainModule { }
