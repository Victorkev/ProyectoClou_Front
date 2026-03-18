import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Route, Router } from '@angular/router';
import { DataserviceService } from 'src/app/services/dataservice.service';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.css']
})
export class CreateFormComponent {
  studyForm:any = FormGroup;
  encuestaForm:any = FormGroup;
  allQuestions:any[] = [];
  loading:boolean = false;
  responseForm:boolean = false;
  selectedQuestions:any;
  years:any[] = [];
  firstLetter:any;
  type:any;
  name:any;
  user:any;

  constructor(private dataservice: DataserviceService, private snackBar: MatSnackBar, private router:Router, private dialog:MatDialog){}

  ngOnInit(){
    this.user = this.dataservice.userData;
    this.firstLetter = this.user.personal.nombre[0];
    this.name = this.user.personal.nombre.charAt(0).toUpperCase() + this.user.personal.nombre.slice(1);
    this.type = this.user.role[0].roleName;
    this.studyForm = new FormGroup({
      studyName: new FormControl('', [Validators.required]),
      studyType: new FormControl('',  [Validators.required]),
      studyEntrega: new FormControl('', [Validators.required]),
      encuesta: new FormControl(false),
    });
    this.studyForm.get('studyName')?.valueChanges.subscribe((value:any) => {
      if (value.includes('/')) {
        const newValue = value.replace(/\//g, '-');
        this.studyForm.get('studyName')?.setValue(newValue, { emitEvent: false });
      }
    });
    this.generateYears();

  }

  generateYears() {
    const startYear = 2023;
    const endYear = 2100;
    for (let year = startYear; year <= endYear; year++) {
      this.years.push(year);
    }
  }

  private addCheckboxes() {
    this.allQuestions.forEach((_, i) => {
      const control = new FormControl(false);
      (this.encuestaForm.controls.questions as FormArray).push(control);
    });
  }

  modalConfirmStudy(modal:any, error:any, allData:any){
    if(this.studyForm.status === 'VALID'){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '230px';
      this.dialog.open(modal, dialogConfig)
    }else{
      if(this.studyForm.status === 'INVALID'){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '400px';
        dialogConfig.height = '230px';
        this.dialog.open(allData, dialogConfig)
      }
    }

  }

  createForm(sameName:any, error:any, allData:any){
    console.log(this.studyForm, this.dataservice.userData);

    if(this.studyForm.status === 'VALID'){
      let data = {
        "estudiesName": this.studyForm.value.studyName,
        "entrega": this.studyForm.value.studyEntrega,
        "tipeStudies": this.studyForm.value.studyType,
        "status": 1,
        "user": {
          "userId" : this.dataservice.userData?.id
        }
      }
      this.dataservice.createStudy(data).then((result:any) => {
        console.log("result:", result);
        if(result && !result.error){
          this.dialog.closeAll();
          location.reload();
        }else if(result.error){
          if(result.error.error.code === 409){
            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = '400px';
            dialogConfig.height = '230px';
            this.dialog.open(sameName, dialogConfig)
          }else{
            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = '400px';
            dialogConfig.height = '230px';
            this.dialog.open(error, dialogConfig)
          }

        }

      })
      this.loading = true;
      this.responseForm = false;
      this.loading = false;
    }else{
      if(this.studyForm.status === 'INVALID'){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '400px';
        dialogConfig.height = '230px';
        this.dialog.open(allData, dialogConfig)
      }else if(this.selectedQuestions.length === 0){
        this.snackBar.open("Debes escoger al menos 1 pregunta", "Error", {duration:3000})
      }
      
    }
  }

  
  logOut(){
    localStorage.removeItem('userData');
    this.router.navigateByUrl("/login");
  }
  
  get questionsFormArray() {
    return this.studyForm.controls.questions as FormArray;
  }
}
