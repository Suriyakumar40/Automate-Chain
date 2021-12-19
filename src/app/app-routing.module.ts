import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'chain-with-csv-table', pathMatch: 'full' },
  {
    path: 'chain',
    loadChildren: () => import('./components/chain/chain.module').then(m => m.ChainModule)
  },
  {
    path: 'chain-with-csv-table',
    loadChildren: () => import('./components/chain-with-csv-table/chain-with-csv-table.module').then(m => m.ChainWithCSVTableModule)
  },
  {
    path: 'chain-with-csv-lists',
    loadChildren: () => import('./components/chain-with-csv-lists/chain-with-csv-lists.module').then(m => m.ChainWithCSVListsModule)
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
