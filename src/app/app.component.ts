import { ArrayDataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { DataserviceService } from './services/dataservice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '';
  public products:any = [];

  constructor(private router: Router, private dataservice: DataserviceService,   private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    const userData = localStorage.getItem('userData');

    if (userData) {
      const userFormat = JSON.parse(userData);

      if (userFormat.personal.tipoPersonal === "Admin") {
        this.router.navigate(['/admin/home']);
      } else if (userFormat.personal.tipoPersonal === "Client") {
        this.router.navigate(['/client/study']);
      }
    } else {
      this.activatedRoute.url.subscribe(() => {
        const fullUrl = window.location.href;
        console.log("data:", fullUrl);
        if (!fullUrl.includes('client/reset-password')) {
          this.router.navigate(['/login']);
        }
      });
    }
  }

  // Detectar eventos de actividad como clics y movimientos del ratón
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keypress', ['$event'])
  onUserActivity(event: Event): void {
    // Verificar si estamos en la ruta permitida
    if (this.router.url === '/admin/home' || this.router.url === '/client/study') {
      this.dataservice.resetInactivityTimer(); // Reiniciar temporizador de inactividad
    }
  }

  
}
