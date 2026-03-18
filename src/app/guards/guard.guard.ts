import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataserviceService } from '../services/dataservice.service';

@Injectable({
  providedIn: 'root'
})
export class GuardGuard implements CanActivate {
  constructor(private router: Router, private dataservice: DataserviceService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isAuthenticated = this.dataservice.isLoggedIn();

    if (!isAuthenticated) {
      // Redirigir a la ruta '/login' si se requiere autenticación y no está autenticado
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
  
}
