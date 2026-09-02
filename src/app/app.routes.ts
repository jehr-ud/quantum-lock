import { Routes } from '@angular/router';

import { teacherGuard } from './core/guards/teacher-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // auth paths
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
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register')
        .then(m => m.Register)
  },
  {
    path: 'recover',
    loadComponent: () =>
      import('./features/auth/pages/recover/recover')
        .then(m => m.Recover)
  },

  // teacher paths
  {
    path: 'teacher/session/:id',
    canActivate: [teacherGuard],
    loadComponent: () =>
      import('./features/teacher/pages/session/session')
        .then(m => m.Session)
  },
  {
    path: 'teacher/dashboard',
    canActivate: [teacherGuard],
    loadComponent: () =>
      import('./features/teacher/pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },

  {
    path: 'dev',
    //  canActivate: [teacherGuard],
    loadComponent: () =>
      import('./features/dev/pages/dev/dev')
        .then(m => m.Dev)
  },
  // students paths

  {
    path: 'student/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/student/pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },

  {
    path: 'student/session/:courseId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/student/pages/session/session')
        .then(m => m.Session)
  },
  {
    path: 'student/envelope/:courseId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/student/pages/envelope/envelope')
        .then(m => m.Envelope)
  },
  {
  path: 'student/album/:courseId',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/student/pages/album/album')
      .then(m => m.Album)
}

];