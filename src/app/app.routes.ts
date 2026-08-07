import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login')
        .then(m => m.Login)
  },

  {
    path: 'student/dashboard',
    loadComponent: () =>
      import('./features/student/pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },
  {
    path: 'teacher/dashboard',
    loadComponent: () =>
      import('./features/teacher/pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },

  {
    path: 'dev',
    loadComponent: () =>
      import('./features/dev/pages/dev/dev')
        .then(m => m.Dev)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register')
        .then(m => m.Register)
  },
  {
    path: 'teacher/session/:id',
    loadComponent: () =>
      import('./features/teacher/pages/session/session')
        .then(m => m.Session)
  }

];