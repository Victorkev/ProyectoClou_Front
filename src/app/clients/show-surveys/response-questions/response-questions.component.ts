import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataserviceService } from 'src/app/services/dataservice.service';
import { PageEvent } from '@angular/material/paginator';
@Component({
  selector: 'app-response-questions',
  templateUrl: './response-questions.component.html',
  styleUrls: ['./response-questions.component.css'],
})
export class ResponseQuestionsComponent {
  user: any;
  @Input() estudioSelected: any;
  @Input() activeResponse: any;
  @Input() idStudy: any;
  @Input() allStudy: any;
  @Output() activeResponseChange: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() sendValuesUpdate: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  surveyData: any; // Tu data de preguntas
  respuestas: any[] = [];
  arrayAnswer: any[] = [];
  title: any;
  file: any = [];
  activeResponseGroup: boolean = false;
  groups: any[] = [];
  groupDataSurvey: any;
  responseUpload: any;
  selectedFile: File | null = null;
  archivoSelect: boolean = false;
  fileName: any;
  fileNames: any[] = [];
  maxResponse: any;
  actualResponse: number = 0;
  allBenefitGroup: any[] = [];
  selectedOptions: Set<any> = new Set();
  private lastQuestionId: any = null;
  disabled: boolean = true; // Inicialmente el botón está deshabilitado
  otroField: boolean = false;
  editCheckbox: boolean = false;
  currentPage: number = 0;
  pageSize: number = 10; // cantidad de preguntas por página
  boolResponse: boolean = false;

  constructor(
    private dataservice: DataserviceService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit() {
    await this.loadStudyData();
  }

  async loadStudyData() {
    this.file = [];
    this.groups = [];
    this.allBenefitGroup = [];
    this.actualResponse = 0;
    this.maxResponse = 0;
    this.groupDataSurvey = null;

    if (this.allStudy.files === true) {
      this.responseUpload = await this.dataservice.getFileByStudy(this.idStudy);

      this.responseUpload.forEach((file: any) => {
        if (window.location.host != 'localhost:4200') {
          this.file.push({
            name: file.name,
            url: window.location.host + '/api/media/files/' + file.url,
          });
        } else {
          this.file.push({
            name: file.name,
            url: 'http://200.63.98.203:8090/api/media/files/' + file.url,
          });
        }
      });
    }

    this.surveyData = this.estudioSelected;
    this.surveyData.forEach((element: any) => {
      element.newName = this.capitalizarPrimeraLetra(element.name);
    });

    this.user = this.dataservice.userData;

    const details: any = await this.dataservice.getDetailsFromStudy(
      this.surveyData[0].survey_id,
      this.user.personal.empresa.empresaId,
      this.user.id
    );

    this.groups = details.filter((detail: any) => detail !== undefined);

    this.groups.forEach((element) => {
      this.allBenefitGroup = this.allBenefitGroup.concat(
        element.groupBeneficios
      );

      element.groupBeneficios.forEach((group: any) => {
        group.boolResponse = group.aplica === 1;
      });
    });

    this.initializeSurvey();
  }

resetState() {
  // Solo los flags de vista
  this.activeResponseGroup = false;

  // Reseteamos contadores temporales
  this.actualResponse = 0;
  this.maxResponse = 0;

  // Paginación
  this.pageSize = 3;

  // Archivos temporales
  this.file = [];
  this.responseUpload = [];

  // ¡No tocar groupDataSurvey ni arrayAnswer!
  // Así mantenemos los valores ya cargados para que al volver a abrir el grupo se muestren correctamente
}

  initializeSurvey() {
    this.updateButtonState(null);
  }

  updateButtonState(type: any) {
    console.log('llega acá updBtn');
    if (type === null) {
      this.disabled = !this.isFormValid();
      console.log('entra en if:', this.disabled);
    } else {
      this.disabled = false;
    }
  }

  logOut() {
    localStorage.removeItem('userData');
    this.router.navigateByUrl('/login');
  }

  capitalizarPrimeraLetra(texto: string): string {
    if (!texto) return texto;

    const palabras = texto.split(' ');
    const palabrasCapitalizadas = palabras.map((palabra) => {
      if (palabra.length > 0) {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      }
      return palabra;
    });

    return palabrasCapitalizadas.join(' ');
  }

  isFormValid(): boolean {
    if (this.groupDataSurvey !== undefined) {
      for (const pregunta of this.groupDataSurvey.preguntas) {
        if (pregunta.respuetas.length > 0) {
          if (pregunta.seleccionMultiple === true) {
            let txtResponse = pregunta.respuetas.find(
              (a: any) => a.respuestaText
            );

            // Verifica si txtResponse.respuestaText es un array en formato de cadena de texto
            if (
              txtResponse &&
              typeof txtResponse.respuestaText === 'string' &&
              !this.editCheckbox
            ) {
              pregunta.option = [];
              pregunta.option = txtResponse.respuestaText.split(',');
              pregunta.respuesta = txtResponse.respuestaText.split(',');
              if (pregunta.respuesta === 'Otro') {
                // Verificar si otroRespuestaMultiple existe y tiene valor
                if (pregunta.otroRespuestaMultiple) {
                  pregunta.mostrarOtro = true;
                  // Encontrar el índice de otroRespuestaMultiple en opciones
                  const index = pregunta.option.indexOf(
                    pregunta.otroRespuestaMultiple
                  );

                  // Si existe en opciones, reemplazarlo por 'Otro'
                  if (index !== -1) {
                    pregunta.option[index] = 'Otro';
                  }
                }
              }
            }
          } else {
            pregunta.option = [];
            if (pregunta.respuesta === null) {
              let resp = pregunta.respuetas[0].respuestaText;
              pregunta.option = resp;
              pregunta.respuesta = resp;
            } else {
              pregunta.option = pregunta.respuesta;
            }
          }
        }

        // Verificar que si la pregunta tiene looked en true, también tenga respuesta
        if (pregunta.looked && !pregunta.respuesta) {
          return false; // Si alguna pregunta con looked true no tiene respuesta, retornar false
        }
      }

      return true; // Si todas las preguntas cumplen las condiciones, retornar true
    }

    return false; // Si groupDataSurvey está indefinido, retornar false
  }

  checkboxActivate(pregunta: any) {
    console.log('llega:', pregunta);
    return true;
  }

  onFileSelected(event: Event): void {
    console.log('select:', event);
    const input = event.target as HTMLInputElement;
    console.log('Selected file:', input);

    if (input.files && input.files.length > 0) {
      this.archivoSelect = true;
      this.fileNames = []; // Reiniciar el arreglo de nombres de archivos
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.fileNames.push(file);
      }
      // Aquí puedes manejar los archivos seleccionados, por ejemplo, subirlos a un servidor
    }
  }

  // Resto del código
  onSubmit() {
    console.log("datafinal:", this.groupDataSurvey);
    // Recorremos las preguntas y construimos arrayAnswer
    this.arrayAnswer = this.groupDataSurvey.preguntas.map((pregunta: any) => {
      let respuestaFinal: string | null = null;

      if (pregunta.seleccionMultiple) {
        const valoresSeleccionados = Array.isArray(pregunta.respuesta) ? [...pregunta.respuesta] : [];
        if (pregunta.otroRespuestaMultiple) valoresSeleccionados.push(pregunta.otroRespuestaMultiple);
        respuestaFinal = valoresSeleccionados.join(',');
      } else {
        if (pregunta.otroRespuesta && pregunta.otroRespuesta !== '') {
          respuestaFinal = pregunta.otroRespuesta;
        } else if (pregunta.respuesta) {
          respuestaFinal = pregunta.respuesta;
        } else {
          respuestaFinal = null;
        }
      }

      // Guardar directamente en pregunta.respuetas para mantener consistencia
      const data = {
        respuetaId: pregunta.idRespuesta?.respuetaId || null,
        respuestaText: respuestaFinal,
        preguntas: { pregunta_id: pregunta.pregunta_id },
        activeotros: !!(pregunta.otroRespuesta || pregunta.otroRespuestaMultiple),
        survey: { survey_id: this.surveyData[0].survey_id },
        empresa: { empresaId: this.dataservice.userData?.personal.empresa.empresaId },
        user_id: this.user.id,
      };

      pregunta.respuetas = [data]; // reemplazamos la respuesta anterior en memoria
      pregunta.respuesta = respuestaFinal; // importante: mantener en memoria

      return data;
    });

    // Actualizamos RespuestasCount
    this.groupDataSurvey.RespuestasCount = this.arrayAnswer.length;

    // Guardar en backend
    this.dataservice.saveSurveyAll(this.arrayAnswer).then((res: any) => {
      if (res.code === 0) {
        this.activeResponseGroup = false;
        this.activeResponseChange.emit(this.activeResponse);
      }
    });
  }



responseQuestions(group: any) {
  this.groupDataSurvey = group;
  this.activeResponseGroup = true;
  this.maxResponse = group.PreguntasCount;
  this.actualResponse = 0;

  group.preguntas.forEach((pregunta: any) => {
    // Buscar respuesta en arrayAnswer primero
    const foundAnswer = this.arrayAnswer.find(
      (a: any) => a.preguntas.pregunta_id === pregunta.pregunta_id
    );

    if (foundAnswer) {
      this.actualResponse++;
      if (pregunta.seleccionMultiple) {
        // Selección múltiple
        pregunta.respuesta = foundAnswer.respuestaText.split(',').map((r: string) =>
          pregunta.opcion.includes(r) ? r : 'Otro'
        );
        const otro = foundAnswer.respuestaText
          .split(',')
          .filter((r: string) => !pregunta.opcion.includes(r));
        pregunta.mostrarOtro = otro.length > 0;
        pregunta.otroRespuestaMultiple = otro.join(',');
      } else if (pregunta.type === 'MULTIPLE') {
        // Selección simple
        if (!pregunta.opcion.includes(foundAnswer.respuestaText)) {
          pregunta.respuesta = 'Otro';
          pregunta.mostrarOtro = true;
          pregunta.otroRespuesta = foundAnswer.respuestaText;
        } else {
          pregunta.respuesta = foundAnswer.respuestaText;
          pregunta.mostrarOtro = false;
        }
      } else if (pregunta.type === 'SIMPLE') {
        // TEXTO o NUMERICO
        pregunta.respuesta = foundAnswer.respuestaText;
        pregunta.mostrarOtro = false; // no aplica
      }
    } else if (pregunta.respuetas?.length > 0) {
      // Si no hay en arrayAnswer, usamos la respuesta que viene del servicio
      const serviceResp = pregunta.respuetas[0];
      pregunta.respuesta = serviceResp.respuestaText;
      pregunta.mostrarOtro = false;
    } else {
      // No hay respuesta
      pregunta.respuesta = null;
      pregunta.mostrarOtro = false;
    }
  });
}


  async onRespuestaChange(group: any, study: any) {
    const valor = group.aplica;

    console.log('study:::', study);
    const grupoEncontrado = this.groups.find((grupo: any) =>
      grupo.groupBeneficios.some((beneficio: any) => beneficio.id === group.id)
    );

    console.log('grupo enconrtado::', grupoEncontrado);

    // Habilitar el botón solo si la respuesta es "Si"
    group.boolResponse = valor === 1;

    // Si cambia a "No" o "Se está Evaluando"
    if (valor !== 1) {
      // Guarda el valor original solo si no estaba ya guardado
      if (group.previousRespuestasCount == null) {
        group.previousRespuestasCount = group.RespuestasCount;
      }

      // Fuerza el progreso al 100%
      group.RespuestasCount = group.PreguntasCount + 1;
    } else {
      // Si vuelve a "Si", restablece el valor anterior si existía
      if (group.previousRespuestasCount != null) {
        group.RespuestasCount = group.previousRespuestasCount;
        group.previousRespuestasCount = null; // opcional, para limpiar
      } else {
        // Si no tenía valor anterior, se mantiene como está
        group.RespuestasCount = 0;
      }
    }

    let data = {
      idUsuario: this.user.id,
      aplicable: valor,
    };

    let response = await this.dataservice.toggleQuestion(
      study.id,
      group.id,
      data
    );
    console.log(
      `${group.name} → respuesta: ${valor} / progreso: ${
        (group.RespuestasCount / group.PreguntasCount) * 100
      }%`,
      data
    );
  }

  get paginatedPreguntas() {
    if (!this.groupDataSurvey?.preguntas) return [];
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.groupDataSurvey.preguntas.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  nextPage() {
    const totalPages = Math.ceil(
      this.groupDataSurvey.preguntas.length / this.pageSize
    );
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  changeStatus() {
    this.activeResponseGroup = false;
  }

  backToTable() {
    this.activeResponse = false;
    location.reload();
    this.activeResponseChange.emit(this.activeResponse);
  }

  goBack() {
    this.resetForm();
  }

  resetForm() {
    this.lastQuestionId = null;
    this.actualResponse = 0;
    this.selectedOptions.clear();
    console.log('groupArrayData::', this.groupDataSurvey);
    this.groupDataSurvey.preguntas.forEach((pregunta: any) => {
      console.log('dataPREUGNTA:', pregunta);
      if (pregunta.respuetas.length === 0) {
        console.log('entra en if respuetas:', pregunta);
        // Restablece la respuesta según el tipo de pregunta
        if (pregunta.type === 'MULTIPLE') {
          console.log('entra en multiple respuetas:', pregunta);
          pregunta.respuesta = null; // Para preguntas de opción única
          pregunta.respuestas = []; // Para preguntas de opción múltiple
          pregunta.respondido = false;
          pregunta.option = [];
          pregunta.otroRespuesta = ''; // Si existe un campo "Otro"
        } else if (pregunta.type === 'SIMPLE') {
          console.log('entra en simple respuetas:', pregunta);
          pregunta.respuesta = ''; // Para preguntas de texto y numéricas
        }
        console.log('sale de todo respuetas:', pregunta);
      } else {
        let respuestaText = pregunta.respuetas[0].respuestaText;
        console.log('LLEGA A ELSE RESPONSE');
        if (Array.isArray(pregunta.respuesta)) {
          if (!pregunta.respuesta.includes(respuestaText)) {
            pregunta.respondido = false;
            console.log('PONE EN FALSE', pregunta);
          }
        }
      }
    });
    this.activeResponseGroup = false;
  }

  radioChange(pregunta: any, value: any) {
    console.log('PREGUNTA AQUÍ:', pregunta, this.lastQuestionId);
    // Reinicia `mostrarOtro` en todas las preguntas
    //this.groupDataSurvey.preguntas.forEach((p: any) => p.mostrarOtro = false);

    if (value === 'Otro') {
      pregunta.otroRespuesta = '';
      pregunta.mostrarOtro = true;
    } else {
      pregunta.otroRespuesta = null;
      pregunta.mostrarOtro = false;
      console.log('CHECKBOX:', this.selectedOptions.has(value));
      // Verifica si la opción seleccionada ya ha sido registrada
      if (!this.selectedOptions.has(value)) {
        this.selectedOptions.add(value);

        // Comprueba si el ID de la pregunta ha cambiado
        if (this.lastQuestionId !== pregunta.pregunta_id) {
          // Actualiza el contador de respuestas
          this.actualResponse++;

          // Actualiza el ID de la última pregunta procesada
          this.lastQuestionId = pregunta.pregunta_id;
        }

        // Muestra el estado actual de las respuestas
        this.updateButtonState('radio');
      }
      console.log('Contador de respuestas:', this.actualResponse);

      pregunta.option = value;
      // Actualiza la respuesta de la pregunta
      pregunta.respuesta = value;
    }
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isActiveCheckbox(pregunta: any): boolean {
    return pregunta.respuesta && pregunta.respuesta.length > 0;
  }

  checkboxChange(event: any, pregunta: any, option: any) {
    this.editCheckbox = true;
    if (!pregunta.respuesta) {
      pregunta.respuesta = [];
    }
    // Agregar o quitar la opción según el estado del checkbox
    if (event.checked) {
      if (!pregunta.option) {
        pregunta.option = [];
      }
      if (option === 'Otro') {
        pregunta.mostrarOtro = true;
      }
      if (typeof pregunta.respuesta === 'string') {
        pregunta.respuesta = [pregunta.respuesta];
      }
      if (!pregunta.option.includes(option)) {
        pregunta.option.push(option);
      }
      if (!pregunta.respuesta.includes(option)) {
        console.log('llega a IF', pregunta);
        pregunta.respuesta.push(option);
        if (!pregunta.respondido) {
          this.actualResponse++;
          pregunta.respondido = true;
        }
      } else {
        console.log('llega a else', pregunta);
      }
    } else {
      // Si se desmarca una opción
      if (!Array.isArray(pregunta.respuesta)) {
        pregunta.respuesta = [pregunta.respuesta];
      }

      console.log('option:', typeof option, typeof pregunta.respuesta[0]);

      const indexRespuesta = pregunta.respuesta.indexOf(option);
      console.log('dataDelete1:', indexRespuesta);
      if (indexRespuesta > -1) {
        // Eliminar directamente el elemento
        pregunta.respuesta.splice(indexRespuesta, 1);
      }

      const indexOption = pregunta.option.indexOf(option);

      if (indexOption > -1) {
        // Eliminar directamente el elemento
        pregunta.option.splice(indexOption, 1);
        console.log('dataDelete4:', pregunta.respuesta);
      }

      console.log('Updated pregunta:', pregunta);

      if (option === 'Otro') {
        pregunta.mostrarOtro = false;
        pregunta.otroRespuesta = '';
      }

      // Verificar si no quedan respuestas seleccionadas
      if (pregunta.respuesta.length === 0 || pregunta.option.length === 0) {
        pregunta.respuesta = ''; // Asegúrate de que `respuesta` se resetee correctamente
        pregunta.respondido = false;
        this.actualResponse--;
      }

      console.log('Estado final de pregunta:', pregunta);
    }
  }

  keyup(event: any, preguntaId: number) {
    const newValue = event.target.value;
    console.log('Value:', newValue);

    // Encuentra la pregunta actual basada en el ID
    const pregunta = this.groupDataSurvey.preguntas.find(
      (p: any) => p.pregunta_id === preguntaId
    );
    if (pregunta) {
      // Actualiza la respuesta en el objeto de datos
      pregunta.respuesta = newValue;

      // Verifica si el campo está vacío o no
      if (newValue.trim() !== '') {
        // Incrementa el contador si la respuesta no está vacía
        if (!pregunta.hasOwnProperty('respondido') || !pregunta.respondido) {
          this.actualResponse++;
          pregunta.respondido = true;
        }
      } else {
        this.actualResponse--;
        // Disminuye el contador si la respuesta está vacía
        if (pregunta.hasOwnProperty('respondido') && pregunta.respondido) {
          pregunta.respondido = false;
        }
      }

      // Muestra el estado actual de las respuestas
      console.log('Contador de respuestas:', this.actualResponse);

      // Actualiza el estado del botón
      this.updateButtonState(null);
    }
  }
}
