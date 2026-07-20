import { Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog';
import { BasketComponent } from './components/basket/basket';

export const routes: Routes = [
  { path: '', redirectTo: '/catalog', pathMatch: 'full' },
  { path: 'catalog', component: CatalogComponent },
  { path: 'basket', component: BasketComponent },
  { path: '**', redirectTo: '/catalog' }
];
