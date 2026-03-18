import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataserviceService } from 'src/app/services/dataservice.service';

@Component({
  selector: 'app-dialog-upload-pdf-multiple',
  templateUrl: './dialog-upload-pdf-multiple.component.html',
  styleUrls: ['./dialog-upload-pdf-multiple.component.css']
})
export class DialogUploadPdfMultipleComponent {
  @Input() id: any;
  @Input() estudio: any;
  @Input() type: any;
  @Input() origen:any;
  archivoSelect: boolean = false;
  fileNames: any[] = [];
  historyFiles: any[] = [];

  constructor(private dataservice: DataserviceService, private dialog: MatDialog, private Router: Router) { }
  async ngOnInit() {
    console.log("id:", this.estudio);
    let data:any = null;
    if(this.origen == 'admin'){
      data = await this.dataservice.getPdfFilesMultiple2(this.estudio.id)
      if (data) {
        this.fileNames = data;
        this.historyFiles = data;
        this.archivoSelect = true;
      }
    }else{
      data = await this.dataservice.getPdfFilesMultiple(this.estudio.id)
      if (data) {
        this.fileNames = data;
        this.historyFiles = data;
        this.archivoSelect = true;
      }
    }


    console.log("tiene archivos:", data, this.fileNames);
    /*if(this.id){
      this.dataservice.getDataFromSurvey(this.id).then((result:any) =>{
        console.log("result:", result);
        if(result.files.length > 0){
          this.archivoSelect = true;
          this.fileNames = result.files;
        }
      })
    }*/
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

  deleteFile(fileToDelete: { name: string }) {
    this.fileNames = this.fileNames.filter(file => file !== fileToDelete);
  }


  async saveFiles(errorsendfiles: any, success: any, errorsendfiles2: any) {
    console.log("Initial historyFiles:", this.historyFiles);
    console.log("Initial fileNames:", this.fileNames);

    // Archivos que ya existen en historyFiles y se mantienen en fileNames
    const filesToKeep = this.historyFiles.filter(historyFile =>
      this.fileNames.some((fileName: any) => fileName.id === historyFile.id)
    );

    // Archivos en historyFiles que ya no están en fileNames
    const filesToDelete = this.historyFiles.filter(historyFile =>
      !this.fileNames.some((fileName: any) => fileName.id === historyFile.id)
    );

    // Archivos nuevos en fileNames (sin ID o no presentes en historyFiles)
    const filesToSave = this.fileNames.filter(fileName => {
      // Considera archivos sin ID como nuevos
      if (!fileName.id) return true;
      // Verifica si el archivo con ID ya está en historyFiles
      return !this.historyFiles.some((historyFile: any) => historyFile.id === fileName.id);
    });

    console.log("Files to keep:", filesToKeep);
    console.log("Files to delete:", filesToDelete);
    console.log("Files to save:", filesToSave);

    // Actualiza historyFiles para reflejar los archivos actuales
    this.historyFiles = [...filesToKeep, ...filesToSave];

    // Eliminar archivos que ya no están en fileNames
    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete.map(async (file) => {
        console.log("Deleting file:", file);
        try {
          await this.dataservice.deleteFiles(file.id);
        } catch (error) {
          console.error("Error deleting file:", file, error);
        }
      }));
    } else {
      console.log("No files to delete.");
    }

    // Guardar archivos nuevos en el servicio savePdfFilesMultiple
    if (filesToSave.length > 0) {
      try {
        await Promise.all(filesToSave.map(async (file) => {
          if (!file) return;

          console.log("Saving file:", file);
          const result = await this.dataservice.savePdfFilesMultiple(file, this.estudio.id);

          if (result) {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = '480px';
            dialogConfig.maxHeight = '220px';
            dialogConfig.height = '100%';
            this.dialog.open(success, dialogConfig);
          }
        }));
      } catch (error:any) {
        console.error("Error saving files:", error);
        this.dialog.closeAll();

        if (error.status === 401) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '480px';
          dialogConfig.maxHeight = '250px';
          dialogConfig.height = '100%';
          this.dialog.open(errorsendfiles, dialogConfig);
        } else {
          throw error;
        }
      }
    } else {
      console.log("No new files to save.");
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '480px';
      dialogConfig.maxHeight = '220px';
      dialogConfig.height = '100%';
      this.dialog.open(success, dialogConfig);
    }
  }


  async onFileSelected2(event: any, element: any, modal: any, loading: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '210px';
    this.dialog.open(loading, dialogConfig)
    console.log("event:", event, element);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        let response = await this.dataservice.uploadPdfResumen(element.id, file);
        if (response) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '400px';
          dialogConfig.height = '210px';
          this.dialog.open(modal, dialogConfig)
        }
      }
    }
  }

  showModalError(errStatusData: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '450px';
    dialogConfig.height = '210px';
    this.dialog.open(errStatusData, dialogConfig)
  }

  reloadPage() {
    window.location.reload();
  }


  closeData() {
    this.dialog.closeAll();
    location.reload();
  }

  downloadData(file: any) {
    console.log("filenames:", file);
    if (window.location.hostname !== 'estudios.clouhr.cl') {
      let url = `http://200.63.98.203:9010/${file.url}`;
      window.location.href = url;
    } else {
      //document.location.href = ":9010/api/metadata/download/" + file.metadataId;
      let url = `https://estudios.clouhr.cl/${file.url}`;
      window.location.href = url;
    }
  }


}
