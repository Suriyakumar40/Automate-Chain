import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChainDetailsComponent } from './chain-details/chain-details.component';

@NgModule({
  declarations: [
      ChainDetailsComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    ChainDetailsComponent,
  ],
  providers: []
})
export class SharedModule { }
