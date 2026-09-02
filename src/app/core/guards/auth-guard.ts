import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.waitForAuthState();

  const user = auth.currentUser();

  if (!user) {

    return router.createUrlTree(['/login']);

  }

  return true;

};