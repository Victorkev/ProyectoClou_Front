import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DataserviceService } from 'src/app/services/dataservice.service';

@Component({
  selector: 'app-email-masivo',
  templateUrl: './email-masivo.component.html',
  styleUrls: ['./email-masivo.component.css']
})
export class EmailMasivoComponent {
  name:any;
  user:any;
  firstLetter: any;
  type: any;
  mailGroup:any = FormGroup;

  constructor(private dataservice: DataserviceService, private snackBar: MatSnackBar, private router:Router, private dialog:MatDialog){}

  ngOnInit(){
    this.user = this.dataservice.userData;
    this.firstLetter = this.user.personal.nombre[0];
    this.name = this.user.personal.nombre.charAt(0).toUpperCase() + this.user.personal.nombre.slice(1);
    this.type = this.user.role[0].roleName;
    this.mailGroup = new FormGroup({
      correos: new FormControl('', [Validators.required]),
      asunto: new FormControl('',  [Validators.required]),
      mensaje: new FormControl('',  [Validators.required]),
    });
  }

  logOut(){
    localStorage.removeItem('userData');
    this.router.navigateByUrl("/login");
  }

  sendMail(){
    this.dataservice.sendEmailMasivo(this.mailGroup.value).then((result:any) => {
      console.log("result:any");
    })
  }
  
}
