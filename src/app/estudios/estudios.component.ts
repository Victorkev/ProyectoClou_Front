import { ArrayDataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataserviceService } from '../services/dataservice.service';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import html2canvas from 'html2canvas';
import { MatPaginator } from '@angular/material/paginator';
import jsPDF from 'jspdf';


export interface Estudio {
  id: number;
  nombre: string;
  tipo: string;
  fecha: Date;
}


const TREE_DATA: ExampleFlatNode[] = [
  {
    name: 'Quienes Somos',
    expandable: false,
    level: 0,
  },
  {
    name: 'Encuesta',
    expandable: true,
    level: 0,
  },
  {
    name: 'Ver Encuestas',
    expandable: false,
    level: 1,
  },
  {
    name: 'Responder Encuestas',
    expandable: false,
    level: 1,
  },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-estudios',
  templateUrl: './estudios.component.html',
  styleUrls: ['./estudios.component.css']
})

export class EstudiosComponent implements AfterViewInit, OnInit  {
  title = 'clouhr-test';
  showFiller = false;
  dataSourceEstudios = new MatTableDataSource<any>();
  tableAppears: boolean = false;
  tableAppears3: boolean = false;
  tableAppearsIndicadores: boolean = false;
  beneficio: any;
  origen: any;
  antiguedad: any;
  tipoContrato: any;
  tasaUso: any;
  allBeneficios: any[] = [];
  firstLetter: any;
  type: any;
  name: any;
  user: any;
  isLinear = false;
  selectedEstudio: any;
  @ViewChild('miDiv') miDivRef: any = ElementRef;
  displayedColumns: string[] = ['id', 'fecha', 'tipo', 'entrega', 'nombre', 'status', 'acciones', 'descargar'];
  filterValues: { nombre: string, tipo: string, fecha: string } = { nombre: '', tipo: '', fecha: '' };
  filterValues3: { nombre: string, tipo: string, fecha: string } = { nombre: '', tipo: '', fecha: '' };
  columnCargo: any;
  dataSource = new ArrayDataSource(TREE_DATA);
  activeEstudios: boolean = false;
  activeEncuesta: boolean = false;
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  activeAdmin: boolean = false;
  activeResponse = false;
  @ViewChild('stepper') stepper: any = MatStepper;
  @ViewChild(MatSort) sort: any = MatSort;
  filterAreaFuncionalOptions: string[] = [];
  filterCargo: string[] = [];
  filterCargoType: string[] = [];
  jsonFilters: { zona?: string, antiguedad?: string, sindicalizacion?: string } = {};
  // Opciones para el segundo mat-select (cargos)
  cargoOptions: string[] = [];
  cargoOptionsSelected: any = {};

  // Opciones para los filtros
  filterSindicalizacion: string[] = [];
  filterAntiguedadLaboral: string[] = [];
  filterZonaGeografica: string[] = [];

  selectedZonaGeografica: string = '';
  selectedAntiguedadLaboral: string = '';
  selectedSindicalizacion: string = '';
  selectedFilters: { [key: string]: any } = {};
  datacharts: any;
  datachartsBenefit: any;

  filterData: any[] = [];
  // Datos de filtro
  selectedFilter: any = {
    "venta": { /*...*/ },
    "prueba": { /*...*/ },
    "Comercial": { /*...*/ }
  };

  // Almacena el área funcional seleccionada
  selectedArea: string = '';

  // Almacena el cargo seleccionado
  selectedCargo: string = '';

  selectedAreaFuncional: string = '';

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });

  displayedColumns2: string[] = ['Renta Mensual', 'Renta Variable', 'Beneficios Totales', 'Compensacion Total Anual', 'Compensación Total Mensual'];
  dataSource2: any[] = [
    { rowHeader: 'Percentil 10', 'Renta Mensual': '0', 'Renta Variable': '0', 'Beneficios Totales': '0', 'Compensacion Total Anual': '0', 'Compensación Total Mensual': '0' },
    // Inicializa con más datos según sea necesario
  ];

  displayedColumns3: string[] = [];
  dataSource3:any[] = [];

  displayedColumnsOrigen: string[] = ['beneficioEmpresa', 'instrumentosColectivos',];
  datosOrigen = [
    { beneficioEmpresa: '', instrumentosColectivos: '' }
    // Agrega más objetos según sea necesario
  ];

  displayedColumnsAntiguedad: string[] = ['menos2Años', 'entre2y5', 'entre5y10', 'masde10'];
  datosAntiguedad = [
    { menos2Años: '', entre2y5: '', entre5y10: '', masde10: '' }
    // Agrega más objetos según sea necesario
  ];

  displayedColumnsTipo: string[] = ['no', 'indefinido'];
  datosTipo = [
    { no: '', indefinido: '' }
    // Agrega más objetos según sea necesario
  ];

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  dataCargo: any;
  filterDataBenefits: any;
  filterDataIndicadores: any;

  isAllZero = {
    Promedio: false,
    Percentil10: false,
    Percentil90: false,
    Moda: false
  };

  currentSlide = 0;
  currentSlide2 = 0;
  currentSlide3 = 0;
  selectedBeneficio: string | null = null;
  // Los valores seleccionados de cada filtro en filterDataBenefits
  filterSelections: { [key: string]: string | null } = {};

  dataSourceIndicadores: any[] = []; // Array vacío al inicio
  displayedColumnsIndicadores: any;

  estudioSelected: any;

  dataSourceEdadAntiguedad: any = [];
  displayedColumnsEdadAntiguedad: string[] = ['label', 'promedio'];

  prescenciaBeneficio: any[] = [];
  prescenciaColumns: string[] = ['prescencia'];
  presenceVariable: boolean = false;

  //VARIABLES DINAMICAS BENEFICIOS
  structureHtml:any;
  activePorcentil:any;
  activeAntiguedad:any;
  activeCambiosBeneficios:any;
  activeRequisitosBeneficios:any;
  activeRequisitosContrato:any;
  activeBeneficioImpacto:any;
  activeTasaImpactoMarca:any;
  activeBeneficioUso:any;
  activeTasaImpactoOrg:any;
  activeRequisitosAnt:any;
  activeOtrosRequisitos:any;
  @ViewChild('dialogWelcome', { static: true }) dialogWelcome!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginatorEstudios') paginatorEstudios!: MatPaginator;
  isMobile = window.innerWidth <= 1024;
  alldata:any;

    pdfChartsList = [
    { id: 'myChartC', labelId: 'customLabelsC' },
    { id: 'myChartImpact2Uso', labelId: 'customLabelsImpact2Uso' },
    { id: 'myChartImpact1', labelId: 'customLabelsImpact1' },
    { id: 'myChartImpact2', labelId: 'customLabelsImpact2' },
    { id: 'myChartD', labelId: 'customLabelsD' },
    { id: 'myChartE', labelId: 'customLabelsE' },
    { id: 'myChartF', labelId: 'customLabelsF' },
    { id: 'myChartG', labelId: 'customLabelsG' },
    { id: 'myChartH', labelId: 'customLabelsH' },
    { id: 'myChartI', labelId: 'customLabelsI' }
  ];

  loadingbool: boolean = false;
  alldataBenefits: any;

  constructor(private changeDetector: ChangeDetectorRef, private _formBuilder: FormBuilder, private dialog: MatDialog, private router: Router, private snackBar: MatSnackBar, private dataservice: DataserviceService) {
    Chart.register(ChartDataLabels);
  }

  ngOnInit() {
    this.user = this.dataservice.userData;
    console.log("USER:", this.user);

    if(this.user.firstLogin === false){
      this.abrirDialog();
    } 

    this.loadData();

    this.firstLetter = this.user.personal.nombre[0];
    this.name = this.user.personal.nombre.charAt(0).toUpperCase() + this.user.personal.nombre.slice(1);
    this.type = this.user.role[0].roleName;
    this.user.role.forEach((role: any) => {
      if (role.roleName === 'ADMIN') {
        this.activeAdmin = true;
      }
    });
  }

  ngAfterViewChecked() {
    if (this.dataSourceEstudios && this.paginatorEstudios && !this.dataSourceEstudios.paginator) {
      this.dataSourceEstudios.paginator = this.paginatorEstudios;
    }
  }

  ngAfterViewInit() {
    const slides = document.querySelectorAll('#carousel2-desktop .carousel-item');
    if (slides.length > 0) {
      slides.forEach(slide => slide.classList.remove('active'));
      slides[0].classList.add('active');
    }
    this.dataSourceEstudios.paginator = this.paginatorEstudios;
  }

    async loadData() {
    await this.dataservice.getEstudies().then((result: any) => {
      const resp = result.reverse();
      const estudiosFiltrados: any[] = [];

      resp.forEach((element: any) => {
        if (element.status === 4 && element.personals.includes(this.user.personal.presonal_id)) {
          element.fechaPublication = moment(element.end).format("DD/MM/YYYY");
          element.year = moment(element.create).format("YYYY");
          estudiosFiltrados.push(element);

          if (this.user.personal.tipoPersonal === "Consultor") {
            this.activeEstudios = true;
            this.activeElement('estudio');
          } else {
            this.activeElement('encuesta');
            this.activeEncuesta = true;
          }
        } else if (
          this.user.personal.tipoPersonal === "Editor" ||
          this.user.personal.tipoPersonal === 'Administrador' ||
          this.user.personal.tipoPersonal === 'Admin'
        ) {
          this.activeElement('encuesta');
          this.activeEncuesta = true;
        }
      });

      this.dataSourceEstudios.data = estudiosFiltrados;
    });
    console.log("datasourceEstudiosAQUII", this.dataSourceEstudios, this.paginatorEstudios);
      // 🔥 Reasignar paginador después de asignar los datos
      this.dataSourceEstudios.paginator = this.paginatorEstudios;
  }

  abrirDialog(): void {
    this.dialog.open(this.dialogWelcome, {
      panelClass: 'dialog-with-blue-bg'
    });
  }

  closeModal(){
    this.dialog.closeAll();
  }


  showSlide(index: number) {
    const slides = document.getElementsByClassName('slides')[0] as HTMLElement;
    const totalSlides = slides.children.length;

    if (index >= totalSlides) {
      this.currentSlide = 0;
    } else if (index < 0) {
      this.currentSlide = totalSlides - 1;
    } else {
      this.currentSlide = index;
    }
    slides.style.transform = `translateX(${-this.currentSlide * 100}%)`;
  }

  showSlide2(index: number) {
    // Selecciona el contenedor que envuelve todos los slides
    const slidesContainer = document.querySelector('#carousel2-desktop .carousel-inner') as HTMLElement;

    if (!slidesContainer) return;

    const totalSlides = slidesContainer.children.length;

    // Normaliza índice para ciclo infinito
    if (index >= totalSlides) {
      this.currentSlide2 = 0;
    } else if (index < 0) {
      this.currentSlide2 = totalSlides - 1;
    } else {
      this.currentSlide2 = index;
    }

    // Desplaza el contenedor con translateX
    // Para mostrar el slide correcto, se mueve el ancho total * índice negativo

    // Aquí asumimos que cada slide tiene ancho 100% del contenedor visible
    slidesContainer.style.transform = `translateX(${-this.currentSlide2 * 100}%)`;
    slidesContainer.style.transition = 'transform 0.5s ease'; // animación suave
  }


  // Método principal para mostrar un slide específico
  showSlide3(index: number) {
    const slides = document.getElementsByClassName('slides3')[0] as HTMLElement;
    const totalSlides = slides.children.length;

    if (index >= totalSlides) {
      this.currentSlide3 = 0;
    } else if (index < 0) {
      this.currentSlide3 = totalSlides - 1;
    } else {
      this.currentSlide3 = index;
    }
    slides.style.transform = `translateX(${-this.currentSlide3 * 100}%)`;
  }

  prevSlide() {
    this.showSlide(this.currentSlide - 1);
  }

  nextSlide() {
    this.showSlide(this.currentSlide + 1);
  }


  nextSlide2() {
    this.showSlide2(this.currentSlide2 + 1);
  }

  prevSlide2() {
    this.showSlide2(this.currentSlide2 - 1);
  }

  prevSlide3() {
    this.showSlide3(this.currentSlide3 - 1);
  }

  nextSlide3() {
    this.showSlide3(this.currentSlide3 + 1);
  }

  updateSlidePosition() {
    if (window.innerWidth > 1024) return; // no hacer nada en desktop
    const slidesEl = document.querySelector('.slides3') as HTMLElement;
    if (slidesEl) {
      slidesEl.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }
  }

  getParentNode(node: ExampleFlatNode) {
    const nodeIndex = TREE_DATA.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (TREE_DATA[i].level === node.level - 1) {
        return TREE_DATA[i];
      }
    }

    return null;
  }

  blockedEstudio() {
    this.snackBar.open("Debes suscribirte para poder descargar el archivo", "ERROR", { duration: 3000 });
  }

  shouldRender(node: ExampleFlatNode) {
    let parent = this.getParentNode(node);
    while (parent) {
      if (!parent.isExpanded) {
        return false;
      }
      parent = this.getParentNode(parent);
    }
    return true;
  }

  onStepChange(event: any) {
    if (event.selectedIndex === 0) {
      this.tableAppears = false;
      this.tableAppears3 = false;
    }
  }

  getTiposUnicos(): string[] {
    return Array.from(new Set(this.dataSourceEstudios.data.map(estudio => estudio.tipo)));
  }

  activeElement(type: any) {
    if (type === 'estudio') {
      if(this.activeEstudios === true){
        this.cleanVariables();
        //this.stepper.previous();
      }else{
        this.activeEncuesta = false;
        this.activeEstudios = true;
      }

    } else if (type === 'encuesta') {
      this.activeEstudios = false;
      this.activeEncuesta = true;
    }
  }

  downloadExcel(estudio: any) {
    if (window.location.host === "localhost:4200" || window.location.host === "200.63.98.203") {
      window.location.href = "http://200.63.98.203:9010/" + estudio.urlFile;
      //this.reloadPage();
    } else {
      window.location.href = estudio.urlFile;
    }
    // console.log("estudio:", estudio);
    /*if(estudio.tipo === 'Compensacion'){
      // Crear un objeto Blob vacío
      const blob = new Blob([""], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      // Crear un enlace para la descarga
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Asignar nombre al archivo
      link.download = 'archivo.xlsx';

      // Simular clic en el enlace para iniciar la descarga
      link.click();
    }else{*/
    // window.location.href = window.location.origin + "/api/media/files/" + estudio.urlFile;
    // }
  }

  onActivateResponseChange(activateResponse: boolean) {
    console.log("SE ACTUALIZA VALOR RESPONSE:::", activateResponse);
    if (activateResponse == false) {
      this.activeResponse = activateResponse;
    } else {
      this.activeResponse = activateResponse;
      this.activeEncuesta = true;
    }


    //console.log("responseALL:", activateResponse);
  }

  getNodeLink(node: any): string {
    if (node.name === 'Quienes Somos') {
      return 'https://www.clouhr.cl/#quienessomos';
    } else if (node.name === 'Responder Encuestas') {
      return '/client/response';
    }
    // Si hay otros tipos de nodos, puedes manejarlos aquí
    return '#'; // o cualquier otra URL por defecto
  }

  getNodeIcon(node: any): string {
    if (node.name === 'Quienes Somos') {
      return 'apartment';
    } else if (node.name === 'Responder Encuestas') {
      return 'icono-responder';
    }
    // Si hay otros tipos de nodos, puedes manejarlos aquí
    return 'icono-por-defecto'; // o cualquier otro icono por defecto
  }

  stepGo() {
    if (this.selectedEstudio.tipeStudies === 'Compensacion' || this.selectedEstudio.tipeStudies === 'compensacion') {
      this.tableAppears = true;
    } else {
      if (this.allBeneficios.length > 0) {
        this.tableAppears3 = true;
      } else {
        this.snackBar.open("Debes seleccionar todos los campos", "ERROR", { duration: 3000 })
      }
    }
  }

  getFormatDate(date: any) {
    let formatDate = moment(date).format("DD/MM/YYYY");
  }

  cleanVariables(){
    // Vaciar la selección de Beneficios
    this.selectedFilters = []
    this.selectedBeneficio = "";
    this.selectedArea = "";
    this.tableAppears3 = false;
    if(this.filterDataBenefits && this.filterDataBenefits.length > 0){
    // Vaciar las selecciones de los filtros en filterDataBenefits
      this.filterDataBenefits = [];
    }
    this.selectedZonaGeografica = "";
    this.selectedAntiguedadLaboral = "";
    this.selectedSindicalizacion = "";
    this.selectedAreaFuncional = "";
    this.selectedCargo = "";
    this.filterData = [];
    this.tableAppears3 = false;
    this.tableAppears = false;
    this.selectedFilter = [];
    this.filterAreaFuncionalOptions = [];
    this.cargoOptions = [];
    this.filterCargoType = [];
    this.cargoOptionsSelected = [];
    this.filterData = [];
    this.selectedArea = "",
    this.selectedFilters = []
  }

  stepBack() {
    this.selectedZonaGeografica = "";
    this.selectedAntiguedadLaboral = "";
    this.selectedSindicalizacion = "";
    this.selectedAreaFuncional = "";
    this.selectedCargo = "";
    this.filterData = [];
    this.tableAppears3 = false;
    this.tableAppears = false;
    this.selectedFilter = [];
    this.filterAreaFuncionalOptions = [];
    this.cargoOptions = [];
    this.filterCargoType = [];
    this.cargoOptionsSelected = [];
    this.filterData = [];
    this.selectedArea = "",
    this.selectedFilters = []
    this.stepper.previous();
  }

  stepBack2() {
    // Vaciar la selección de Beneficios
    this.selectedFilters = []
    this.selectedBeneficio = "";
    this.selectedArea = "";
    this.tableAppears3 = false;
    if(this.filterDataBenefits && this.filterDataBenefits.length > 0){
    // Vaciar las selecciones de los filtros en filterDataBenefits
      this.filterDataBenefits = [];
    }
    

    this.stepper.previous();
  }

  selectEstudio(estudio: any) {
    this.selectedEstudio = estudio;
    this.dataservice.getFiltersByStudy(estudio.id).then((result: any) => {
      this.selectedFilter = result;
      if (estudio.tipeStudies === 'Indicadores') {
        // Buscar el objeto con la clave 'filtro_principal'
        const filtroPrincipal = this.selectedFilter.find((filter: any) => Object.keys(filter)[0] === 'filtro_principal');
        const filtros = this.selectedFilter.filter((filter: any) => Object.keys(filter)[0] !== 'filtro_principal');

        if (filtroPrincipal) {
          // Obtener los valores dentro de 'filtro_principal' y formatearlos
          this.filterAreaFuncionalOptions = filtroPrincipal.filtro_principal[0]
            .replace(/[\[\]]/g, '')  // Eliminar los corchetes
            .split(',')  // Separar por comas
            .map((item: string) => this.formatText(item.trim()));  // Formatear y limpiar el texto
        }

        // Transformar los filtros para que tengan el formato adecuado
        this.filterDataIndicadores = filtros.map((filter: any) => {
          const key = Object.keys(filter)[0];  // Obtener la clave, como 'filtro_Industria'
          const nombre = key.replace('filtro_', '');  // Remover el prefijo 'filtro_'
          return {
            nombre: this.formatText(nombre),  // Formatear el nombre para que se vea legible
            opciones: filter[key]  // Obtener las opciones correspondientes
          };
        });
      } else {
        // Obtener los nombres de los puestos en "Comercial"
        this.filterAreaFuncionalOptions = Object.keys(this.selectedFilter);
      }

      this.stepper.next();
    })
  }

  // Función para formatear textos pegados, separando palabras por espacios
  formatText(text: string): string {
    // Añadir un espacio entre letras minúsculas y mayúsculas
    return text.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  onAreaFuncionalChange(area: string) {
    this.selectedArea = area;
    if (this.selectedFilter && this.selectedFilter[area]) {
      // Obtener los nombres de los cargos dentro del área funcional seleccionada
      this.cargoOptionsSelected = this.selectedFilter[area];
      this.cargoOptions = Object.keys(this.cargoOptionsSelected);
    } else {
      // Si no hay datos para el área seleccionada, limpiar las opciones de cargo
      this.cargoOptions = [];
      // Limpiar los filtros cuando se cambia el área funcional
      this.filterSindicalizacion = [];
      this.filterAntiguedadLaboral = [];
      this.filterZonaGeografica = [];
    }
    // Establecer "TODOS" como valor seleccionado en los selectores
    this.selectedZonaGeografica = 'Todos';
    this.selectedAntiguedadLaboral = 'Todos';
    this.selectedSindicalizacion = 'Todos';
  }

  onBeneficioSelect(beneficio: string) {
    this.selectedArea = beneficio;
    this.selectedBeneficio = beneficio;

    console.log("ORDEN:", this.selectedFilter)

    // Crear un arreglo que incluya solo la última parte del nombre del filtro y sus opciones
    let filtrosArray = Object.keys(this.selectedFilter[beneficio]).map(filtro => ({
      nombreReal: filtro,
      nombre: filtro.split('_').slice(1).join(' '),  // Extraer la parte después del "_"
      opciones: this.selectedFilter[beneficio][filtro]  // Guardar las opciones del filtro
    }));

    // Filtrar para eliminar el filtro "Beneficio"
    filtrosArray = filtrosArray.filter(filtro => filtro.nombre.toLowerCase() !== 'beneficio');

    this.filterDataBenefits = filtrosArray;

   

    this.filterDataBenefits.forEach((filtro: any) => {
  
      // Encuentra la opción "Total", "total" o "TOTAL" según cómo esté definida en las opciones del filtro
      const opcionTotal = filtro.opciones.find(
        (opcion: string) => (opcion.toLowerCase() === 'total' || opcion.toLowerCase() === 'todos')
      );
      console.log("BENEFICIOS:", opcionTotal);
      // Si existe alguna variante de "Total", selecciónala tal cual en filterSelections
      if (opcionTotal) {
        this.filterSelections[filtro.nombre] = opcionTotal;
        this.selectedFilters[filtro.nombre] = opcionTotal;
      }
    });
  }

  cleanFilters() {
    console.log("ENTRA EN CLEANFILTERS", this.filterData, this.selectedFilter);
    this.selectedZonaGeografica = "";
    this.selectedAntiguedadLaboral = "";
    this.selectedSindicalizacion = "";
    this.selectedAreaFuncional = "";
    this.selectedCargo = "";
    this.filterData = [];
    //this.selectedEstudio = {};
    this.selectedFilters = {};
    this.selectedCargo = ""; 
    this.tableAppears = false;
  }

  cleanFiltersBenefit() {
    // Vaciar la selección de Beneficios
    this.selectedBeneficio = "";
    this.selectedArea = "";
    this.tableAppears3 = false;
    // Vaciar las selecciones de los filtros en filterDataBenefits
    this.filterDataBenefits.forEach((filter: any) => {
      this.filterSelections[filter.nombre] = null;
    });

  }

  // Llama a esta función cuando se selecciona un cargo
  onCargoChange(cargo: string) {
    this.selectedCargo = cargo;

    // Crear un arreglo que incluya solo la última parte del nombre del filtro y sus opciones
    let filtrosArray = Object.keys(this.cargoOptionsSelected[cargo]).map(filtro => ({
      nombreReal: filtro,
      nombre: filtro.split('_').slice(1).join(' '),  // Extraer la parte después del "_"
      opciones: this.cargoOptionsSelected[cargo][filtro]  // Guardar las opciones del filtro
    }));

    // Filtrar para eliminar el filtro "Tipo de Cargo"
    filtrosArray = filtrosArray.filter(filtro => filtro.nombre.toLowerCase() !== 'tipo de cargo' && filtro.nombre.toLowerCase() !== 'area funcional');

    this.filterData = filtrosArray;

    // Lógica para asignar 'todos' como valor por defecto a cada filtro
    filtrosArray.forEach(filtro => {
      // Inicializa el valor del filtro con 'todos' en selectedFilters
      this.selectedFilters[filtro.nombre] = 'Todos';  // Aquí aseguramos que el valor predeterminado sea 'Todos'
    });

    const area = this.selectedArea;
    if (area && this.cargoOptionsSelected[cargo]) {
      const cargoData = this.cargoOptionsSelected[cargo];

    } else {
      // Si no hay datos para el cargo seleccionado, limpiar los filtros
      this.filterData = [];
    }
  }

  onTypeSelectFilter(filtroNombre: string, valorSeleccionado: any) {
    this.selectedFilters[filtroNombre] = valorSeleccionado;
  }

  onTypeSelectFilter2(filtroNombre: string, valorSeleccionado: any) {
    this.selectedFilters[filtroNombre] = valorSeleccionado;
  }

  async getDescriptionBenefits(){
      this.dataservice.getDescriptionBenefits(this.selectedBeneficio).then((result: any) => {
        if (result.code === 200) {
          this.dataCargo = result;
        } else {
          this.dataCargo = { code: "403", message: "Sin Información." }
        }
      });
      
  }

  private processStructureItem(
    name: string,
    regex: RegExp,
    result: any,
    sortBy: 'value' | 'label' = 'value',
    order: 'asc' | 'desc' = 'desc'
  ) {
    const structureItem = this.structureHtml.find((item: any) => item.name === name);
    if (!structureItem) return [];

    const resultKeys = Object.keys(result);

    const filledArray = structureItem.html
      .filter((item: any) => resultKeys.includes(item.value))
      .map((matchingItem: any) => {
        const key = matchingItem.value;
        const value = result[key];
        const labelMatch = key.match(regex);
        const label = labelMatch ? labelMatch[1].replace(/_/g, ' ') : '';
        return { key, value, label };
      })
      .sort((a: any, b: any) => {
        const cmp = a[sortBy].localeCompare(b[sortBy]);
        return order === 'asc' ? cmp : -cmp;
      });

    return filledArray;
  }


  async processInformation() {
    this.dataSource2 = [];
    this.datachartsBenefit = [];
    this.dataSource3 = [];
    this.dataSourceIndicadores = [];
    this.tableAppears = false;
    this.tableAppearsIndicadores = false;
    this.tableAppears3 = false;

    if (this.selectedEstudio.tipeStudies === 'Compensacion' || this.selectedEstudio.tipeStudies === 'compensacion') {
      this.dataCargo = await this.dataservice.getCargos(this.selectedEstudio.id, this.selectedCargo);
      this.structureHtml = await this.dataservice.getHtmlFormat(this.selectedEstudio.id);

        console.log("ESTRUCUTRA HTML::", this.structureHtml);
      
      await this.dataservice.getDataFromFilters(
        this.selectedEstudio.id,
        this.selectedArea,
        this.selectedCargo,
        this.selectedFilters
      ).then((result: any) => {
        console.log("base:", result);
        this.alldata = result;
        const observaciones = parseFloat(result[0].Otros_Datos_Observaciones);

          // Convertir a entero
          const observacionesEntero = Math.floor(observaciones); // Si prefieres redondear, puedes usar parseInt(observaciones);

          // Formatear con separador de miles
          const observacionesFormateado = observacionesEntero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

          this.datacharts = {
            "genero": 0,
            "nacional": 0,
            "observaciones": observacionesFormateado
          }

             //ANTIGUEDAD
        const activeGenero= this.structureHtml.find((item: any) => item.name === "PIE_Compensacion_Genero");
        const resultKeysGenero = Object.keys(result[0]); // Obtener las claves de result[0]

        // Crear un nuevo array para almacenar las coincidencias con la clave y su valor
        const filledArrayGenero = activeGenero.html
        .filter((item: any) => resultKeysGenero.includes(item.value)) // Filtrar las claves coincidentes
        .map((matchingItem: any) => {
          const key = matchingItem.value; // La clave encontrada
          const value = result[0][key]; // El valor correspondiente de result[0]

          // Extraer el texto después de "Antigüedad_del_Beneficio_"
          const labelMatch = key.match(/^Otros_Datos_(.+)$/);
          const label = labelMatch ? labelMatch[1].replace(/_/g, " ") : "";

          return {
            key,
            value,
            label // Añadir el label extraído
          };
        });

        // Rellenamos activeAntiguedad con el nuevo array
        this.datacharts.genero = filledArrayGenero;


        //NACIONALIDAD
        const activeNacionalidad = this.structureHtml.find((item: any) => item.name === "PIE_Compensacion_Nacionalidad");
        const resultKeysNac = Object.keys(result[0]); // Obtener las claves de result[0]

        // Crear un nuevo array para almacenar las coincidencias con la clave y su valor
        const filledArray = activeNacionalidad.html
        .filter((item: any) => resultKeysNac.includes(item.value)) // Filtrar las claves coincidentes
        .map((matchingItem: any) => {
          const key = matchingItem.value; // La clave encontrada
          const value = result[0][key]; // El valor correspondiente de result[0]

          // Extraer el texto después de "Antigüedad_del_Beneficio_"
          const labelMatch = key.match(/^Otros_Datos_(.+)$/);
          const label = labelMatch ? labelMatch[1].replace(/_/g, " ") : "";

          return {
            key,
            value,
            label // Añadir el label extraído
          };
        });

        // Rellenamos activeAntiguedad con el nuevo array
        this.datacharts.nacional = filledArray;

        console.log("dataCHARTS:", this.datacharts);




        const tablaPorcentil = this.structureHtml.find((item: any) => item.name === "TABLA_Compensacion");
      

        if (tablaPorcentil) {
          const keysToFind = tablaPorcentil.html.map((htmlItem: any) => {
            const key = htmlItem.value.toLowerCase();
            // Solo reemplazar si la clave contiene "porcentil_"
            return key.includes("porcentil_") ? key.replace("porcentil_", "percentil_") : key;
          });

          const keysToFindNormalized = keysToFind.map((k:any) => k.toLowerCase().replace(/\s+/g, "_"));

          const filteredKeys = Object.keys(result[0]).filter(key => {
            const keyNormalized = key.toLowerCase().replace(/\s+/g, "_");
            return keysToFindNormalized.some((k:any) => keyNormalized.includes(k));
          });

         // Función para transformar las claves
          const formatKey = (key: string) => {
            let keyFormat;

            // Verifica si la clave comienza con "Promedio"
            if (key.toLowerCase().startsWith("promedio") || key.toLowerCase().startsWith("mediana") || key.toLowerCase().startsWith("moda")) {
              keyFormat = key.split("_").slice(1).join(" ");
            } else {
              keyFormat = key.split("_").slice(2).join(" ");
            }
            return keyFormat; // Retorna la clave formateada
          };

          // Función para agrupar por prefijo y dar formato final
          const transformData = (keys: string[], result: any) => {
            return keys.reduce((acc, key) => {
              let [grupo1, grupo2] = key.split("_").slice(0, 2); // Extrae los dos primeros segmentos
              let groupKey;
              let labelKey;

              if (key.toLowerCase().startsWith("promedio") || key.toLowerCase().startsWith("mediana") || key.toLowerCase().startsWith("moda")) {
                  groupKey = `${grupo1}`;
                  labelKey = `${grupo1}`.replace("_", " "); // Formatea el nombre del grupo
              }else{
                  groupKey = `${grupo1}_${grupo2}`;
                  labelKey = `${grupo1} ${grupo2}`.replace("_", " "); // Formatea el nombre del grupo
              }

              console.log("labelKEY:", groupKey);

              if (!acc[groupKey]) {
                acc[groupKey] = { key: labelKey, values: [] };
              }

              acc[groupKey].values.push({
                label: formatKey(key), // Formatea el nombre eliminando el prefijo
                origen: key,
                value: result[0][key] || null // Busca el valor en result[0]
              });

              return acc;
            }, {} as Record<string, { key: string, values: { label: string, origen: string, value: any }[] }>);
          };

          // Generar el JSON transformado
          const formattedData = transformData(filteredKeys, result);    

          console.log("formattedData:", formattedData);

          // Convertir JSON a formato de tabla
          const transformToTable = (data: any) => {
            const tableData: any[] = [];
            const columnLabels = new Set<string>();

            // Construir filas
            Object.values(data).forEach((group: any) => {
              const row: any = { rowHeader: group.key }; // La primera columna es el "key"
              group.values.forEach((item: any) => {
                row[item.label] = item.value; // Agregar los valores con su label como clave
                columnLabels.add(item.label);
              });
              tableData.push(row);
            });

            return { tableData, displayedColumns: Array.from(columnLabels) };
          };

          // Obtener los datos para la tabla
          const { tableData, displayedColumns } = transformToTable(formattedData);

          // Asignar datos a las variables del componente
          this.dataSource2 = tableData;
          this.displayedColumns2 = displayedColumns;

        }

        
      
        this.dataSourceEdadAntiguedad = [
          { label: 'Edad', value: parseFloat(result[0].Otros_Datos_Edad_Promedio).toFixed(0) },
          { label: 'Antigüedad Empresa', value: parseFloat(result[0].Otros_Datos_Ant_Empresa).toFixed(0) }
        ]

        this.filterRows();
      });

      
      this.tableAppears = true;
      this.changeDetector.detectChanges();  // Detecta cambios en el DOM

      const canvas = document.getElementById('myChart') as HTMLCanvasElement; // Asegurarse de que es un elemento canvas
        if (canvas) {
          const ctx2: any = canvas.getContext('2d');

          if (ctx2) {
            const values: any = this.datacharts.genero.map((item: any) =>
              item.value === 'N/A' || item.value === 'NA'
                ? 'N/A'
                : item.value === 0.0
                ? 0
                : Number(parseFloat(item.value))
            );


            const total: any = values.reduce((sum: any, currentValue: any) => sum + currentValue, 0);

            const percentages: any = values.map((value: any) =>
              typeof value === 'string' ? 'N/A' : value === 0 ? 0 : ((value / total) * 100).toFixed(0)
            );
                       // const labels: any = this.datacharts.genero.map((item: any) => item.label);
             // ✅ Ahora sí puedes usar percentages aquí
            const labels = this.datacharts.genero.map((item: any, index: number) => {
              const value = values[index];
              const percent = percentages[index];
              return value === 0 ? `${item.label}: 0%` : item.label;
            });

            const colorHierarchy = [
              'rgb(53, 114, 184)', // azul para mayor valor
              'rgb(62, 170, 61)',  // verde para el otro valor
            ];

            // Ordenar valores con índice para asignar colores
            const sorted = values
            .map((value:any, index:any) => ({
              value,
              percentage: percentages[index],
              label: labels[index],
              index
            }))
            .sort((a:any, b:any) => b.value - a.value); // orden descendente

            const colorByIndex = new Array(values.length).fill('#ccc');
            sorted.forEach((item: any, i: any) => {
              colorByIndex[item.index] = colorHierarchy[i] || '#ccc';
            });

            // Filtrar valores válidos (no 'N/A')
            const filteredPercentages = percentages.filter((v: any) => v !== 'N/A');
            const filteredColors = colorByIndex.filter((_: any, i: any) => percentages[i] !== 'N/A');
            const filteredLabels = labels.filter((_: any, i: any) => percentages[i] !== 'N/A');

          const labelsContainer: any = document.getElementById('customLabels1');
          const sortedFiltered = sorted
            .sort((a: any, b: any) => b.value - a.value);

          labelsContainer.innerHTML = sortedFiltered.map((item: any) => `
            <div style="display:flex; align-items:center; margin: 5px 0;">
              <span style="display:inline-block; width:16px; height:16px; background:${colorByIndex[item.index]}; border-radius:50%; margin-right:8px;"></span>
              <span>${item.label}</span>
            </div>
          `).join('');

          // 📌 Cambiar entre flex y grid según la cantidad
          const itemCount = labels.length;
          labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

          if (itemCount > 2 && itemCount <= 6) {
            labelsContainer.classList.add('grid-2-cols');
          } else if (itemCount > 6) {
            labelsContainer.classList.add('grid-3-cols');
          } else {
            // Por defecto flex normal
          }

          const myChart = new Chart(ctx2, {
              type: 'doughnut',
              data: {
                labels: filteredLabels,
                datasets: [
                  {
                    data: filteredPercentages,
                    backgroundColor: filteredColors,
                    borderWidth: 0,
                  }
                ]
              },
              options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                  datalabels: {
                    formatter: (value: any) => {
                      return parseFloat(value) === 0 ? null : `${value} %`;
                    },
                    color: '#ffffff',
                    font: { size: 15 }
                  },
                  legend: {
                    display:false,
                    onClick: () => {},
                    position: 'bottom',
                    align: 'center',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      color: '#000000',
                      font: {
                        size: 16
                      }
                    }
                  }
                }
              },
              plugins: [{
                id: 'centerText',
                beforeDraw(chart: any, args: any, pluginOptions: any) {
                const { width, height, ctx } = chart;
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const lines: any = ['Distribución', 'por', 'Género'];
                const lineHeight: any = 19;
                const centerY: any = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                lines.forEach((line: any, i: any) => {
                  ctx.fillText(line, width / 2, centerY + i * lineHeight);
                });

                ctx.restore();
              }
            }]
            });
          } else {
            console.error('No se pudo obtener el contexto 2D.');
          }
        } else {
          console.error('El elemento canvas no fue encontrado.');
        }

      const canvas2 = document.getElementById('myChart2') as HTMLCanvasElement; // Asegurarse de que es un elemento canvas

        if (canvas2) {
          const ctx3: any = canvas2.getContext('2d');

          if (ctx3) {
            const values: any = this.datacharts.nacional.map((item: any) =>
              item.value === 'N/A' || item.value === 'NA'
                ? 'N/A'
                : item.value === 0.0
                ? 0
                : Number(parseFloat(item.value))
            );


            const total: any = values.reduce((sum: any, currentValue: any) => sum + currentValue, 0);

            const percentages: any = values.map((value: any) =>
              typeof value === 'string' ? 'N/A' : value === 0 ? 0 : ((value / total) * 100).toFixed(0)
            );

                        //const labels: any = this.datacharts.nacional.map((item: any) => item.label);
            const labels = this.datacharts.nacional.map((item: any, index: number) => {
              const value = values[index];
              const percent = percentages[index];
              return value === 0 ? `${item.label}: 0%` : item.label;
            });

            // Colores base (azul para mayor, verde para menor)
            const colorHierarchy = [
              'rgb(53, 114, 184)', // azul para mayor valor
              'rgb(62, 170, 61)',  // verde para el otro valor
            ];

            // Ordenar valores con índice para asignar colores
            const sorted = values
            .map((value:any, index:any) => ({
              value,
              percentage: percentages[index],
              label: labels[index],
              index
            }))
            .sort((a:any, b:any) => b.value - a.value); // orden descendente

            const colorByIndex = new Array(values.length).fill('#ccc');
            sorted.forEach((item: any, i: any) => {
              colorByIndex[item.index] = colorHierarchy[i] || '#ccc';
            });

            // Filtramos solo los índices que no son 'N/A'
            const filteredPercentages = percentages.filter((v: any) => v !== 'N/A');
            const filteredColors = colorByIndex.filter((_: any, i: any) => percentages[i] !== 'N/A');
            const filteredLabels = labels.filter((_: any, i: any) => percentages[i] !== 'N/A');

            const labelsContainer: any = document.getElementById('customLabels2');
            const sortedFiltered = sorted
              .sort((a: any, b: any) => b.value - a.value);

            labelsContainer.innerHTML = sortedFiltered.map((item: any) => `
              <div style="display:flex; align-items:center; margin: 5px 0;">
                <span style="display:inline-block; width:16px; height:16px; background:${colorByIndex[item.index]}; border-radius:50%; margin-right:8px;"></span>
                <span>${item.label}</span>
              </div>
            `).join('');

            // 📌 Cambiar entre flex y grid según la cantidad
            const itemCount = labels.length;
            labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

            if (itemCount > 2 && itemCount <= 6) {
              labelsContainer.classList.add('grid-2-cols');
            } else if (itemCount > 6) {
              labelsContainer.classList.add('grid-3-cols');
            } else {
              // Por defecto flex normal
            }


            const myChart: any = new Chart(ctx3, {
              type: 'doughnut',
              data: {
                labels: filteredLabels,
                datasets: [
                  {
                    data: filteredPercentages,
                    backgroundColor: filteredColors,
                    borderWidth: 0,
                  }
                ]
              },
              options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                  datalabels: {
                    formatter: (value: any) => {
                      console.log("formatter:", value);
                      return parseFloat(value) === 0 ? null : `${value} %`;
                    },
                    color: '#ffffff',
                    font: { size: 15 }
                  },
                  legend: {
                    display:false,
                    onClick: () => {},
                    position: 'bottom',
                    align: 'start',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      color: '#000000',
                      font: {
                        size: 16
                      }
                    }
                  }
                }
              },
              plugins: [{
                  id: 'centerText',
                  beforeDraw(chart: any, args: any, pluginOptions: any) {
                  const { width, height, ctx } = chart;
                  ctx.save();
                  ctx.fillStyle = '#000';
                  ctx.font = '16px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  const lines: any = ['Distribución', 'por', 'Nacionalidad'];
                  const lineHeight: any = 19;
                  const centerY: any = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;
                    lines.forEach((line: any, i: any) => {
                      ctx.fillText(line, width / 2, centerY + i * lineHeight);
                    });
                  ctx.restore();
                }
              }]
            });
          } else {
            console.error('No se pudo obtener el contexto 2D.');
          }
        } else {
          console.error('El elemento canvas no fue encontrado.');
        }


    } else if (this.selectedEstudio.tipeStudies === 'Beneficios' || this.selectedEstudio.tipeStudies === 'beneficios') {
      this.dataSource3 = [];

      this.dataservice.getDescriptionBenefits(this.selectedBeneficio).then((result: any) => {
        if (result.code === 200) {
          this.dataCargo = result;
        } else {
          this.dataCargo = { code: "403", message: "Sin Información." }
        }
      });
      
      this.structureHtml = await this.dataservice.getHtmlFormat(this.selectedEstudio.id);
      console.log("ESTRUCTURA HTML:", this.structureHtml);
      this.activePorcentil = await this.structureHtml.some((a: any) => a.name === 'TABLA_PERCENTIL');
      this.activeCambiosBeneficios = await this.structureHtml.some((a: any) => a.name === 'BAR_cambio en los ultimos 2 años');
      
    

      await this.dataservice.getDataFromFilters2(
        this.selectedEstudio.id,
        this.selectedArea,
        this.selectedFilters
      ).then((result: any) => {
        console.log("base:", result);

        this.alldataBenefits = result;
        console.log("alldataBenefits:", this.alldataBenefits);
        
        const empBeneficioKey: any = Object.keys(result[0]).find(key => key.includes("#_Emp_Beneficio"));
        const empKey: any = Object.keys(result[0]).find(key => key.includes("#_Empresas"));
        let val = null;
        if(result[0]._Presencia_Beneficio){
          val = result[0]._Presencia_Beneficio
        }else if(result[0]._Presencia_de_Beneficio){
          val = result[0]._Presencia_de_Beneficio
        }else if(result[0]._Presencia_del_Beneficio){
          val = result[0]._Presencia_del_Beneficio
        }

        this.activeAntiguedad = this.processStructureItem(
          "BAR_antiguedad del beneficio",
          /^Antigüedad_del_Beneficio_(.+)$/,
          result[0]
        );

        this.activeCambiosBeneficios = this.processStructureItem(
          "BAR_cambio en los ultimos 2 años",
          /^Cambios_en_los_últimos_2_años_(.+)$/,
          result[0]
        );

        this.activeRequisitosBeneficios = this.processStructureItem(
          "PIE_Existen Requisistos para el Beneficio",
          /^Existen_Requisitos_para_el_Beneficio_(.+)$/,
          result[0]
        );

        console.log("activeReq", this.activeRequisitosBeneficios);
        
        
        this.datachartsBenefit = {
          "nombreBeneficio": result[0].filtro_Beneficio,
          "prescencia": val,
          "origenEmpresa": result[0].Origen_Beneficio_Beneficio_Empresa,
          "origenInstrumentos": result[0].Origen_Beneficio_Instrumento_Colectivos ? result[0].Origen_Beneficio_Instrumento_Colectivos : result[0].Origen_Beneficio_Instrumento_Colectivo,
          "antiguedadMenos2": result[0].Antigüedad_del_Beneficio_Menos_de_2_años,
          "antiguedad2y5": result[0].Antigüedad_del_Beneficio_Entre_2_y_5_años,
          "antiguedad5y10": result[0].Antigüedad_del_Beneficio_Entre_5_y_10_años ? result[0].Antigüedad_del_Beneficio_Entre_5_y_10_años : result[0].Antigüedad_del_Beneficio_Más_de_5_años,
          "masde10": result[0].Antigüedad_del_Beneficio_Más_de_10_años,
          "modificobeneficio":result[0].Cambios_en_los_últimos_2_años_Se_modificó_el_beneficio,
          "aumentoAlcance": result[0].Cambios_en_los_últimos_2_años_Aumentó_el_alcance,
          "aunEnEvaluacion": result[0].Cambios_en_los_últimos_2_años_Aún_en_evaluación,
          "noHuboCambios": result[0].Cambios_en_los_últimos_2_años_No_hubo_cambios,
          "reemplazoBeneficio": result[0].Cambios_en_los_últimos_2_años_Se_reemplazó_el_beneficio,
          "supendioBeneficio": result[0].Cambios_en_los_últimos_2_años_Se_suspendió_el_beneficio,
          "beneficiosNo": result[0].Existen_Requisitos_para_el_Beneficio_NO,
          "beneficiosSi": result[0].Existen_Requisitos_para_el_Beneficio_SI,
          "otrosRequisitosNo":result[0].Otros_Requisitos_NO,
          "otrosRequisitosSi":result[0].Otros_Requisitos_SI,
          "requisitoContratoNo": result[0].Requisitos_Tipo_de_Contrato_NO,
          "requisitoContratoIndefinido": result[0].Requisitos_Tipo_de_Contrato_Contrato_Indefinido,
          "requisitoAntiguedad1": result[0].Requisitos_de_Antigüedad_1_Año,
          "requisitoAntiguedad3": result[0].Requisitos_de_Antigüedad_3_meses,
          "requisitoAntiguedad6": result[0].Requisitos_de_Antigüedad_6_Meses,
          "requisitoAntiguedadNo": result[0].Requisitos_de_Antigüedad_NO,
          "requisitoAntiguedadOtros": result[0].Requisitos_de_Antigüedad_Otros_Requisitos,
          "tasaImpactoOrganizacionBajo": result[0].Tasa_de_Impacto_en_la_Organización_Bajo,
          "tasaImpactoOrganizacionMedio": result[0].Tasa_de_Impacto_en_la_Organización_Medio,
          "tasaImpactoOrganizacionAlto": result[0].Tasa_de_Impacto_en_la_Organización_Alto,
          "tasaImpactoMarcaAlto": result[0].Tasa_Impacto_en_Marca_Empleadora_Alto,
          "tasaImpactoMarcaBajo": result[0].Tasa_Impacto_en_Marca_Empleadora_Bajo,
          "tasaImpactoMarcaMedio": result[0].Tasa_Impacto_en_Marca_Empleadora_Medio,
          "tasaUsoAlto": result[0].Tasa_uso_del_Beneficio_Alto,
          "tasaUsoBajo": result[0].Tasa_uso_del_Beneficio_Bajo,
          "tasaUsoMedio": result[0].Tasa_uso_del_Beneficio_Medio,
          "nroEmpBeneficio": parseFloat(result[0][empBeneficioKey]).toFixed(0),
          "nroEmp": parseFloat(result[0][empKey]).toFixed(0)
        }

        const prescenciaPercentage = (this.datachartsBenefit.prescencia * 100).toFixed(0);

        this.prescenciaBeneficio = [
          {
            prescencia: prescenciaPercentage
          }
        ]

        //TABLA BENEFICIOS PORCENTIL
        const tablaPorcentil = this.structureHtml.find((item: any) => item.name === "TABLA_PORCENTIL");
        const tablaUsoBeneficio = this.structureHtml.find((item: any) => item.name === "PIE_uso del beneficio");
        if (tablaPorcentil) {
          const keysToFind = tablaPorcentil.html.map((htmlItem: any) => {
            if (htmlItem.value !== null && htmlItem.value !== undefined) {
              return htmlItem.value.toLowerCase().replace(/\s+/g, "_");
            }
            return null;
          }).filter((key: any) => key !== null); // Filtramos valores nulos
          
          const filteredResults = result.map((item: any) => {
            const filteredItem: any = {};
          
            keysToFind.forEach((key:any) => {
              if (item.hasOwnProperty(key)) {
                filteredItem[key] = item[key];
              }
            });
          
            return filteredItem;
          });

          const keysToFindNormalized = keysToFind.map((k:any) => k !== undefined ? k.toLowerCase().replace(/\s+/g, "_") : null);


          const filteredKeys = Object.keys(result[0]).filter(key => {
            const keyNormalized = key.toLowerCase().replace(/\s+/g, "_");
            return keysToFindNormalized.some((k:any) => keyNormalized.includes(k));
          });

          // Función para transformar las claves
          const formatKey = (key: string) => {
            return key.split("_").slice(2).join(" "); // Quita los dos primeros segmentos y deja el resto formateado
          };

          const transformData = (keys: string[], result: any) => {
            return keys.reduce((acc, key) => {
              const [grupo1, grupo2] = key.split("_").slice(0, 2); // Extrae los dos primeros segmentos
              const groupKey = `${grupo1}_${grupo2}`;
              const labelKey = `${grupo1} ${grupo2}`.replace("_", " "); // Formatea el nombre del grupo
          
              if (!acc[groupKey]) {
                acc[groupKey] = { key: labelKey, values: [] };
              }
          
              acc[groupKey].values.push({
                label: formatKey(key), // Formatea el nombre eliminando el prefijo
                origen: key,
                value: result[0][key] || null // Busca el valor en result[0]
              });
          
              return acc;
            }, {} as Record<string, { key: string, values: { label: string, origen: string, value: any }[] }>);
          };

          // Generar el JSON transformado
          let formattedData = transformData(filteredKeys, result);

          // Filtrar los grupos que solo tienen valores "N/A"
          formattedData = Object.fromEntries(
            Object.entries(formattedData).filter(([_, group]) =>
              group.values.some(value => value.value !== "N/A")
            )
          );

          console.log("formattedDATA:", formattedData);

          // Convertir JSON a formato de tabla
          const transformToTable = (data: any) => {
            const tableData: any[] = [];
            const columnLabels = new Set<string>();

            // Construir filas
            Object.values(data).forEach((group: any) => {
              const row: any = { rowHeader: group.key }; // La primera columna es el "key"
              group.values.forEach((item: any) => {
                row[item.label] = item.value; // Agregar los valores con su label como clave
                columnLabels.add(item.label);
              });
              tableData.push(row);
            });

            return { tableData, displayedColumns: Array.from(columnLabels) };
          };

          // Obtener los datos para la tabla
          const { tableData, displayedColumns } = transformToTable(formattedData);

          // Asignar datos a las variables del componente
          this.dataSource3 = tableData;
          this.displayedColumns3 = displayedColumns;
        }
        this.filterRows2();


        this.activeRequisitosContrato = this.processStructureItem(
          "PIE_Requisitos tipo de contrato",
          /^Requisitos_Tipo_de_Contrato_(.+)$/,
          result[0]
        );

        this.activeBeneficioImpacto = this.processStructureItem(
          "PIE_origen del beneficio",
          /^Origen_Beneficio_(.+)$/,
          result[0],
          'label', // ordena por label
          'asc'    // ascendente
        );

        this.activeBeneficioUso = this.processStructureItem(
          "PIE_uso del beneficio",
          /^Tasa_uso_del_Beneficio_(.+)$/,
          result[0]
        );

        this.activeTasaImpactoOrg = this.processStructureItem(
          "PIE_tasa de impacto de la organizacion",
          /^Tasa_de_Impacto_en_la_Organización_(.+)$/,
          result[0]
        );

        this.activeTasaImpactoMarca = this.processStructureItem(
          "PIE_tasa de impacto en marca Empleadora",
          /^Tasa_Impacto_en_Marca_Empleadora_(.+)$/,
          result[0]
        );

        this.activeRequisitosAnt = this.processStructureItem(
          "PIE_Requisitos d Antiguedad",
          /^Requisitos_de_Antigüedad_(.+)$/,
          result[0]
        );

        this.activeOtrosRequisitos = this.processStructureItem(
          "PIE_Otros Reequisitos",
          /^Otros_Requisitos_(.+)$/,
          result[0]
        );
        console.log("ACTIVE OTROS::", this.activeOtrosRequisitos);
      });

      this.tableAppears3 = true;
      this.changeDetector.detectChanges();  // Detecta cambios en el DOM


      const canvas = document.getElementById('myChartB') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const prescenciaPercentage = (this.datachartsBenefit.prescencia * 100).toFixed(0);
          const restantePercentage = (100 - Number(prescenciaPercentage)).toFixed(0);

          const myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Presencia del Beneficio: ' + prescenciaPercentage + '%'],
              datasets: [{
                label: 'Presencia del Beneficio',
                data: [prescenciaPercentage, restantePercentage],
                backgroundColor: [
                  'rgb(79, 163, 25)',
                  'rgb(52, 115, 184)'
                ],
                borderWidth: 0, // Quita el borde blanco
              }]
            },
            options: {
              layout: {
                padding: {
                  top: 10,
                  bottom: 0
                }
              },
            plugins: {
              legend: {
                fullSize: true,
                align: 'center',
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  pointStyle: 'circle',
                  color: '#000',
                  font: {
                    size: 18
                  },
                  padding: 20 // espacio entre punto y texto
                }
              }
            }
          }
          });
        } else {
          console.error("No se pudo obtener el contexto 2D.");
        }
      } else {
        console.error("El elemento canvas no fue encontrado.");
      }

      const canvasB = document.getElementById('myChartC') as HTMLCanvasElement;
      if (canvasB) {
        const ctx2 = canvasB.getContext('2d');

        if (ctx2) {
          const values = this.activeBeneficioImpacto.map((item: any) =>
            item.value === 'N/A' || item.value === 'NA'
              ? 'N/A'
              : item.value === 0.0
              ? 0
              : Number(parseFloat(item.value))
          );

          const labels = this.activeBeneficioImpacto.map((item: any) => item.label);

          const total = values.reduce((sum: number, currentValue: any) => {
            return typeof currentValue === 'string' ? sum : sum + currentValue;
          }, 0);

          const percentages = values.map((value: any) =>
            typeof value === 'string'
              ? 'N/A'
              : value === 0
              ? 0
              : ((value / total) * 100).toFixed(0)
          );

          // Filtrar valores y etiquetas que no sean 'N/A'
          const filtered = values
            .map((value:any, index:any) => ({
              value,
              percentage: percentages[index],
              label: labels[index],
              index
            }))
            .filter((item:any) => item.percentage !== 'N/A');

          // Ordenar de mayor a menor
                    // Asociar índices originales para poder reordenar colores
          const sorted = values
            .map((value:any, index:any) => ({
              value,
              percentage: percentages[index],
              label: labels[index],
              index
            }))
            .sort((a:any, b:any) => b.value - a.value);

          // Asignar colores jerárquicamente
          const colorHierarchy = [
            'rgb(53, 115, 182)',
            'rgb(54, 170, 51)',
            'rgb(1, 114, 0)',
            'rgb(234, 98, 102)',
            'rgb(20, 61, 105)'
          ];

          const colorByIndex = new Array(values.length).fill('#ccc'); // fallback color
          sorted.forEach((item:any, i:any) => {
            colorByIndex[item.index] = colorHierarchy[i] || '#ccc';
          });

          const filteredPercentages = filtered.map((item:any) => item.percentage);
          const filteredLabels = filtered.map((item:any) => item.label);

          const labelsContainer: any = document.getElementById('customLabelsC');
          const sortedFiltered = filtered
            .sort((a: any, b: any) => b.value - a.value);

          labelsContainer.innerHTML = sortedFiltered.map((item: any) => `
            <div style="display:flex; align-items:center; margin: 5px 0;">
              <span style="display:inline-block; width:16px; height:16px; background:${colorByIndex[item.index]}; border-radius:50%; margin-right:8px;"></span>
              <span>${item.label}</span>
            </div>
          `).join('');

          // 📌 Cambiar entre flex y grid según la cantidad
          const itemCount = labels.length;
          labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

          if (itemCount > 2 && itemCount <= 6) {
            labelsContainer.classList.add('grid-2-cols');
          } else if (itemCount > 6) {
            labelsContainer.classList.add('grid-3-cols');
          } else {
            // Por defecto flex normal
          }

          const myChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
              labels: filteredLabels,
              datasets: [
                {
                  data: filteredPercentages,
                  backgroundColor: colorByIndex.filter((_, i) =>
                    filtered.find((f:any) => f.index === i)
                  ),
                  borderWidth: 0
                }
              ]
            },
            options: {
              responsive: false,
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  formatter: (value) => {
                    return parseFloat(value) === 0 ? null : `${value} %`;
                  },
                  color: '#ffffff',
                  font: { size: 15 }
                },
                legend: {
                  display:false
                }
              }
            },
            plugins: [
              {
                id: 'centerText',
                beforeDraw(chart, args, pluginOptions) {
                  const { width, height, ctx } = chart;
                  ctx.save();
                  ctx.fillStyle = '#000';
                  ctx.font = '16px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  const lines = ['Origen', 'del', 'Beneficio'];
                  const lineHeight = 18;
                  const centerY = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                  lines.forEach((line, i) => {
                    ctx.fillText(line, width / 2, centerY + i * lineHeight);
                  });

                  ctx.restore();
                }
              }
            ]
          });
        } else {
          console.error("No se pudo obtener el contexto 2D.");
        }
      } else {
        console.error("El elemento canvas no fue encontrado.");
      }

      const canvasC = document.getElementById('myChartD') as HTMLCanvasElement;
      if (canvasC) {
        const ctx3 = canvasC.getContext('2d');

        if (ctx3) {
          // Ordenamos `this.activeAntiguedad` de menor a mayor basándonos en el campo `label`
          this.activeAntiguedad.sort((a: any, b: any) => {
            const numA = parseInt(a.label);
            const numB = parseInt(b.label);
            return numA - numB;
          });

          const values = this.activeAntiguedad.map((item: any) =>
            item.value === 0.0 ? 0 : parseFloat(item.value)
          );

          const total = values.reduce((sum: number, currentValue: number) => sum + currentValue, 0);

          const percentages = values.map((value: number) =>
            value === 0 ? 0 : ((value / total) * 100).toFixed(0)
          );

          const labels = this.activeAntiguedad.map((item: any, index: number) => {
            const value = values[index];
            const percent = percentages[index];
            return value === 0 ? `${item.label}: 0%` : item.label;
          });

          // Asociar índices originales para poder reordenar colores
          const sorted = values
            .map((value:any, index:any) => ({
              value,
              percentage: percentages[index],
              label: labels[index],
              index
            }))
            .sort((a:any, b:any) => b.value - a.value);

          const colorHierarchy = [
            'rgb(53, 115, 182)',
            'rgb(54, 170, 51)',
            'rgb(1, 114, 0)',
            'rgb(234, 98, 102)',
            'rgb(20, 61, 105)'
          ];

          const colorByIndex = new Array(values.length).fill('#ccc');
          sorted.forEach((item:any, i:any) => {
            colorByIndex[item.index] = colorHierarchy[i] || '#ccc';
          });

          
          const labelsContainer:any = document.getElementById('customLabelsD');
          const sortedFiltered = sorted
            .sort((a: any, b: any) => b.value - a.value);

          labelsContainer.innerHTML = sortedFiltered.map((item: any) => `
            <div style="display:flex; align-items:center; margin: 5px 0;">
              <span style="display:inline-block; width:16px; height:16px; background:${colorByIndex[item.index]}; border-radius:50%; margin-right:8px;"></span>
              <span>${item.label}</span>
            </div>
          `).join('');

          // 📌 Cambiar entre flex y grid según la cantidad
          const itemCount = labels.length;
          labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

          if (itemCount > 2 && itemCount <= 6) {
            labelsContainer.classList.add('grid-2-cols');
          } else if (itemCount > 6) {
            labelsContainer.classList.add('grid-3-cols');
          } else {
            // Por defecto flex normal
          }


          const myChart = new Chart(ctx3, {
            type: 'doughnut',
            data: {
              labels: labels.map((label: any) => `${label}`),
              datasets: [{
                label: "",
                data: percentages,
                backgroundColor: colorByIndex,
                borderColor: colorByIndex,
                borderWidth: 0
              }]
            },
            options: {
              responsive: false,
              plugins: {
                datalabels: {
                  formatter: (value) => {
                    return parseFloat(value) === 0 ? null : `${value} %`;
                  },
                  color: '#ffffff',
                  font: { size: 15 }
                },
                legend: {
                  display:false,
                  onClick: () => {},
                  position: 'bottom',
                  align: 'center',
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: '#000000',
                    font: {
                      size: 16
                    }
                  }
                },
              }
            },
            plugins: [{
              id: 'centerText',
              beforeDraw(chart, args, pluginOptions) {
                const { width, height, ctx } = chart;
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const lines = ['Antiguedad', 'del', 'Beneficio'];
                const lineHeight = 18;
                const centerY = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                lines.forEach((line, i) => {
                    ctx.fillText(line, width / 2, centerY + i * lineHeight);
                  });

                ctx.restore();
              }
            }]
          });

        } else {
          console.error("No se pudo obtener el contexto 2D.");
        }
      } else {
        console.error("El elemento canvas no fue encontrado.");
      }

      const canvasE = document.getElementById('myChartE') as HTMLCanvasElement;

      if (canvasE) {
        const ctx4 = canvasE.getContext('2d');

        if (ctx4) {
          const values = this.activeCambiosBeneficios.map((item: any) =>
            item.value === 0.0 ? 0 : parseFloat(item.value)
          );

          const total = values.reduce((sum: number, currentValue: number) => sum + currentValue, 0);

          const percentages = values.map((value: number) =>
            value === 0 ? 0 : ((value / total) * 100).toFixed(0)
          );

          // ✅ Ahora sí puedes usar percentages aquí
          const labels = this.activeCambiosBeneficios.map((item: any, index: number) => {
            const value = values[index];
            const percent = percentages[index];
            return value === 0 ? `${item.label}: 0%` : item.label;
          });

          const sorted = values
            .map((value:any, index:any) => ({
              value,
              percentage: percentages[index],
              label: labels[index],
              index
            }))
            .sort((a:any, b:any) => b.value - a.value); // orden descendente

          const colorHierarchy = [
            'rgb(53, 115, 182)',
            'rgb(54, 170, 51)',
            'rgb(1, 114, 0)',
            'rgb(234, 98, 102)',
            'rgb(20, 61, 105)',
            'rgb(255, 223, 19)'
          ];

          const colorByIndex = new Array(values.length).fill('#ccc');
          sorted.forEach((item:any, i:any) => {
            colorByIndex[item.index] = colorHierarchy[i] || '#ccc';
          });

          const labelsContainer: any = document.getElementById('customLabelsE');
          const sortedFiltered = sorted
            .sort((a: any, b: any) => b.value - a.value);

          labelsContainer.innerHTML = sortedFiltered.map((item: any) => `
            <div style="display:flex; align-items:center; margin: 5px 0;">
              <span style="display:inline-block; width:16px; height:16px; background:${colorByIndex[item.index]}; border-radius:50%; margin-right:8px;"></span>
              <span>${item.label}</span>
            </div>
          `).join('');

          // 📌 Cambiar entre flex y grid según la cantidad
          const itemCount = labels.length;
          labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

          if (itemCount > 2 && itemCount <= 6) {
            labelsContainer.classList.add('grid-2-cols');
          } else if (itemCount > 6) {
            labelsContainer.classList.add('grid-3-cols');
          } else {
            // Por defecto flex normal
          }

          const myChart = new Chart(ctx4, {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [{
                label: "Cambios en los últimos 2 años",
                data: percentages,
                backgroundColor: colorByIndex,
                borderWidth: 0,
              }]
            },
            options: {
               responsive: false,
              maintainAspectRatio: false,              
              plugins: {
                datalabels: {
                  formatter: (value) => {
                    return parseFloat(value) === 0 ? null : `${value} %`;
                  },
                  color: '#ffffff',
                  font: { size: 15 }
                },
                legend: {
                  display: false, // ❌ Oculta la leyenda de Chart.js
                  onClick: () => {},
                  position: 'bottom',
                  align: 'center',
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: '#000000',
                    font: {
                      size: 16
                    }
                  },
                },
              }
            },
            plugins: [{
              id: 'centerText',
              beforeDraw(chart, args, pluginOptions) {
                const { width, height, ctx } = chart;
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const lines = ['Cambios', 'en los', 'últimos 2 años'];
                const lineHeight = 18;
                const centerY = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                lines.forEach((line, i) => {
                  ctx.fillText(line, width / 2, centerY + i * lineHeight);
                });

                ctx.restore();
              }
            }]
          });

          
        } else {
          console.error("No se pudo obtener el contexto 2D.");
        }
      } else {
        console.error("El elemento canvas no fue encontrado.");
      }

      // Gráfico F
      const canvasF = document.getElementById('myChartF') as HTMLCanvasElement;
      if (canvasF) {
          const ctx4 = canvasF.getContext('2d');

          const values = this.activeRequisitosBeneficios.map((item: any) =>
            item.value === 0.0 ? 0 : Number(parseFloat(item.value))
          );

          const total = values.reduce((sum: number, currentValue: number) => sum + currentValue, 0);
          const percentages = values.map((value: number) =>
            value === 0 ? 0 : ((value / total) * 100).toFixed(0)
          );

          const labels = this.activeRequisitosBeneficios.map((item: any, index: number) => {
            const value = values[index];
            const percent = percentages[index];
            return value === 0 ? `${item.label}: 0%` : item.label;
          });

          if (ctx4) {
            // Ordenamos por valor descendente
            const sorted = values
              .map((value:any, index:any) => ({
                value,
                percentage: percentages[index],
                label: labels[index],
                index
              }))
              .sort((a:any, b:any) => b.value - a.value);

            const colorHierarchy = [
              'rgb(53, 115, 182)',
              'rgb(54, 170, 51)',
              'rgb(1, 114, 0)',
              'rgb(234, 98, 102)',
              'rgb(20, 61, 105)'
            ];

            const colorByIndex = new Array(values.length).fill('#ccc');
            sorted.forEach((item:any, i:any) => {
              colorByIndex[item.index] = colorHierarchy[i] || '#ccc';
            });

                      
          const labelsContainer:any = document.getElementById('customLabelsF');
          const sortedFiltered = sorted
            .sort((a: any, b: any) => b.value - a.value);

          labelsContainer.innerHTML = sortedFiltered.map((item: any) => `
            <div style="display:flex; align-items:center; margin: 5px 0;">
              <span style="display:inline-block; width:16px; height:16px; background:${colorByIndex[item.index]}; border-radius:50%; margin-right:8px;"></span>
              <span>${item.label}</span>
            </div>
          `).join('');

                    
          // 📌 Cambiar entre flex y grid según la cantidad
          const itemCount = labels.length;
          labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

          if (itemCount > 2 && itemCount <= 6) {
            labelsContainer.classList.add('grid-2-cols');
          } else if (itemCount > 6) {
            labelsContainer.classList.add('grid-3-cols');
          } else {
            // Por defecto flex normal
          }

            const myChart = new Chart(ctx4, {
              type: 'doughnut',
              data: {
                labels: labels.map((label: any) => `${label}`),
                datasets: [{
                  data: percentages,
                  backgroundColor: colorByIndex,
                  borderWidth: 0,
                }]
              },
              options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                  datalabels: {
                    formatter: (value) => {
                      return parseFloat(value) === 0 ? null : `${value} %`;
                    },
                    color: '#ffffff',
                    font: { size: 15 }
                  },
                  legend: {
                    display:false,
                    onClick: () => {},
                    position: 'bottom',
                    align: 'center',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      color: '#000000',
                      font: {
                        size: 16
                      }
                    },
                  },
                }
              },
              plugins: [{
                id: 'centerText',
                beforeDraw(chart, args, pluginOptions) {
                  const { width, height, ctx } = chart;
                  ctx.save();
                  ctx.fillStyle = '#000';
                  ctx.font = '16px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  const lines = ['Existen Requisitos', 'para el', 'Beneficio'];
                  const lineHeight = 18;
                  const centerY = height / 2 - ((lines.length - 1) / 1.7) * lineHeight;

                  lines.forEach((line, i) => {
                    ctx.fillText(line, width / 2, centerY + i * lineHeight);
                  });

                  ctx.restore();
                }
              }]
            });
          } else {
            console.error("No se pudo obtener el contexto 2D.");
          }
      } else {
        console.error("El elemento canvas no fue encontrado.");
      }

      // Gráfico G
      const canvasG = document.getElementById('myChartG') as HTMLCanvasElement;
      if (canvasG) {
          const ctx4 = canvasG.getContext('2d');

          const values = this.activeRequisitosContrato.map((item: any) =>
            item.value === 'N/A' || item.value === 'NA'
              ? 'N/A'
              : item.value === 0.0
              ? 0
              : Number(parseFloat(item.value))
          );

          const total = values.reduce((sum: number, val: any) => (typeof val === 'number' ? sum + val : sum), 0);

          const percentages = values.map((value: any) =>
            typeof value === 'string'
              ? 'N/A'
              : value === 0
              ? 0
              : ((value / total) * 100).toFixed(0)
          );

          const labels = this.activeRequisitosContrato.map((item: any, index: number) => {
            const value = values[index];
            const percent = percentages[index];
            return value === 0 ? `${item.label}: 0%` : item.label;
          });

          // Color jerárquico
          const colorHierarchy = [
            'rgb(53, 115, 182)',   // Azul
            'rgb(54, 170, 51)',    // Verde claro
            'rgb(1, 114, 0)',      // Verde oscuro
            'rgb(234, 98, 102)',   // Rojo claro
            'rgb(20, 61, 105)'     // Azul oscuro
          ];

          if (ctx4) {
            // Ordenamos por valor descendente, ignorando los N/A
            const sorted = values
              .map((value:any, index:any) => ({
                value,
                percentage: percentages[index],
                label: labels[index],
                index
              }))
              .filter((item:any) => item.percentage !== 'N/A')
              .sort((a:any, b:any) => b.value - a.value);

            const finalLabels = sorted.map((item:any) => item.label);
            const finalPercentages = sorted.map((item:any) => item.percentage);
            const finalColors = sorted.map((_:any, i:any) => colorHierarchy[i] || '#ccc');
                               
          const labelsContainer:any = document.getElementById('customLabelsG');
          const sortedFiltered = sorted
            .sort((a: any, b: any) => b.value - a.value);

          labelsContainer.innerHTML = sortedFiltered.map((item: any) => `
            <div style="display:flex; align-items:center; margin: 5px 0;">
              <span style="display:inline-block; width:16px; height:16px; background:${finalColors[item.index]}; border-radius:50%; margin-right:8px;"></span>
              <span>${item.label}</span>
            </div>
          `).join('');

          
          // 📌 Cambiar entre flex y grid según la cantidad
          const itemCount = labels.length;
          labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

          if (itemCount > 2 && itemCount <= 6) {
            labelsContainer.classList.add('grid-2-cols');
          } else if (itemCount > 6) {
            labelsContainer.classList.add('grid-3-cols');
          } else {
            // Por defecto flex normal
          }
          
            const myChart = new Chart(ctx4, {
              type: 'doughnut',
              data: {
                labels: finalLabels,
                datasets: [{
                  data: finalPercentages,
                  backgroundColor: finalColors,
                  borderWidth: 0
                }]
              },
              options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                  datalabels: {
                    formatter: (value) => {
                      return parseFloat(value) === 0 ? null : `${value} %`;
                    },
                    color: '#ffffff',
                    font: { size: 15 }
                  },
                  legend: {
                    display:false,
                  }
                }
              },
              plugins: [{
                id: 'centerText',
                beforeDraw(chart, args, pluginOptions) {
                  const { width, height, ctx } = chart;
                  ctx.save();
                  ctx.fillStyle = '#000';
                  ctx.font = '16px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  const lines = ['Requisitos', 'Tipo de', 'Contrato'];
                  const lineHeight = 18;
                  const centerY = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                  lines.forEach((line, i) => {
                    ctx.fillText(line, width / 2, centerY + i * lineHeight);
                  });

                  ctx.restore();
                }
              }]
            });
          } else {
            console.error("No se pudo obtener el contexto 2D.");
          }
      } else {
        console.error("El elemento canvas no fue encontrado.");
      }

      const canvasH = document.getElementById('myChartH') as HTMLCanvasElement; // Asegurarse de que es un elemento canvas
      if (canvasH) {
        const ctx5: any = canvasH.getContext('2d');

        if (ctx5) {
          const values: any = this.activeRequisitosAnt.map((item: any) =>
            item.value === 'N/A' || item.value === 'NA'
              ? 'N/A'
              : item.value === 0.0
              ? 0
              : Number(parseFloat(item.value))
          );

          const total: any = values.reduce((sum: any, val: any) => (typeof val === 'number' ? sum + val : sum), 0);

          const percentages: any = values.map((value: any) =>
            typeof value === 'string'
              ? 'N/A'
              : value === 0
              ? 0
              : ((value / total) * 100).toFixed(0)
          );

          
          const labels = this.activeRequisitosAnt.map((item: any, index: number) => {
            const value = values[index];
            const percent = percentages[index];
            return value === 0 ? `${item.label}: 0%` : item.label;
          });

          const colorHierarchy: any = [
            'rgb(53, 115, 182)',
            'rgb(54, 170, 51)',
            'rgb(1, 114, 0)',
            'rgb(234, 98, 102)',
            'rgb(20, 61, 105)'
          ];

          const sorted: any = values
            .map((value: any, index: any) => ({
              value,
              percentage: percentages[index],
              label: labels[index],
              index
            }))
            .filter((item: any) => item.percentage !== 'N/A')
            .sort((a: any, b: any) => b.value - a.value);

          const finalLabels: any = sorted.map((item: any) => item.label);
          const finalPercentages: any = sorted.map((item: any) => item.percentage);
          const finalColors: any = sorted.map((_: any, i: any) => colorHierarchy[i] || '#ccc');

          const labelsContainer:any = document.getElementById('customLabelsH');
          const sortedFiltered = sorted
            .sort((a: any, b: any) => b.value - a.value);

          labelsContainer.innerHTML = sortedFiltered.map((item: any) => `
            <div style="display:flex; align-items:center; margin: 5px 0;">
              <span style="display:inline-block; width:16px; height:16px; background:${finalColors[item.index]}; border-radius:50%; margin-right:8px;"></span>
              <span>${item.label}</span>
            </div>
          `).join('');

          // 📌 Cambiar entre flex y grid según la cantidad
          const itemCount = labels.length;
          labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

          if (itemCount > 2 && itemCount <= 6) {
            labelsContainer.classList.add('grid-2-cols');
          } else if (itemCount > 6) {
            labelsContainer.classList.add('grid-3-cols');
          } else {
            // Por defecto flex normal
          }

          const myChart: any = new Chart(ctx5, {
            type: 'doughnut',
            data: {
              labels: finalLabels,
              datasets: [{
                data: finalPercentages,
                backgroundColor: finalColors,
                borderWidth: 0
              }]
            },
            options: {
              responsive: false,
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  formatter: (value: any) => {
                    return parseFloat(value) === 0 ? null : `${value} %`;
                  },
                  color: '#ffffff',
                  font: { size: 15 }
                },
                legend: {
                  display:false
                }
              }
            },
            plugins: [{
              id: 'centerText',
              beforeDraw(chart: any, args: any, pluginOptions: any) {
                const { width, height, ctx } = chart;
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const lines: any = ['Requisitos', 'De', 'Antigüedad'];
                const lineHeight: any = 19;
                const centerY: any = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                lines.forEach((line: any, i: any) => {
                  ctx.fillText(line, width / 2, centerY + i * lineHeight);
                });

                ctx.restore();
              }
            }]
          });
        } else {
          console.error("No se pudo obtener el contexto 2D.");
        }
      } else {
        console.error("El elemento canvas no fue encontrado.");
      }

      const canvasI = document.getElementById('myChartI') as HTMLCanvasElement; // Asegurarse de que es un elemento canvas
      if (canvasI) {
          const ctx6: any = canvasI.getContext('2d');
          if (ctx6) {
            const values: any = this.activeOtrosRequisitos.map((item: any) =>
              item.value === 0.0 ? 0 : Number(parseFloat(item.value))
            );

            const total: any = values.reduce((sum: any, currentValue: any) => sum + currentValue, 0);

            const percentages: any = values.map((value: any) =>
              value === 0 ? 0 : (value * 100).toFixed(0)
            );

            const labels = this.activeOtrosRequisitos.map((item: any, index: number) => {
              const value = values[index];
              const percent = percentages[index];
              return value === 0 ? `${item.label}: 0%` : item.label;
            });

            const colorHierarchy: any = [
              'rgb(53, 115, 182)',
              'rgb(54, 170, 51)',
              'rgb(1, 114, 0)',
              'rgb(234, 98, 102)',
              'rgb(20, 61, 105)'
            ];

            const sorted: any = values
            .map((value: any, index: any) => ({
              value,
              percentage: percentages[index],
              label: labels[index],
              index
            }))
            .filter((item: any) => item.percentage !== 'N/A')
            .sort((a: any, b: any) => b.value - a.value);

          const finalLabels: any = sorted.map((item: any) => item.label);
          const finalPercentages: any = sorted.map((item: any) => item.percentage);
          const finalColors: any = sorted.map((_: any, i: any) => colorHierarchy[i] || '#ccc');

            const labelsContainer:any = document.getElementById('customLabelsI');
          const sortedFiltered = sorted
            .sort((a: any, b: any) => b.value - a.value);

          labelsContainer.innerHTML = sortedFiltered.map((item: any) => `
            <div style="display:flex; align-items:center; margin: 5px 0;">
              <span style="display:inline-block; width:16px; height:16px; background:${finalColors[item.index]}; border-radius:50%; margin-right:8px;"></span>
              <span>${item.label}</span>
            </div>
          `).join('');

            // 📌 Cambiar entre flex y grid según la cantidad
            const itemCount = labels.length;
            labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

            if (itemCount > 2 && itemCount <= 6) {
              labelsContainer.classList.add('grid-2-cols');
            } else if (itemCount > 6) {
              labelsContainer.classList.add('grid-3-cols');
            } else {
              // Por defecto flex normal
            }

            const myChart: any = new Chart(ctx6, {
              type: 'doughnut',
              data: {
                labels: labels.map((label: any, index: any) => `${label}`),
                datasets: [{
                  data: percentages,
                  backgroundColor: [
                    'rgb(53, 115, 182)',
                    'rgb(54, 170, 51)',
                    'rgb(1, 114, 0)',
                    'rgb(234, 98, 102)',
                    'rgb(20, 61, 105)'
                  ],
                  borderWidth: 0
                }]
              },
              options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                  datalabels: {
                    formatter: (value: any) => {
                      return parseFloat(value) === 0 ? null : `${value} %`;
                    },
                    color: '#ffffff',
                    font: { size: 15 }
                  },
                  legend: {
                    display:false
                  }
                }
              },
              plugins: [{
                id: 'centerText',
                beforeDraw(chart: any, args: any, pluginOptions: any) {
                  const { width, height, ctx }: any = chart;
                  ctx.save();
                  ctx.fillStyle = '#000';
                  ctx.font = '16px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  const lines: any = ['Otros', 'Requisitos'];
                  const lineHeight: any = 24;

                  const centerY: any = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                  lines.forEach((line: any, i: any) => {
                    ctx.fillText(line, width / 2, centerY + i * lineHeight);
                  });

                  ctx.restore();
                }
              }]
            });
          } else {
                  console.error("No se pudo obtener el contexto 2D.");
                }
      } else {
          console.error("El elemento canvas no fue encontrado.");
      }

      const canvasImpact1 = document.getElementById('myChartImpact1') as HTMLCanvasElement;

        if (canvasImpact1) {
          const ctxImpact1: any = canvasImpact1.getContext('2d');

          if (ctxImpact1) {
            const values: any = this.activeTasaImpactoOrg.map((item: any) =>
              item.value === 'N/A' || item.value === 'NA'
                ? 'N/A'
                : item.value === 0.0
                ? 0
                : Number(parseFloat(item.value))
            );

            const total: any = values.reduce((sum: any, currentValue: any) => sum + currentValue, 0);

            const percentages: any = values.map((value: any) =>
              typeof value === 'string' ? 'N/A' : value === 0 ? 0 : ((value / total) * 100).toFixed(0)
            );

            const filteredPercentagesOrg: any = percentages.filter((value: any) => value !== 'N/A');

            const labels = this.activeTasaImpactoOrg.map((item: any, index: number) => {
              const value = values[index];
              const percent = percentages[index];
              return value === 0 ? `${item.label}: 0%` : item.label;
            });

            // Ordenamos valores para asignar colores
            const sorted = values
              .map((value: any, index: any) => ({
                value,
                index,
              }))
              .sort((a: any, b: any) => b.value - a.value);

            const colorHierarchy = [
              'rgb(53, 115, 182)', // azul claro para el mayor valor
              'rgb(54, 170, 51)',  // verde claro
              'rgb(1, 114, 0)',    // verde oscuro
              'rgb(234, 98, 102)', // rojo claro
              'rgb(20, 61, 105)'   // azul oscuro
            ];

            // Asignar colores según el orden de los valores
            const colorByIndex = new Array(values.length).fill('#ccc');
            sorted.forEach((item: any, i: any) => {
              colorByIndex[item.index] = colorHierarchy[i] || '#ccc';
            });

            const labelsContainer:any = document.getElementById('customLabelsImpact1');
            labelsContainer.innerHTML = labels.map((label:any, i:any) => `
              <div style="display:flex; align-items:center; margin: 5px 0;">
                <span style="display:inline-block; width:16px; height:16px; background:${colorByIndex[i]}; border-radius:50%; margin-right:8px;"></span>
                <span>${label}</span>
              </div>
            `).join('');

            // 📌 Cambiar entre flex y grid según la cantidad
            const itemCount = labels.length;
            labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

            if (itemCount > 2 && itemCount <= 6) {
              labelsContainer.classList.add('grid-2-cols');
            } else if (itemCount > 6) {
              labelsContainer.classList.add('grid-3-cols');
            } else {
              // Por defecto flex normal
            }

            const myChart: any = new Chart(ctxImpact1, {
              type: 'doughnut',
              data: {
                labels: labels.map((label: any, index: any) => `${label}`),
                datasets: [
                  {
                    data: percentages.filter((v: any) => v !== 'N/A'),
                    backgroundColor: colorByIndex.filter((_: any, i: any) => percentages[i] !== 'N/A'),
                    borderWidth: 0
                  }
                ]
              },
              options: {
                plugins: {
                  datalabels: {
                    formatter: (value: any) => {
                      return parseFloat(value) === 0 ? null : `${value} %`;
                    },
                    color: '#ffffff',
                    font: { size: 15 }
                  },
                  legend: {
                    display:false
                  }
                }
              },
              plugins: [
                {
                  id: 'centerText',
                  beforeDraw(chart: any, args: any, pluginOptions: any) {
                    const { width, height, ctx }: any = chart;
                    ctx.save();
                    ctx.fillStyle = '#000';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const lines: any = ['Tasa de Impacto', 'en la', 'Organización'];
                    const lineHeight: any = 19;

                    const centerY: any = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                    lines.forEach((line: any, i: any) => {
                      ctx.fillText(line, width / 2, centerY + i * lineHeight);
                    });

                    ctx.restore();
                  }
                }
              ]
            });
          } else {
            console.error("No se pudo obtener el contexto 2D.");
          }
        } else {
          console.error("El elemento canvas no fue encontrado.");
        }

      const canvasImpact2Uso = document.getElementById('myChartImpact2Uso') as HTMLCanvasElement;
      if (canvasImpact2Uso) {
        const ctxImpact1Uso: any = canvasImpact2Uso.getContext('2d');

        if (ctxImpact1Uso) {
          const values: any = this.activeBeneficioUso.map((item: any) =>
              item.value === 'N/A' || item.value === 'NA'
                ? 'N/A'
                : item.value === 0.0
                ? 0
                : Number(parseFloat(item.value))
            );

            const total: any = values.reduce((sum: any, currentValue: any) => sum + currentValue, 0);

            const percentages: any = values.map((value: any) =>
              typeof value === 'string' ? 'N/A' : value === 0 ? 0 : ((value / total) * 100).toFixed(0)
            );

            const filteredPercentagesOrg: any = percentages.filter((value: any) => value !== 'N/A');

            const labels = this.activeBeneficioUso.map((item: any, index: number) => {
              const value = values[index];
              const percent = percentages[index];
              return value === 0 ? `${item.label}: 0%` : item.label;
            });

            // Ordenamos valores para asignar colores
            const sorted = values
              .map((value: any, index: any) => ({
                value,
                index,
              }))
              .sort((a: any, b: any) => b.value - a.value);

            const colorHierarchy = [
              'rgb(53, 115, 182)', // azul claro para el mayor valor
              'rgb(54, 170, 51)',  // verde claro
              'rgb(1, 114, 0)',    // verde oscuro
              'rgb(234, 98, 102)', // rojo claro
              'rgb(20, 61, 105)'   // azul oscuro
            ];

            // Asignar colores según el orden de los valores
            const colorByIndex = new Array(values.length).fill('#ccc');
            sorted.forEach((item: any, i: any) => {
              colorByIndex[item.index] = colorHierarchy[i] || '#ccc';
            });

            const labelsContainer:any = document.getElementById('customLabelsImpact2Uso');
            labelsContainer.innerHTML = labels.map((label:any, i:any) => `
              <div style="display:flex; align-items:center; margin: 5px 0;">
                <span style="display:inline-block; width:16px; height:16px; background:${colorByIndex[i]}; border-radius:50%; margin-right:8px;"></span>
                <span>${label}</span>
              </div>
            `).join('');

            // 📌 Cambiar entre flex y grid según la cantidad
            const itemCount = labels.length;
            labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

            if (itemCount > 2 && itemCount <= 6) {
              labelsContainer.classList.add('grid-2-cols');
            } else if (itemCount > 6) {
              labelsContainer.classList.add('grid-3-cols');
            } else {
              // Por defecto flex normal
            }


          const myChart: any = new Chart(ctxImpact1Uso, {
            type: 'doughnut',
            data: {
              labels: labels.map((label: any, index: any) => `${label}`),
              datasets: [
                {
                  data: percentages.filter((v: any) => v !== 'N/A'),
                  backgroundColor: colorByIndex.filter((_: any, i: any) => percentages[i] !== 'N/A'),
                  borderWidth: 0
                }
              ]
            },
            options: {
              plugins: {
                datalabels: {
                  formatter: (value: any) => {
                    return parseFloat(value) === 0 ? null : `${value} %`;
                  },
                  color: '#ffffff',
                  font: { size: 15 }
                },
                legend: {
                  display:false
                }
              }
            },
            plugins: [
              {
                id: 'centerText',
                beforeDraw(chart: any, args: any, pluginOptions: any) {
                  const { width, height, ctx }: any = chart;
                  ctx.save();
                  ctx.fillStyle = '#000';
                  ctx.font = '14px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  const lines: any = ['Tasa de Uso', 'del', 'Beneficio'];
                  const lineHeight: any = 19;

                  const centerY: any = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                  lines.forEach((line: any, i: any) => {
                    ctx.fillText(line, width / 2, centerY + i * lineHeight);
                  });

                  ctx.restore();
                }
              }
            ]
          });
        } else {
          console.error('No se pudo obtener el contexto 2D.');
        }
      } else {
        console.error('El elemento canvas no fue encontrado.');
      }

      const canvasImpact2 = document.getElementById('myChartImpact2') as HTMLCanvasElement;
        if (canvasImpact2) {
          const ctxImpact1Uso: any = canvasImpact2.getContext('2d');

          if (ctxImpact1Uso) {
            const values: any = this.activeTasaImpactoMarca.map((item: any) =>
              item.value === 'N/A' || item.value === 'NA'
                ? 'N/A'
                : item.value === 0.0
                ? 0
                : Number(parseFloat(item.value))
            );

            const total: any = values.reduce((sum: any, currentValue: any) => sum + currentValue, 0);

            const percentages: any = values.map((value: any) =>
              typeof value === 'string' ? 'N/A' : value === 0 ? 0 : ((value / total) * 100).toFixed(0)
            );

            const labels = this.activeTasaImpactoMarca.map((item: any, index: number) => {
              const value = values[index];
              const percent = percentages[index];
              return value === 0 ? `${item.label}: 0%` : item.label;
            });

            const colorHierarchy = [
              'rgb(53, 115, 182)', // azul claro para mayor valor
              'rgb(54, 170, 51)',  // verde claro
              'rgb(1, 114, 0)',    // verde oscuro
              'rgb(234, 98, 102)', // rojo claro
              'rgb(20, 61, 105)'   // azul oscuro
            ];

            // Ordenar valores con su índice para asignar colores
            const sorted = values
              .map((value: any, index: any) => ({ value, index }))
              .sort((a: any, b: any) => b.value - a.value);

            const colorByIndex = new Array(values.length).fill('#ccc');
            sorted.forEach((item: any, i: any) => {
              colorByIndex[item.index] = colorHierarchy[i] || '#ccc';
            });

            // Filtrar solo valores válidos (no 'N/A')
            const filteredPercentages = percentages.filter((v: any) => v !== 'N/A');
            const filteredColors = colorByIndex.filter((_: any, i: any) => percentages[i] !== 'N/A');
            const filteredLabels = labels.filter((_: any, i: any) => percentages[i] !== 'N/A');

            const labelsContainer:any = document.getElementById('customLabelsImpact2');
            labelsContainer.innerHTML = labels.map((label:any, i:any) => `
              <div style="display:flex; align-items:center; margin: 5px 0;">
                <span style="display:inline-block; width:16px; height:16px; background:${colorByIndex[i]}; border-radius:50%; margin-right:8px;"></span>
                <span>${label}</span>
              </div>
            `).join('');

            // 📌 Cambiar entre flex y grid según la cantidad
            const itemCount = labels.length;
            labelsContainer.classList.remove('grid-2-cols', 'grid-3-cols'); // limpiar anteriores

            if (itemCount > 2 && itemCount <= 6) {
              labelsContainer.classList.add('grid-2-cols');
            } else if (itemCount > 6) {
              labelsContainer.classList.add('grid-3-cols');
            } else {
              // Por defecto flex normal
            }

            const myChart: any = new Chart(ctxImpact1Uso, {
              type: 'doughnut',
              data: {
                labels: filteredLabels,
                datasets: [
                  {
                    data: filteredPercentages,
                    backgroundColor: filteredColors,
                    borderWidth: 0
                  }
                ]
              },
              options: {
                plugins: {
                  datalabels: {
                    formatter: (value: any) => {
                      return parseFloat(value) === 0 ? null : `${value} %`;
                    },
                    color: '#ffffff',
                    font: { size: 15 }
                  },
                  legend: {
                    display:false
                  }
                }
              },
              plugins: [
                {
                  id: 'centerText',
                  beforeDraw(chart: any, args: any, pluginOptions: any) {
                    const { width, height, ctx }: any = chart;
                    ctx.save();
                    ctx.fillStyle = '#000';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const lines: any = ['Tasa de Impacto', 'marca', 'Empleadora'];
                    const lineHeight: any = 19;

                    const centerY: any = height / 2 - ((lines.length - 1) / 1.6) * lineHeight;

                    lines.forEach((line: any, i: any) => {
                      ctx.fillText(line, width / 2, centerY + i * lineHeight);
                    });

                    ctx.restore();
                  }
                }
              ]
            });
          } else {
            console.error('No se pudo obtener el contexto 2D.');
          }
        } else {
          console.error('El elemento canvas no fue encontrado.');
        }
    } else {
      this.getIndicadores();
    }
  }

async getIndicadores() {
  const result: any = await this.dataservice.getDataFromFilters3(
    this.selectedEstudio.id,
    this.selectedArea,
    this.selectedCargo,
    this.filterSelections
  );

  const grouped: any = {};
  const dotacionTables: any[] = [];

  console.log("result:", result);

  Object.keys(result).forEach((key) => {
    const afterDash = key.split('-')[1]; 
    const beforeDash = key.split('-')[0]; 
    console.log("beforeDash:", beforeDash);
    const [categoryKey, labelKey] = afterDash.split('_'); 

    const rowHeader = categoryKey.replace(/([A-Z])/g, ' $1').trim();
    const label = labelKey.replace(/([A-Z])/g, ' $1').trim();
    const value = parseFloat(result[key]).toFixed(1);

   

    // 👉 Si es Dotación, guardamos cada registro como tabla independiente
    if (beforeDash === "dotación") {
      dotacionTables.push({
        rowHeader: `${rowHeader} - ${label}`, // Ej: "Dotación - Hombres Ant"
        values: [{ label, value }]
      });
    } else {
      // Caso normal: agrupamos
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = {
          rowHeader,
          values: []
        };
      }
      grouped[categoryKey].values.push({ label, value });
    }
  });

  // Transformamos a array
  this.dataSourceIndicadores = [
    ...Object.values(grouped),
    ...dotacionTables // 👉 Agregamos las tablas individuales
  ];

  this.tableAppearsIndicadores = true;

  console.log("Indicadores procesados para la tabla:", this.dataSourceIndicadores);
}

onCargoChange2() {


  // Reseteamos filterSelections a "Todos"
  this.filterDataIndicadores.forEach((filter:any) => {
    this.filterSelections[filter.nombre] = "Todos";
  });

}

// Para definir las columnas del mat-table
get displayedColumnsIndicadores2(): string[] {
  return ['rowHeader', ...this.getTableHeaders()];
}

// Obtenemos los labels de las columnas dinámicas a partir del primer row
getTableHeaders(): string[] {
  if (!this.dataSourceIndicadores || this.dataSourceIndicadores.length === 0) return [];
  return this.dataSourceIndicadores[0].values.map((v:any) => v.label);
}

// Obtenemos el valor de cada celda según el label
getValue(element: any, label: string): any {
  const valueObj = element.values.find((v: any) => v.label === label);
  return valueObj ? valueObj.value : null;
}


  generateCustomLabels(sorted: any[], colorHierarchy: string[], labelContainer: any) {
    if (labelContainer) {
      labelContainer.innerHTML = ''; // Limpiar contenido anterior

      // Aplicar estilos de grid al contenedor
      labelContainer.style.display = 'grid';
      labelContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
      labelContainer.style.gap = '10px';
      labelContainer.style.marginTop = '20px';

      sorted.forEach((item, i) => {
        const labelElement = document.createElement('div');
        labelElement.style.display = 'flex';
        labelElement.style.alignItems = 'center';
        labelElement.style.padding = '6px 8px';
        labelElement.style.borderRadius = '6px';
        labelElement.style.backgroundColor = '#f5f5f5';

        const colorDot = document.createElement('span');
        colorDot.style.display = 'inline-block';
        colorDot.style.width = '14px';
        colorDot.style.height = '14px';
        colorDot.style.borderRadius = '50%';
        colorDot.style.marginRight = '10px';
        colorDot.style.backgroundColor = colorHierarchy[i] || '#ccc';

        const text = document.createElement('span');
        text.style.fontSize = '14px';
        text.style.color = '#000';
        text.style.wordBreak = 'break-word';
        text.textContent = `${item.label}`;

        labelElement.appendChild(colorDot);
        labelElement.appendChild(text);
        labelContainer.appendChild(labelElement);
      });
    }
  }

  // Función para agrupar los registros
  agruparRegistros(registros: any) {
    // Crear un objeto para agrupar los registros por "type"
    const grupos = registros.reduce((acc: any, registro: any) => {
      let { type, key, value } = registro;
  
      // Convertir la clave eliminando "_" y poniendo en formato legible
      const formattedKey = key
        .replace(/_/g, ' ') // Reemplaza "_" por espacio
        .replace(/\b(Promedio|Moda)\b/, '') // Elimina "Promedio" y "Moda"
        .trim(); // Elimina espacios extra al inicio y final
  
      // Si no existe el grupo para este tipo, lo creamos
      if (!acc[type]) {

        acc[type] = {
          rowHeader: `Rol ${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}`
        };
      }
  
      // Asignamos el valor con la clave formateada
      acc[type][formattedKey] = value;
  
      return acc;
    }, {});
  
    // Convertimos el objeto en un array para dataSource3
    this.dataSource3 = Object.values(grupos);
  
    // Obtener todas las claves de los objetos en dataSource3
    const allKeys = this.dataSource3.reduce((keys: Set<string>, row: any) => {
      Object.keys(row).forEach(key => keys.add(key)); // Añadir cada clave al Set
      return keys;
    }, new Set<string>());
  
    // Convertir el Set de claves a un array y asignarlo a displayedColumns3, excluyendo "rowHeader"
    this.displayedColumns3 = Array.from(allKeys).filter(key => key !== 'rowHeader');
  }

   // Función para agrupar los registros
   agruparRegistros2(registros: any) {
    // Crear un objeto para agrupar los registros por "type"
    const grupos = registros.reduce((acc: any, registro: any) => {
      const { type, key, value } = registro;
  
      // Convertir la clave eliminando "_" y poniendo en formato legible
      const formattedKey = key
        .replace(/_/g, ' ') // Reemplaza "_" por espacio
        .replace(/\b(Promedio|Moda)\b/, '') // Elimina "Promedio" y "Moda"
        .trim(); // Elimina espacios extra al inicio y final
  
      // Si no existe el grupo para este tipo, lo creamos
      if (!acc[type]) {
        acc[type] = {
          rowHeader: `Rol ${type}`
        };
      }
  
      // Asignamos el valor con la clave formateada
      acc[type][formattedKey] = value;
  
      return acc;
    }, {});
  
    // Convertimos el objeto en un array para dataSource3
    this.dataSource2 = Object.values(grupos);
  
    // Obtener todas las claves de los objetos en dataSource3
    const allKeys = this.dataSource2.reduce((keys: Set<string>, row: any) => {
      Object.keys(row).forEach(key => keys.add(key)); // Añadir cada clave al Set
      return keys;
    }, new Set<string>());
  
    // Convertir el Set de claves a un array y asignarlo a displayedColumns3, excluyendo "rowHeader"
    this.displayedColumns2 = Array.from(allKeys).filter(key => key !== 'rowHeader');
  }

  
  

  filterRows() {
    this.dataSource2 = this.dataSource2.filter(row => {
      // Verifica si hay algún valor diferente de "0" en las columnas relevantes
      return this.displayedColumns2.some(column => row[column] !== "0");
    });
  }


  filterRows2() {
    this.dataSource3 = this.dataSource3.filter((row: any) => {
      // Verifica si hay algún valor diferente de "0" en las columnas relevantes
      return this.displayedColumns3.some(column => row[column] !== "0");
    });
  }


  filterRows3() {
    this.dataSourceIndicadores = this.dataSourceIndicadores.filter(row => {
      // Verifica si hay algún valor diferente de "0" en las columnas relevantes
      return this.displayedColumnsIndicadores.some((column:any) => row[column] !== "0");
    });
  }

  // Método mejorado para formatear el nombre del grupo
  formatGroupName(groupName: string): string {
    // Insertar un espacio antes de cada letra mayúscula
    let formattedName = groupName.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Reemplazos específicos para mejorar la legibilidad
    const replacements: { [key: string]: string } = {
      'por': 'por',
      'de': 'de',
      'y': 'y'
    };

    // Transformamos la primera letra de cada palabra a mayúscula
    formattedName = formattedName.split(' ').map(word => {
      // Si es una palabra de las excepciones (como "por", "de", etc.), no cambiar a mayúscula
      if (replacements[word.toLowerCase()]) {
        return replacements[word.toLowerCase()];
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');

    return formattedName;
  }

  // Método mejorado para formatear el nombre del grupo
  formatKeyName(groupName: string): string {
    // Insertar un espacio antes de cada letra mayúscula
    let formattedName = groupName.replace(/([a-z])([A-Z])/g, '$1 $2');

    return formattedName;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  objectToArray(obj: any): any[] {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  transformData(data: any) {
    const groupedData: any = [];

    Object.keys(data).forEach(key => {
      // Separar la clave en partes tomando el primer campo antes del guion
      const [grupoPrincipal, restoClave] = key.split('-');
      const [nombreClave, generoAño] = restoClave.split(/_(?=[A-Za-z]+)/);

      // Si no existe el grupo principal en el objeto agrupado, inicializarlo
      if (!groupedData[grupoPrincipal]) {
        groupedData[grupoPrincipal] = {};
      }

      // Si no existe el subgrupo en el grupo principal, inicializarlo
      if (!groupedData[grupoPrincipal][nombreClave]) {
        groupedData[grupoPrincipal][nombreClave] = {
          hombresAnt: null,
          mujeresAnt: null,
          hombresAño: null,
          mujeresAño: null,
          totalEmpresaAño: null,
          totalEmpresaAnt: null
        };
      }

      // Llenar los campos de cada subgrupo según el sufijo de la clave
      if (generoAño?.includes('HombresAnt')) {
        groupedData[grupoPrincipal][nombreClave].hombresAnt = data[key];
      } else if (generoAño.includes('MujeresAnt')) {
        groupedData[grupoPrincipal][nombreClave].mujeresAnt = data[key];
      } else if (generoAño.includes('HombresAño')) {
        groupedData[grupoPrincipal][nombreClave].hombresAño = data[key];
      } else if (generoAño.includes('MujeresAño')) {
        groupedData[grupoPrincipal][nombreClave].mujeresAño = data[key];
      } else if (generoAño.includes('TotalEmpresaAño')) {
        groupedData[grupoPrincipal][nombreClave].totalEmpresaAño = data[key];
      } else if (generoAño.includes('TotalEmpresaant')) {
        groupedData[grupoPrincipal][nombreClave].totalEmpresaAnt = data[key];
      }
    });

    return groupedData;
  }

  formatTypeNumberCompensacion(value: string, column: string, row: any): string {

    if (typeof value === 'string') {
      // Detectar si la cadena usa coma como separador decimal
      if (value.includes(',')) {
        // Eliminar puntos de los miles (antes de la coma decimal) y cambiar la coma por punto
        value = value.replace(/\./g, '').replace(',', '.');
      }
    }
    if (!value) return ''; // Devuelve una cadena vacía si el valor es nulo o indefinido
  
    // Convertir el valor a número
    let numberValue = parseFloat(value);
  
    // Verifica si el valor es un número válido
    if (isNaN(numberValue)) {
      return 'N/A'; // Devuelve 'N/A' si no es un número
    }
  
    // Verifica si la fila (row.rowHeader) corresponde a un Coef. Var.
    if (row.rowHeader && row.rowHeader.includes('Coef Var')) {
      console.log("ENTRA COEF");
      return `${numberValue}%`;
    }
  
    // Redondear en lugar de truncar
    numberValue = Math.round(numberValue);
  
    // Formatear el número con separador de miles
    const formattedValue = new Intl.NumberFormat('de-DE').format(numberValue);
  
    // Retornar el valor con el símbolo de moneda
    return `$${formattedValue}`;
  }
  

  formatNumber(value: string): string {
    if (value !== 'N/A') {
      const numberValue = parseFloat(value);
      return isNaN(numberValue) ? '0' : numberValue.toLocaleString();
    }
    return "N/A";
  }

  formatPercentage(value: string): string {
    return (parseFloat(value) * 100).toFixed(0) + '%';
  }

  applyFilter(column: string, value: string) {
    if (column === 'industria') {
      this.origen = value;
    }

    if (column === 'Tramo Ventas') {
      this.antiguedad = value;
    }

    if (column === 'tipoContrato') {
      this.tipoContrato = value;
    }

    if (column === 'tasaUso') {
      this.tasaUso = value;
    }

    if (column === 'cargo') {
      this.columnCargo = value;
    }
    if (column === 'bene') {
      this.beneficio = value;
    }
  }

  applyFilter2(column: string, value: string) {
    if (value === 'Beneficios Orientados a Mejorar el poder adquisitivo') {
      this.allBeneficios = [];
      this.allBeneficios.push("Beneficio de Colación");
    } else {
      this.allBeneficios = [];
      this.allBeneficios.push("Beneficio de Financiamiento de Magister/MBA");
    }
  }

 generatePDFBeneficio(loading: any) {
  this.loadingbool = true;
  const dialogConfig = new MatDialogConfig();
  dialogConfig.width = '400px';
  dialogConfig.height = 'auto';
  dialogConfig.hasBackdrop = false; // ❌ desactiva el fondo gris
  this.dialog.open(loading, dialogConfig);

  const contenido = document.getElementById('contenidoParaImprimirBen');
  const bloquePDF = document.getElementById('bloquepdfben');
  if (!contenido || !bloquePDF) return;

  // Ajustes iniciales
  contenido.style.overflow = 'visible';
  contenido.style.height = 'auto';
  contenido.style.width = '100%';

  // Mostrar sliders ocultos y actualizar charts
  const hiddenSlides = contenido.querySelectorAll('.slides3');
  hiddenSlides.forEach((slide) => {
    (slide as HTMLElement).style.display = 'block';
    const charts = slide.querySelectorAll('canvas');
    charts.forEach((c) => {
      const chartInstance = Chart.getChart(c as HTMLCanvasElement);
      if (chartInstance) chartInstance.update();
    });
  });
  const hiddenSlides2 = contenido.querySelectorAll('.prev, .next');
  hiddenSlides2.forEach((slide) => (slide as HTMLElement).style.display = 'none');
  const hiddenSlides3 = contenido.querySelectorAll('.carousel-inner');
  hiddenSlides3.forEach((slide) => (slide as HTMLElement).style.display = 'block');

  // Crear PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const bloques = contenido.querySelectorAll('.bloquePDF');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const headerHeight = 20; // espacio para el header
  const footerHeight = 14; // espacio para el footer

  const renderNextBlock = (index: number) => {
    if (index >= bloques.length) {
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      // Restaurar estado original
      hiddenSlides.forEach((slide) => (slide as HTMLElement).style.display = '');
      hiddenSlides2.forEach((slide) => (slide as HTMLElement).style.display = '');
      hiddenSlides3.forEach((slide) => (slide as HTMLElement).style.display = '');
      contenido.style.overflow = '';
      contenido.style.height = '';

      // Cerrar el modal
      this.closeModal();
      loading.close();
      return;
    }

    const bloque = bloques[index] as HTMLElement;

    // Ajustar ancho automático para html2canvas
    const originalWidth = bloque.style.width;
    bloque.style.width = 'auto';

    html2canvas(bloque, { scale: 2, useCORS: true }).then((canvas) => {
      bloque.style.width = originalWidth; // restaurar

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Ajustar para header y footer
      const availableHeight = pageHeight - margin * 2 - headerHeight - footerHeight;
      const scale = imgHeight > availableHeight ? availableHeight / imgHeight : 1;

      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;

      const x = (pageWidth - finalWidth) / 2;
      const y = margin + headerHeight; // debajo del header

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, finalWidth, finalHeight);

      // 🟢 HEADER FIJO
      const logoUrl = "/assets/img/logo-oscuro.png";
      pdf.addImage(logoUrl, "PNG", 10, 6, 25, 13); // (x, y, width, height)

      // 🟣 FOOTER FIJO
      const footerLines = [
        "© 2025 Estudios Clou HR. Los documentos alojados en nuestra plataforma son propiedad intelectual de Clou HR.",
        "Prohibida toda reproducción total o parcial sin previa autorización de Clou HR.",
      ];
      pdf.setFontSize(7);
      const lineHeight = 4;
      const startY = pageHeight - footerHeight;
      footerLines.forEach((line, i) => {
        pdf.text(line, pageWidth / 2, startY + i * lineHeight, { align: "center" });
      });

      if (index < bloques.length - 1) pdf.addPage();
      renderNextBlock(index + 1);
    });
  };

  renderNextBlock(0);
}

  generatePDF(contenidoId: any, loading: any) {
    this.loadingbool = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = 'auto';
    dialogConfig.hasBackdrop = false;
    this.dialog.open(loading, dialogConfig);

    const contenido = document.getElementById(contenidoId);
    if (!contenido) return;

    // Ajustes temporales de estilo
    contenido.style.overflow = 'visible';
    contenido.style.height = '100%';
    contenido.style.paddingTop = '3px';

    // Convertir canvases a imágenes
    const canvases = contenido.querySelectorAll('canvas');
    canvases.forEach((canvas) => {
      const img = document.createElement('img');
      img.src = (canvas as HTMLCanvasElement).toDataURL('image/png');
      img.style.width = canvas.width + 'px';
      img.style.height = canvas.height + 'px';
      canvas.parentNode?.replaceChild(img, canvas);
    });

    html2canvas(contenido, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();

      // Márgenes horizontales
      const margin = 10; // mm
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Centrar horizontalmente
      const x = margin;

      // HEADER
      const logoUrl = "/assets/img/logo-oscuro.png";
      pdf.addImage(logoUrl, "PNG", margin, 6, 25, 13);

      // Contenido principal con margen lateral
      pdf.addImage(imgData, 'PNG', x, 25, imgWidth, imgHeight);

      // FOOTER
      const footerLines = [
        "© 2025 Estudios Clou HR. Los documentos alojados en nuestra plataforma son propiedad intelectual de Clou HR.",
        "Prohibida toda reproducción total o parcial sin previa autorización de Clou HR.",
      ];

      pdf.setFontSize(7);
      const lineHeight = 4;
      const startY = pdf.internal.pageSize.getHeight() - 14;

      footerLines.forEach((line, index) => {
        pdf.text(line, pageWidth / 2, startY + index * lineHeight, { align: "center" });
      });

      // Generar Blob + abrir en nueva pestaña
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl);

      // Restaurar estilos
      contenido.style.overflow = '';
      contenido.style.height = '';

      // Cerrar modal
      this.closeModal();
      loading.close();
    });
  }


  logOut() {
    localStorage.removeItem('userData');
    this.router.navigateByUrl("/login");
  }

parseValue(value: any, row: any, column: string) {
  if (typeof value === 'string') {
    value = value.replace(/\$/g, ''); // elimina $ para convertir
    if (value.includes(',')) {
      value = value.replace(/\./g, '').replace(',', '.');
    }
  }

  let numericValue = parseFloat(value);
  if (isNaN(numericValue)) return 'N/A';

  // Coef Var → porcentaje
  if (row.rowHeader && row.rowHeader.includes('Coef Var')) {
    let percentageValue = (numericValue * 100).toFixed(0);
    return `${percentageValue}%`;
  }

  // --- AHORA Promedio SIEMPRE LLEVA $ ---
 

  // Resto → con o sin $
  numericValue = Math.round(numericValue);
  const formattedValue = new Intl.NumberFormat('de-DE').format(numericValue);

  if (
    this.selectedArea === 'Días libres' ||
    this.selectedArea === 'Fallecimiento Familiar Directo - Días Libres' ||
    this.selectedArea === 'Matrimonio y AUC - Días libres sobre lo legal' ||
    this.selectedArea === 'Permiso con goce de sueldo' ||
    this.selectedArea === 'Permiso sin goce de sueldo' ||
    this.selectedArea === 'Vacaciones - Días adicionales' ||
    this.selectedArea === 'Antigüedad - Días Libres' ||
    this.selectedArea === 'Nacimiento - Días libres sobre lo legal'
  ) {
    return `${formattedValue}`;
  } else {
    return `$${formattedValue}`;
  }
}



  imprimirContenido() {
    const contenido = document.getElementById('contenidoParaImprimir');
    if (contenido) {
      html2canvas(contenido, { scale: 2 }).then(canvas => { // Escala mayor para mejor calidad
        const ventanaImpresion = window.open('', '', 'width=1200,height=600');
        if (ventanaImpresion) {
          ventanaImpresion.document.write('<html><head><title>Imprimir Contenido</title></head><body>');
          ventanaImpresion.document.write(`
            <style>
              @media print {
                @page {
                  size: A4 portrait; /* Configuración para impresión en vertical */
                  margin: 20mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: flex-start;
                }
                canvas {
                  display: block;
                  margin: 0;
                  width: 100%;
                  height: auto; /* Mantener proporciones */
                }
              }
            </style>
          `);

          // Ajusta el tamaño del canvas para ocupar todo el ancho de la página
          canvas.style.width = '100%';
          canvas.style.height = 'auto'; // Mantener proporciones

          ventanaImpresion.document.body.appendChild(canvas);
          ventanaImpresion.document.write('</body></html>');
          ventanaImpresion.document.close();
          ventanaImpresion.onload = () => {
            ventanaImpresion.print();
            ventanaImpresion.close();
          };
        }
      });
    }
  }


  openFiles(modal: any, estudio: any) {
    this.estudioSelected = estudio;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '900px';
    dialogConfig.height = 'auto';
    this.dialog.open(modal, dialogConfig)
  }

  getNameDataPublish(entrada: string): string {
    if (!entrada) return '';
    if(entrada === 'cortesia'){
      entrada = 'cortesía'
    }
    return entrada.charAt(0).toUpperCase() + entrada.slice(1);
  }


}


