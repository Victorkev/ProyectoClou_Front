import { DataSource } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, EventEmitter, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { DataserviceService } from 'src/app/services/dataservice.service';

@Component({
  selector: 'app-show-surveys',
  templateUrl: './show-surveys.component.html',
  styleUrls: ['./show-surveys.component.css']
})
export class ShowSurveysComponent {
  activeEstudios:boolean = false;
  activeEncuesta:boolean = false;
  activeFiles:boolean = false;
  user:any;
  estudios = new MatTableDataSource<any>();
  survey:any[] = [];
  activateResponse:boolean = false;
  estudioSeleceted:any[] = [];
  displayedColumns: string[] = ['id', 'date', 'tipoEstudio','tipo', 'status','progreso', 'descargar','formulario'];
  encuestasRespondidas:boolean = false;
  responseExist:boolean = false;
  idStudy:any;
  @Output() activateResponseChange = new EventEmitter<boolean>();
  @Output() activeFilesChange = new EventEmitter<boolean>();
  surveySelected:any;
  hideBtn:boolean = false;
  groups:any[] = [];
  allStudy:any;
  fileexist:boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(private dataservice:DataserviceService, private router:Router,private cdr: ChangeDetectorRef, private dialog: MatDialog){}

  async ngOnInit() {
    this.user = this.dataservice.userData;
    console.log("userID", this.user.id);
    await this.dataservice.getClientById(this.dataservice.userData?.personal.empresa.empresaId).then((response: any) => {
      console.log("responseEstudios:", response);
      if (response.length > 0) {
        let activeResponse = response.filter((a: any) => 
          (a.status === 2 || a.status === 3) && 
          Array.isArray(a.personals) && 
          a.personals.length > 0 && 
          a.personals.includes(this.user.personal.presonal_id)
        );
        console.log("active:", activeResponse);
        this.estudios.data = activeResponse.reverse();
         // Verificar si hay respuestas válidas
         this.estudios.data.forEach(async(estudio:any) => {
          let details:any = await this.dataservice.getDetailsFromStudy(estudio.surveys[0].survey_id, this.user.personal.empresa.empresaId,this.user.id);
          estudio.details = details;
          this.fileexist = true;
          let totalPreguntasCount = 0;
          let totalRespuestasCount = 0;

          estudio.details.forEach((detail:any) => {
            detail.groupBeneficios.forEach((group:any) => {
              totalPreguntasCount += group.PreguntasCount;
              totalRespuestasCount += group.RespuestasCount;
            });
          });
      
          estudio.preguntasCount = totalPreguntasCount;
          estudio.respuestasCount = totalRespuestasCount;
         });
      } else {
        this.estudios.data = [];
      }
    });
    this.activeEncuesta = true;
    console.log("estudios:", this.estudios);
  }

  activeElement(type:any){
    if(type==='estudio'){
      this.activeEncuesta = false;
      this.activeEstudios = true;
    }else if(type==='encuesta'){
      this.activeEstudios = false;
    }
  }

ngAfterViewInit() {
  this.estudios.paginator = this.paginator;
}

  getFormatDate(date:any){
    let dateFormat = moment(date).format("DD/MM/YYYY");
    return dateFormat;
  }
    
  logOut(){
    localStorage.removeItem('userData');
    this.router.navigateByUrl("/login");
  }

  selectStudy(estudio:any){
    console.log("estudio", estudio);
    this.idStudy = estudio.id;
    this.activateResponse = true;
    this.activateResponseChange.emit(this.activateResponse);
    this.estudioSeleceted = estudio.surveys;
    this.allStudy = estudio;
  }

    // Método para manejar el cambio de activeResponse
    onActiveResponseChange(newValue: boolean) {
      this.hideBtn = true;
      if(newValue === true){
        this.activateResponse = true;
      }else{
        this.activateResponse = false;
      }
      console.log("newValue:", this.activateResponse);
      this.activateResponseChange.emit(this.activateResponse);

    }

        // Método para manejar el cambio de activeResponse
    onActiveFilesChange(newValue: boolean) {
      this.hideBtn = true;
      this.activeFiles = newValue;
      this.activeFiles = false;
      this.activeFilesChange.emit(this.activeFiles);
      console.log("newValueChange:", newValue);
    }

    sendValuesUpdate(value:any){
      console.log("value padre:", value, this.estudios);
      let selectedValue = this.estudios.data.filter((a:any) => a.id === value.id);
      console.log("value padre2:", selectedValue);
      selectedValue[0].respuestasCount = selectedValue[0].respuestasCount + value.updRespuestas;
      this.cdr.detectChanges();      
    }


    updateFiles(estudios:any){
      console.log("estudios:", estudios);
      this.activeFiles = true;
      this.idStudy = estudios.id;
      this.estudioSeleceted = estudios;
      this.surveySelected = estudios.surveys[0];
      this.activeFilesChange.emit(this.activeFiles);
    }

    modalBlock(modalBlock:any){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '220px';
      this.dialog.open(modalBlock, dialogConfig)
    }

    getProgresoEstudio(estudio: any): number {
      if (!estudio.details || estudio.details.length === 0) return 0;

      let totalGrupos = 0;
      let gruposCompletados = 0;

      estudio.details.forEach((detail: any) => {
        if (detail.groupBeneficios && detail.groupBeneficios.length > 0) {
          totalGrupos += detail.groupBeneficios.length;
          gruposCompletados += detail.groupBeneficios.filter(
            (g: any) => g.RespuestasCount > 0 && g.RespuestasCount >= g.PreguntasCount
          ).length;
        }
      });

      if (totalGrupos === 0) return 0;

      const porcentaje = (gruposCompletados / totalGrupos) * 100;
      return Math.round(porcentaje);
    }

}

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number = 50, ellipsis: boolean = true): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    
    return ellipsis ? value.substring(0, limit) + '...' : value.substring(0, limit);
  }

}
