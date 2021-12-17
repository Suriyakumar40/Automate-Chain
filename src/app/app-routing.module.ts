import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'chain', pathMatch: 'full' },
  {
    path: 'chain',
    loadChildren: () => import('./components/chain/chain.module').then(m => m.ChainModule)
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
