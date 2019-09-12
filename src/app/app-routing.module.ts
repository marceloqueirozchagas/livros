import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'anos',
    loadChildren: './anos/anos.module#AnosPageModule'
  },
  { path: 'manter-livro/:id', loadChildren: './manter-livro/manter-livro.module#ManterLivroPageModule' },
  { path: 'livros/:ano/:autor', loadChildren: './livros/livros.module#LivrosPageModule' },
  { path: 'autores', loadChildren: './autores/autores.module#AutoresPageModule' }  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
