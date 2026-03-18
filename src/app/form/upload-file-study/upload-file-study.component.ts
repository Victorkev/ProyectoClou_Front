import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataserviceService } from 'src/app/services/dataservice.service';

@Component({
  selector: 'app-upload-file-study',
  templateUrl: './upload-file-study.component.html',
  styleUrls: ['./upload-file-study.component.css']
})
export class UploadFileStudyComponent {
  @Input() id:any;
  @Input() estudio:any;
  archivoSelect:boolean = false;
  fileNames: any[] = [];
  filesToDelete:any[] = [];

  constructor(private dataservice:DataserviceService, private dialog:MatDialog, private Router: Router){}

  ngOnInit(){
    console.log("id:", this.id);
    if(this.id){
      this.dataservice.getDataFromSurvey(this.id).then((result:any) =>{
        console.log("result:", result);
        if(result.files.length > 0){
          this.archivoSelect = true;
          this.fileNames = result.files;
        }
      })
    }
  }

  onFileSelectedUF(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSelect = true;
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.fileNames.push(file);
      }
    }
  }

  deleteFile(file:any, fileToDelete: { name: string }){
    if(file.id){
      this.filesToDelete.push(file);
      console.log("file:", file);
    }
    this.fileNames = this.fileNames.filter(file => file !== fileToDelete);
  }



  async saveFiles(errorsendfiles: any, success: any) {
    console.log("llega:", this.fileNames, this.filesToDelete);
    if ((this.fileNames && this.fileNames.length > 0) || (this.filesToDelete.length > 0)) {
      try {
        // Ejecuta la subida de archivos
        await Promise.all(this.fileNames.map(async (file) => {
          if (!file) {
            return;
          }
          await this.dataservice.uploadStudy(file, this.estudio.id);
        }));
  
        // Ejecuta la eliminación de archivos
        await Promise.all(this.filesToDelete.map(async (file) => {
          console.log("Eliminando archivo:", file);
          await this.dataservice.deleteFiles(file.id);
        }));
  
        // Si todas las promesas se completaron sin errores, muestra el modal de éxito
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '480px';
        dialogConfig.maxHeight = '220px';
        dialogConfig.height = '100%';
        this.dialog.open(success, dialogConfig);
  
      } catch (error:any) {
        console.log("error2:", error);
        this.dialog.closeAll();
        if (error.status === 401) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '480px';
          dialogConfig.maxHeight = '250px';
          dialogConfig.height = '100%';
          this.dialog.open(errorsendfiles, dialogConfig);
        } else {
          throw error; // Propaga el error para manejo adicional si es necesario
        }
      }
    }
  }

  
  closeData(){
    this.dialog.closeAll();
    location.reload();
  }

  downloadData(){
    if (window.location.hostname !== 'estudios.clouhr.cl') {
      let url = `http://200.63.98.203:9010/${this.fileNames[0].url}`;
      window.location.href = url;
    } else {
      //document.location.href = ":9010/api/metadata/download/" + file.metadataId;
      let url = `https://estudios.clouhr.cl/${this.fileNames[0].url}`;
      window.location.href = url;
    }
  }

}
