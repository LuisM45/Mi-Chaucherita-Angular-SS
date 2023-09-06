import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../shared/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  console.log("Guard watching")
  const userSvc = inject(UserService)
  const router = inject(Router)
  if(!userSvc.currentUser){
    router.navigate(["login"])
    return false
  }
  return true;
};
