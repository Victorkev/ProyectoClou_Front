import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DataserviceService } from 'src/app/services/dataservice.service';
import * as bcrypt from 'bcryptjs'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  error: boolean = false;
  loading: boolean = false;
  token:string = ""
  username:string = "";
  images: string[] = [
    'https://clouhr.cl/wp-content/uploads/2020/07/logo-oscuro-01.png',
    'https://pixofia.com/img/logov5.png',
    'https://clouhr.cl/wp-content/uploads/2020/07/logo-oscuro-01.png',
  ];

  currentSlideIndex: number = 0;
  
  angForm = new UntypedFormGroup({
    password: new UntypedFormControl('', [Validators.required]),
    confirmPassword: new UntypedFormControl('', [Validators.required])
  })
  mostrarTexto: boolean = false;
  accept:boolean = false;
  errorMsg:any;

  constructor(private snackBar: MatSnackBar,private route: ActivatedRoute, private router: Router, public dataservice: DataserviceService, public dialog: MatDialog ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.username = params['username'];
      console.log("params", params);
    });
    console.log("se inicializa el componente");
      setTimeout(() => {
        this.mostrarTexto = true;
        setInterval(() => {
          this.mostrarTexto = !this.mostrarTexto;
        }, 2000); // Alternar cada 2 segundos
      }, 1000); // Mostrar después de 1 segundo
  }
  

  async validaUsuario(errorModal:any) {
    console.log("formValid:", this.angForm.value);
    this.loading = true;
    if (this.angForm.valid) {
          if(this.angForm.value.password === this.angForm.value.confirmPassword){
            const hashedPassword = await bcrypt.hash(this.angForm.value.password, 10);
            await this.dataservice.saveNewPassword(this.username, this.token, hashedPassword);
            this.accept = true;
            this.loading = false;
          }else{
            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = '400px';
            dialogConfig.height = '210px';
            this.errorMsg = 'Las contraseñas deben ser iguales';
            this.dialog.open(errorModal,dialogConfig);
          }
      } else {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '400px';
        dialogConfig.height = '210px';
        this.errorMsg = 'Debes completar todos los campos';
        this.dialog.open(errorModal,dialogConfig);
        this.loading = false;
      }
    }

  // Función para hashear la contraseña
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Número de rondas de cifrado (más rondas son más seguras pero más lentas)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }
}
  
