import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'feed',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () => import('./feed/feed.page').then(m => m.FeedPage)
  },
  {
    path: 'calendario',
    canActivate: [authGuard],
    loadComponent: () => import('./calendario/calendario.page').then(m => m.CalendarioPage)
  },
  {
    path: 'rangos',
    canActivate: [authGuard],
    loadComponent: () => import('./rangos/rangos.page').then(m => m.RangosPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
