import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { DataserviceService } from 'src/app/services/dataservice.service';
moment.locale('es');

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  @Input() estudioSelected: any;
  @Input() activeFiles: any;
  @Input() idStudy: any;
  @Input() surveySelected: any;
  @Output() activeFilesChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  groups: any[] = [];
  archivoSelect: boolean = false;
  fileNames: any[] = [];
  user: any;
  responseUpload: any;
  file: any[] = [];
  @ViewChild('fileInput', { static: false }) fileInput: any;
  activeStep3: boolean = false;
  dataObservations: any;
  displayedColumns: string[] = ['fecha', 'nombreArchivo', 'estado', 'observaciones'];
  dataSourceObs: any[] = [];
  obsSelected: any;
  selectedFileTmp: any[] = [];
  selectedFile: any;

  async ngOnInit() {
    this.user = this.dataservice.userData;
    console.log("ESTUDIOO:", this.user.id);
    this.responseUpload = await this.dataservice.getFilesByConsolidar(this.idStudy);
    console.log("responseDownload:", this.responseUpload);
    if(!this.responseUpload.error){
      this.responseUpload.forEach((file: any) => {
        this.file.push({ "name": file.name, "url": file.url, "metaDataId": file.metadataId });
      });
      if (this.responseUpload.length > 0) {
        this.groups.push(this.file[0]);
      }
    }else{
      this.file.push({ "name": "", "url": "", "metaDataId": "" });
      this.groups.push(this.file[0]);
      console.log("groups:", this.groups);
    }

    this.dataObservations = await this.dataservice.getDataFiles(this.estudioSelected.id, this.user.id);

    if (this.dataObservations.length > 0) {
      // Primero, aplicar las transformaciones iniciales como antes
      this.dataObservations.forEach((obs: any) => {
        if (obs.obs && obs.obs.length > 0) {
          obs.txtObs = obs.obs[obs.obs.length - 1].obs; // Accede al último elemento del array
        }
        if (obs.createAt) {
          obs.formatDate = moment(obs.createAt).format("DD/MMM/YYYY HH:mm");
        }
      });

      // Crear un mapa para almacenar los registros más recientes basados en metadata
      const latestObservationsMap = new Map<string, any>();

      this.dataObservations.forEach((obs: any) => {
        const metadataValue = obs.metadata; // Cambia esto al nombre exacto de tu campo metadata
        const currentFormatDate = moment(obs.formatDate, "DD/MMM/YYYY HH:mm");

        if (!latestObservationsMap.has(metadataValue)) {
          // Si no existe un registro con el mismo metadata, añadirlo
          latestObservationsMap.set(metadataValue, obs);
        } else {
          // Si ya existe, comparar fechas
          const existingObs = latestObservationsMap.get(metadataValue);
          const existingFormatDate = moment(existingObs.formatDate, "DD/MMM/YYYY HH:mm");

          if (currentFormatDate.isAfter(existingFormatDate)) {
            // Si el actual es más reciente, reemplazar el existente
            latestObservationsMap.set(metadataValue, obs);
          }
        }
      });

      console.log("label:", latestObservationsMap);
      // Convertir el mapa en un array
      this.dataSourceObs = Array.from(latestObservationsMap.values());


      console.log("dataObs2:", this.dataSourceObs);
    }
  }

  constructor(public dataservice: DataserviceService, private dialog: MatDialog) { }

  // Método para verificar si hay coincidencia de metadata
  isFileUploaded(metaDataId: string): boolean {
    return this.dataSourceObs.some(file => file.metadata === metaDataId);
  }

  // Método para verificar si hay coincidencia de metadata
  isFileUploadedValidation(metaDataId: string): string {
    if(this.dataSourceObs.length>0){
      let validation = this.dataSourceObs.find(file => file.metadata === metaDataId);
      let value = "";
      if(validation.status === 1 || validation.status === 0){
        value = "Sin Validar";
      }else if(validation.status === 2){
        value = "Revisar Observaciones";
      }else if(validation.status === 3){
        value = "Formulario Validado";
      }
      return value;
    }else{
      return "Sin Validar"
    }



  }

  selectFile(download: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '230px';
    const dialogRef = this.dialog.open(download, dialogConfig)

    dialogRef.afterClosed().subscribe(result => {
      this.triggerFileInputClick();
    });
  }

  triggerFileInputClick(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event, files: any): void {
    console.log("event:", event, files);
    if (this.dataSourceObs.length > 0) {
      this.dataSourceObs = [];
    }


    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSelect = true;
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.fileNames.push(file);
        console.log("filenames:", this.fileNames);
      }

      this.fileNames.forEach((a: any) => {
        a.metaDataId = files.metaDataId; // Asigna el metaDataId a cada elemento de fileNames
      });

      this.selectedFileTmp = this.fileNames; // Guarda el resultado modificado
      console.log("event:", this.selectedFileTmp);
    }
  }


  downloadFile(file: any) {
    console.log("file:", file);
    if (window.location.host === "localhost:4200" || window.location.host === "200.63.98.203") {
      window.location.href = "http://200.63.98.203:9010/" + file.url;
      //this.reloadPage();
    } else {
      window.location.href = file.url;
    }
  }


  backToTable() {
    this.activeFiles = false;
    this.activeFilesChange.emit(this.activeFiles);
  }

  confirmUpload(modal: any, file: any, modalError:any) {
    this.selectedFileTmp = [];
    console.log("file:", file, this.fileNames);
    if(this.fileNames.length === 0){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '450px';
      dialogConfig.height = '220px';
      this.dialog.open(modalError, dialogConfig)
    }else{
      this.selectedFile = file.metaDataId;
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '230px';
      this.dialog.open(modal, dialogConfig)
    }

  }

  replaceUpload(modal: any, file: any) {
    console.log("file:", file);
    this.selectedFile = file.metaDataId;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '230px';
    this.dialog.open(modal, dialogConfig)
  }


  deleteFile(fileToDelete: { name: string }) {
    this.fileNames = this.fileNames.filter(file => file !== fileToDelete);
    console.log("fileNames:", this.fileNames);
  }

  async changeActiveResponse() {
    console.log("file:", this.fileNames);
    for (let i = 0; i < this.fileNames.length; i++) {
      const file = this.fileNames[i];
      console.log("personal:", this.user);
      let response: any = await this.dataservice.uploadFileClient(this.selectedFile, this.estudioSelected.id, this.user.id, file);
      response.formatDate = moment(response.createAt).format("DD/MMM/YYYY HH:mm");
      if (this.dataSourceObs.length > 0) {
        this.dataSourceObs = [];
      }
      this.dataSourceObs.push(response);
      console.log("response:", response);
    }
    this.activeStep3 = true;
    this.activeFiles = false;
    //this.activeFilesChange.emit(this.activeFiles);
  }

  modalObs(modal: any, element: any) {
    console.log("element:", element, this.dataSourceObs);
    if (element.txtObs === null) {
      element.txtObs = 'En Revisión.'
    }
    this.obsSelected = element;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '800px';
    dialogConfig.height = '500px';
    this.dialog.open(modal, dialogConfig)
  }

  nextStep() {
    this.activeStep3 = true;
  }

  stepBack() {
    this.activeStep3 = false;
  }
}
