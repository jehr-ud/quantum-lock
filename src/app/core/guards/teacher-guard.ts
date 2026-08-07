import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../enums/user-role';
  import { getAuth } from 'firebase/auth';

export const teacherGuard: CanActivateFn = async () => {
  
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.waitForAuthState();

  const user = auth.currentUser();

  if (!user) {

    return router.createUrlTree(['/login']);

  }

  if (user.role !== UserRole.TEACHER) {

    return router.createUrlTree(['/student/dashboard']);

  }

  return true;

};