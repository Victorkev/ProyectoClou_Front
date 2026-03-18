import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DataserviceService } from '../services/dataservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.css']
})
export class RecoveryPasswordComponent {
  error: boolean = false;
  loading: boolean = false;
  images: string[] = [
    'https://clouhr.cl/wp-content/uploads/2020/07/logo-oscuro-01.png',
    'https://pixofia.com/img/logov5.png',
    'https://clouhr.cl/wp-content/uploads/2020/07/logo-oscuro-01.png',
  ];

  currentSlideIndex: number = 0;
  errorMsg:any;
  angForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required, Validators.email]),
  })
  mostrarTexto: boolean = false;
  accept:boolean = false;


  constructor(private snackBar: MatSnackBar, private router: Router, public dataservice: DataserviceService, public dialog: MatDialog ) {}

  ngOnInit(): void {
      setTimeout(() => {
        this.mostrarTexto = true;
        setInterval(() => {
          this.mostrarTexto = !this.mostrarTexto;
        }, 2000); // Alternar cada 2 segundos
      }, 1000); // Mostrar después de 1 segundo
  }
  

  async validaUsuario(modal:any) {
    let resp;
      this.loading = true;
    console.log("angForm:", this.angForm.value);
    if (this.angForm.valid) {
      let resp:any = await this.dataservice.sendEmailRecovery(this.angForm.value.username);
      console.log("RESP:", resp);
      if(resp.status === 400){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '400px';
        dialogConfig.height = '210px';
        this.errorMsg = 'El correo ingresado no existe en nuestros registros.';
        this.dialog.open(modal, dialogConfig);
      }else{
        this.accept = true;
       this.loading = false;
      }
    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '210px';
      this.errorMsg = 'Ingrese el correo correctamente';
      this.dialog.open(modal, dialogConfig);
      this.loading = false;
    }

  }
}
