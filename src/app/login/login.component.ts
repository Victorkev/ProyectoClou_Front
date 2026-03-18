import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DataserviceService } from '../services/dataservice.service';
import { Dialog } from '@angular/cdk/dialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  error: boolean = false;
  loading: boolean = false;
  images: string[] = [
    'https://clouhr.cl/wp-content/uploads/2020/07/logo-oscuro-01.png',
    'https://pixofia.com/img/logov5.png',
    'https://clouhr.cl/wp-content/uploads/2020/07/logo-oscuro-01.png',
  ];

  currentSlideIndex: number = 0;
  
  angForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required])
  })
  mostrarTexto: boolean = false;
  hide = true;

  constructor(private snackBar: MatSnackBar, private dialog:MatDialog, private router: Router, public dataservice: DataserviceService, private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void {
      setTimeout(() => {
        this.mostrarTexto = true;
        setInterval(() => {
          this.mostrarTexto = !this.mostrarTexto;
        }, 2000); // Alternar cada 2 segundos
      }, 1000); // Mostrar después de 1 segundo
  }
  

  validaUsuario(error1: any, error2: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '210px';
    if (this.angForm.valid) {
      this.loading = true;
      this.dataservice.login(this.angForm.value).then((result: any) => {
        this.loading = false;
        this.cdr.detectChanges(); // Forzar la detección de cambios
        if (result && result.token) {
          if (result.role[0].roleName === 'CLIENT') {
            this.router.navigateByUrl("/client/study");
          } else if (result.role[0].roleName === 'ADMIN') {
            this.router.navigateByUrl("/admin/home");
          }
        }
      }).catch((error: any) => {
        this.loading = false;
        this.cdr.detectChanges(); // Forzar la detección de cambios
        let errorMessage = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
        if (error.error && error.error.username === "Bad credentials") {
          errorMessage = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
          this.loading = false;
          this.cdr.detectChanges(); // Forzar la detección de cambios
        }
        let dialogRef = this.dialog.open(error2, dialogConfig);
        dialogRef.afterClosed().subscribe((result: any) => {
          this.loading = false;
          this.cdr.detectChanges(); // Forzar la detección de cambios
          console.log("llega:", this.loading);
        });
      });
    } else {
      this.error = true;
    }
  }

  clickEvent(event: MouseEvent) {
    this.hide = !this.hide; 
    event.stopPropagation();
  }

}
