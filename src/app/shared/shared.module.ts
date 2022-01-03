import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CustomChainDetailsComponent } from './chain-details/custom-chain-details.component';

@NgModule({
  declarations: [
      CustomChainDetailsComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    CustomChainDetailsComponent,
  ],
  providers: []
})
export class SharedModule { }
