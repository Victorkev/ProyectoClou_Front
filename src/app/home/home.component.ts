import { ArrayDataSource, SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Injectable, TemplateRef, ViewChild, forwardRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationStart, Router, Event, ActivatedRoute } from '@angular/router';
import { DataserviceService } from '../services/dataservice.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { filter } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatTabGroup } from '@angular/material/tabs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ExpressionStatement } from '@angular/compiler';
import { MatCheckboxChange } from '@angular/material/checkbox';

// Define la traducción para el nombre del mes en español
moment.locale('es', {
  months: [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
    "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
});

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  isExpanded?: boolean;
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

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [

];

export interface EstudioData {
  nameStudio: string;
  CantidadEmpresas: number;
  CantidadPreguntas: number;
  CantidadRespuestas: number;
  CantidadUsuarios: number;
  // Campos adicionales para los detalles expandidos
  position?: number;
  symbol?: string;
  name?: string;
  weight?: number;
  description?: string;
}

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Items por página: '; // Cambia el texto aquí
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('100ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),

  ]
})


export class HomeComponent {
  dataSource = new ArrayDataSource(TREE_DATA);
  displayedColumns: string[] = ['id', 'fecha', 'tipo', 'entrega', 'titulo', 'user', 'estado', 'acciones', 'surveys', 'seleccionar', 'delete'];
  displayedColumnsEstudiesActive: string[] = ['id', 'fecha', 'tipo', 'titulo', 'estado', 'acciones', 'validar', 'consolidado'];
  displayedColumnsEncuesta: string[] = ['id', 'tituloEncuesta', 'tipoEncuesta', 'estudio'];
  displayedColumnsAsginar: string[] = ['id', 'estado', 'fecha', 'titulo', 'tipo', 'month', 'year'];
  displayedColumnsResultados: string[] = ['id', 'fecha', 'fechaPub', 'tipo', 'titulo', 'estado', 'consolidado', 'cargos', 'pdf', 'addUsers', 'publish'];
  displayedColumnsEmpresa: string[] = ['empresaName', 'nombre', 'email', 'tipo'];
  displayedColumnsMetrics: string[] = ['preguntas', 'respuestas'];
  activeEstudios: boolean = false;
  activeEncuesta: boolean = false;
  activeAsignar: boolean = false;
  activeRespuestas: boolean = false;
  activeEntregas: boolean = false;
  activeEmpresas: boolean = false;
  activeMetrics: boolean = false;
  user: any;

  dataSource2 = new MatTableDataSource(ELEMENT_DATA);
  dataSourceEncuesta = new MatTableDataSource(ELEMENT_DATA);

  dataSourceEmpresa = new MatTableDataSource(ELEMENT_DATA);
  columnsToDisplayWithExpand = [...this.displayedColumnsEmpresa, 'expand'];

  dataSourceRespuestas = new MatTableDataSource(ELEMENT_DATA);
  dataSourceResultados = new MatTableDataSource(ELEMENT_DATA);

  dataSourceMetrics = new MatTableDataSource(ELEMENT_DATA);
  columnsToDisplay: string[] = ['id', 'fecha', 'nombreEstudios', 'empresas', 'usuarios', 'preguntas', 'respuestas', 'tasaRespuesta', 'tasaCumplimiento', 'archivos'];
  dataSourceFilterMetrics = new MatTableDataSource<EstudioData>();
  columnsToDisplayWithExpand2: string[] = [...this.columnsToDisplay, 'expand'];
  expandedElement2: any | null = null;


  expandedElement: any = null;
  selectedMonth: any;
  selectedYear: string = "";
  allYear: any[] = [];
  allMonth: any[] = [];
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );
  paginadorBoolean: boolean = true;
  @ViewChild('paginador') paginador!: MatPaginator;
  @ViewChild('paginador2') paginador2!: MatPaginator;
  @ViewChild('paginador3') paginador3!: MatPaginator;
  @ViewChild('paginador4') paginador4!: MatPaginator;
  @ViewChild('paginador5') paginador5!: MatPaginator;
  @ViewChild('paginadorMetrics') paginadorMetrics!: MatPaginator;
  @ViewChild('status') statusTemplate: any = TemplateRef<any>;

  selectedOption: string = "";
  allEstudios: any[] = [];
  estudios: any[] = [];
  data: any;
  eventStatus: boolean = false;
  eventStatusLoading: boolean = false;
  allInProcess: any[] = [];
  allMetrics: any[] = [];
  firstLetter: any;
  type: any;
  name: any;
  allStatus: any = ["Nuevo", "Vigente", "Procesando", "Publicado"];
  allStatusMetrics: any = ["Vigente", "Procesando", "Publicado"];
  allStatusResultados: any = ["Procesando", "Publicado"]
  selectedStatus: any;
  selectedEmpresa: any;
  allFilter: any = [];
  months = [{ "id": 1, "mes": "Enero" }, { "id": 2, "mes": "Febrero" }, { "id": 3, "mes": "Marzo" }, { "id": 4, "mes": "Abril" }, { "id": 5, "mes": "Mayo" }, { "id": 6, "mes": "Junio" }, { "id": 7, "mes": "Julio" }, { "id": 8, "mes": "Agosto" }, { "id": 9, "mes": "Septiembre" }, { "id": 10, "mes": "Octubre" }, { "id": 11, "mes": "Noviembre" }, { "id": 12, "mes": "Diciembre" }];
  allStudyType: any[] = [];
  allEntregaType: any[] = [];
  selectedType: any;
  selectedEntrega: any;
  selectedSearch: string = 'id';
  inputSearch: any;
  inputSearchId: any;
  selectedMonthSring: any;
  selectedUser:any;
  allUserStudy:any[]=[];
  tab1: any;
  tab2: any;
  tab3: any;
  previousUrl: string = "";
  selectedTabIndex: number = 0;
  @ViewChild('tabGroup') tabGroup: any = MatTabGroup;
  dataStudySelected: any;
  activeTab: number = 0;
  fileNames: any[] = [];
  dataEmpresaModal: any;
  dataModalUser: any;
  arrayUser: any[] = [];
  dataDel: any;
  dataDel2: any;
  dataDel3: any;
  selectedOptionRes: string = 'agregar';
  options = [
    { value: 'preguntas', label: 'Preguntas' },
    { value: 'empresas', label: 'Empresas' },
    { value: 'formularios', label: 'Formularios' }
  ];
  id: any;
  empresas: any[] = [];
  empresasForm: any = FormGroup;
  allSelectedEmpresa: any[] = [];
  allSelectedUserEmpresa: any[] = [];
  isCheckedEmpresa: boolean[] = [];
  isCheckedEmpresaPeople: boolean[] = [];
  pollSelectedEmpresa: any;
  userByEmpresa: any;
  isCheckedEmpresaAll: boolean = false;
  menuVisible: boolean = false;
  estudioSelected: any;
  isMenuOpen: number | null = null;
  @ViewChild('createStudy') createStudy: any = TemplateRef<any>;
  dialogRef: any = MatDialogRef<any>;
  dropdownLeft: number = 0;
  dropdownTop: number = 0;
  isDropdownOpen = false;
  activeSwitchNew: boolean = false;
  activeSwitchEnable: boolean = false;
  activeSwitchProcessing: boolean = false;
  activeSwitchPublish: boolean = false;
  showIcons: boolean = true;
  activeInput: boolean = false;
  filteredArrayUser: any[] = [];
  filteredArrayType: any[] = [];
  allStudyName: any[] = [];
  allSelected = false;
  selection = new SelectionModel<string>(true, []);
  studyControl = new FormControl();
  // Dentro de tu clase del componente:
  metricsForm: any = FormGroup;
  displayedColumnsObs: string[] = ['fecha', 'empresa', 'usuario', 'correo', 'formulario', 'estado', 'observaciones', 'validar', 'consolidarEmpresa'];
  selectedStudyResponse: any;
  isEntrega: boolean = false;
  dataSourceObs = new MatTableDataSource();
  activeObsTable: boolean = false;
  dataMetrics: any[] = [];
  showTablesMetrics: boolean = false;
  obsSelected: any;
  showOriginalColumn: boolean = false;
  fieldObs: string = "";
  selectedStatusObs: any;
  selectedFormValidate: any;
  uniqueEmpresas: string[] = [];
  selectedOptionEmpresaValidar: string = '';
  msgModalBasePlana:string = "";
  uniqueStatus: any[] = [];
  selectedStatusEmpresaValidar: string = '';
  txtMsgPublish:string = "";
  activateUserFilter:boolean = false;
  activeIDFilter:boolean = true;
  activateNameFilter:boolean = false;
  @ViewChild('dialogWelcome', { static: true }) dialogWelcome!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  booleanObs:boolean = false;
  origen: string = 'admin';

  constructor(private router: Router,
    private cdr: ChangeDetectorRef,
    private dataservice: DataserviceService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private el: ElementRef) { }

  async ngOnInit() {
    this.user = this.dataservice.userData;
    console.log("USER:", this.user);
    this.route.queryParams.subscribe(params => {
      this.activeTab = +params['tab'] || 0;
      this.updateTabContent(this.activeTab);
    });

    console.log("onInitTab:", this.activeTab);
    let array: any = [];
    let arrayResultados: any = [];
    this.dataservice.getEstudies().then((result: any) => {
      this.allEstudios = result;
      console.log("allestudios:", this.allEstudios);
      result.forEach(async (element: any) => {
        if (!this.allUserStudy.includes(element.usuario)) {
          this.allUserStudy.push(element.usuario);
        }
        if (element.status === 2) {
          // Suponiendo que this.allInProcess es un array de objetos con un campo id numérico
          this.allInProcess.push(element);

          // Ordenar this.allInProcess por el campo id
          this.allInProcess.sort((a, b) => b.id - a.id);

          // Actualizar el origen de datos de tu dataSourceRespuestas
          this.dataSourceRespuestas.data = this.allInProcess;
        }
        if (element.status === 2 || element.status === 3) {
          // Suponiendo que this.allInProcess es un array de objetos con un campo id numérico
          this.allMetrics.push(element);

          // Ordenar this.allInProcess por el campo id
          this.allMetrics.sort((a, b) => b.id - a.id);

        }
        if (element.status === 3 || element.status === 4) {
          arrayResultados.push(element);
          arrayResultados.sort((a: any, b: any) => b.id - a.id);
          this.dataSourceResultados.data = arrayResultados;
        }
        element.surveys.forEach((survey: any) => {
          survey.idEstudio = element.id;
          array.push(survey);
          this.dataSourceEncuesta.paginator = this.paginador2;
        });
        let studyType = this.capitalizarPrimeraLetra(element.tipeStudies);
        let entregaType = this.capitalizarPrimeraLetra(element.Entrega);

        this.allStudyType.push(studyType);
        this.allStudyType = Array.from(new Set(this.allStudyType));

        if (element.Entrega === 'normal' || element.Entrega === 'cortesia') {
          this.allEntregaType.push(entregaType);
          this.allEntregaType = Array.from(new Set(this.allEntregaType));
        }

        this.allYear.push(moment(element.create).format("YYYY"));
        this.allYear = Array.from(new Set(this.allYear));
        const nombresMeses = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        this.allMonth.push(moment(element.create).format("MMMM"));
        this.allMonth = Array.from(new Set(this.allMonth));
        this.allStudyName.push(element);

      });

      this.filteredArrayType = this.allStudyName.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.tipeStudies === value.tipeStudies && /^[A-Z]/.test(value.tipeStudies)
        ))
      );

      // Ordena el arreglo para que "Compensación" aparezca primero
      this.filteredArrayType.sort((a, b) => {
        if (a.tipeStudies === "Compensacion") {
          return -1; // "Compensación" se coloca antes
        }
        if (b.tipeStudies === "Compensacion") {
          return 1; // "Compensación" se coloca después
        }
        return 0; // Mantén el orden original para los demás
      });

      this.dataMetrics = this.filteredArrayType;

      this.dataSourceEncuesta.data = array.reverse(); // Crear una nueva instancia de MatTableDataSource
      this.estudios = result;

      this.dataSource2 = new MatTableDataSource(result.reverse());
      this.dataSource2.paginator = this.paginador;
    })

    // trae todas las empresas
    this.dataservice.getEmpresas().then((empresa: any) => {
      this.empresas = empresa;
      this.arrayUser = []; // Asegúrate de inicializar o vaciar arrayUser antes de agregar datos
      empresa.forEach((empresaItem: any) => {

        empresaItem.personal.forEach((personalItem: any) => {
          // Añadir empresaName a cada objeto personal
          personalItem.empresaName = empresaItem.empresaName;
          this.arrayUser.push(personalItem);
        });
      });

      // Ordenar arrayUser alfabéticamente por empresaName
      this.arrayUser.sort((a, b) => b.empresaName.localeCompare(a.empresaName));

      console.log("empresas:", this.arrayUser);
      this.dataSourceEmpresa.data = this.arrayUser.reverse();

      this.filteredArrayUser = this.arrayUser.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.empresaName === value.empresaName
        ))
      );

      this.dataSourceEmpresa.paginator = this.paginador5;
    });

    this.firstLetter = this.user.personal.nombre[0];
    this.name = this.user.personal.nombre.charAt(0).toUpperCase() + this.user.personal.nombre.slice(1);
    this.type = this.user.role[0].roleName;
    console.log("user:", this.user);
    this.activeEstudios = true;
    this.metricsForm = new FormGroup({
      studyType: new FormControl(''),
      studyStatus: new FormControl(''),
      studyName: new FormControl(''),
      studyEntrega: new FormControl(''),
      studyYear: new FormControl('')
    });
  }

  ngAfterViewInit() {
    console.log("selectedTab:", this.activeTab);
    this.updateTabContent(this.activeTab);
  }

  getFormatDate(date: any) {
    return moment(date).format("DD-MM-YYYY HH:mm");
  }

  abrirDialog(): void {
    this.dialog.open(this.dialogWelcome, {
      panelClass: 'dialog-with-blue-bg'
    });
  }

  closeModal(){
    this.dialog.closeAll();
  }

  toggleIconsVisibility() {
    this.showIcons = !this.showIcons;

    if (this.showIcons) {
      this.displayedColumns = ['id', 'fecha', 'tipo', 'entrega', 'titulo', 'icon1', 'icon2', 'icon3', 'seleccionar', 'estado', 'acciones', 'surveys', 'delete'];
    } else {
      this.displayedColumns = this.displayedColumns.filter(column => !['icon1', 'icon2', 'icon3'].includes(column));
    }
  }

  toggleMenu2(index: number, event: MouseEvent): void {
    this.isMenuOpen = this.isMenuOpen === index ? null : index;

    if (this.isMenuOpen !== null) {
      const buttonElement = event.target as HTMLElement;
      const rect = buttonElement.getBoundingClientRect();

      // Posiciona el dropdown justo debajo del botón
      this.dropdownLeft = rect.left;
      this.dropdownTop = rect.bottom; // Esto coloca el menú justo debajo del botón
    }
  }



  toggleAllSelection() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selection.select(...this.allStudyName);
    } else {
      this.selection.clear();
    }
    this.studyControl.setValue(this.selection.selected);
  }

  onSelectionChange(study: string, event: MatCheckboxChange) {
    const isChecked = event.checked;
    if (isChecked) {
      this.selection.select(study);
    } else {
      this.selection.deselect(study);
    }
    this.studyControl.setValue(this.selection.selected);
  }

  toggleMenu(index: number): void {
    // Si el menú actualmente abierto es el mismo, ciérralo
    if (this.isMenuOpen === index) {
      this.isMenuOpen = null;
    } else {
      // De lo contrario, abre el menú seleccionado
      this.isMenuOpen = index;
    }
  }

  toggleOriginalColumn() {
    this.showOriginalColumn = !this.showOriginalColumn;
    if (this.showOriginalColumn) {
      this.displayedColumnsObs.push('original');
    } else {
      this.displayedColumnsObs = this.displayedColumnsObs.filter(column => column !== 'original');
    }
  }

  async downloadPDF(element: any) {
    console.log("element:", element);
    let ready = false;
    if (window.location.host === "localhost:4200" || window.location.host === "200.63.98.203") {
      window.location.href = "http://200.63.98.203:9010/" + element.urlFile;
      //this.reloadPage();
    } else {
      window.location.href = element.urlFile;
    }
  }

  updateTabContent(tabIndex: number) {
    console.log("tabIndex:", tabIndex);
    const document0 = document.getElementById('estudios');
    const document1 = document.getElementById('encuestas');
    const document2 = document.getElementById('resultados');
    const document3 = document.getElementById('entregas');
    const document4 = document.getElementById('metrics');

    if (document0 && document1 && document2 && document3 && document4) {
      document0.style.display = tabIndex === 0 ? 'flex' : 'none';
      document1.style.display = tabIndex === 1 ? 'flex' : 'none';
      document2.style.display = tabIndex === 2 ? 'flex' : 'none';
      document3.style.display = tabIndex === 3 ? 'flex' : 'none';
      document4.style.display = tabIndex === 5 ? 'flex' : 'none';
    }

    this.updateActiveFlags(tabIndex);
  }

  updateActiveFlags(tabIndex: number) {
    this.activeEstudios = tabIndex === 0;
    this.activeEncuesta = tabIndex === 1;
    this.activeRespuestas = tabIndex === 2;
    this.activeEntregas = tabIndex === 3;
    this.activeMetrics = tabIndex === 5;
  }

  capitalizarPrimeraLetra(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  isFirstInGroupEmpresa(empresaName: string, index: number): boolean {
    if (index === 0) {
      return true; // Si es el primer elemento, siempre devuelve true
    }

    // Compara con el elemento anterior en el array
    return this.allSelectedUserEmpresa[index - 1].empresa.empresaName !== empresaName;
  }

  // Método para obtener el índice de una persona por su ID
  private getPersonaIndex(id: number): number {
    for (let i = 0; i < this.empresas.length; i++) {
      for (let j = 0; j < this.empresas[i].personal.length; j++) {
        if (this.empresas[i].personal[j].id === id) {
          return j;
        }
      }
    }
    return -1;
  }

  toggleCheckedEmpresaAll(checked: boolean): void {
    // Marca todas las empresas como seleccionadas o no seleccionadas
    this.isCheckedEmpresa = this.empresas.map(() => checked);

    // Actualiza el array allSelectedEmpresa basado en la selección
    if (checked) {
      this.allSelectedEmpresa = [...this.empresas];
    } else {
      this.allSelectedEmpresa = [];
    }

    // Marca a todo el personal de cada empresa como seleccionado o no seleccionado
    this.isCheckedEmpresaPeople = this.empresas.flatMap(empresa =>
      empresa.personal.map(() => checked)
    );
  }

  toggleCheckedEmpresa(empresa: any, index: number): void {
    this.isCheckedEmpresa[index] = !this.isCheckedEmpresa[index];

    if (this.isCheckedEmpresa[index]) {
      empresa.personal.forEach((persona: any) => {
        persona.empresa = empresa;
        if (!this.allSelectedUserEmpresa.some((selectedPersona: any) => selectedPersona.id === persona.id)) {
          this.allSelectedUserEmpresa.push(persona);
        }
        // Actualiza el estado de los checkboxes de las personas
        const personaIndex = this.getPersonaIndex(persona.id);
        if (personaIndex !== -1) {
          this.isCheckedEmpresaPeople[personaIndex] = true;
        }
      });
    } else {
      empresa.personal.forEach((persona: any) => {
        const personaIndex = this.allSelectedUserEmpresa.findIndex((selectedPersona: any) => selectedPersona.id === persona.id);
        if (personaIndex !== -1) {
          this.allSelectedUserEmpresa.splice(personaIndex, 1);
        }
        // Actualiza el estado de los checkboxes de las personas
        const index2 = this.getPersonaIndex(persona.id);
        if (index2 !== -1) {
          this.isCheckedEmpresaPeople[index2] = false;
        }
      });
    }
    console.log("personaEmpresa:", this.allSelectedUserEmpresa);
  }

  toggleCheckedEmpresaPeople(persona: any, index: number, empresa: any): void {
    const isChecked = !this.isCheckedEmpresaPeople[index];
    this.isCheckedEmpresaPeople[index] = isChecked;

    if (isChecked) {
      persona.empresa = empresa;
      if (!this.allSelectedUserEmpresa.some((selectedPersona: any) => selectedPersona.id === persona.id)) {
        this.allSelectedUserEmpresa.push(persona);
      }
    } else {
      const personaIndex = this.allSelectedUserEmpresa.findIndex((selectedPersona: any) => selectedPersona.id === persona.id);
      if (personaIndex !== -1) {
        this.allSelectedUserEmpresa.splice(personaIndex, 1);
      }

      // Verifica si hay alguna persona seleccionada en la empresa
      const allPeopleDeselected = empresa.personal.every((p: any) =>
        !this.allSelectedUserEmpresa.some((selectedPersona: any) => selectedPersona.id === p.id)
      );

      if (allPeopleDeselected) {
        this.isCheckedEmpresa[this.empresas.indexOf(empresa)] = false;
      }
    }
  }

  sortData(event: any) {
    console.log("event", event);
    const data = this.dataSource2.data.slice(); // Copia de los datos para no modificar el original
    if (!this.dataSource2.sort || !event.active || event.direction === '') {
      this.dataSource2.data = data;
      return;
    }

    this.dataSource2.data = data.sort((a: any, b: any) => {
      const isAsc = event.direction === 'asc';
      switch (event.active) {
        case 'id':
          return this.compare(a.id, b.id, isAsc);
        case 'estado':
          return this.compare(a.status, b.status, isAsc);
        case 'fecha':
          return this.compare(new Date(a.create), new Date(b.create), isAsc);
        // Agregar más casos para otras columnas si es necesario
        default:
          return 0;
      }
    });
  }

  private compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  logOut() {
    localStorage.removeItem('userData');
    this.router.navigateByUrl("/login");
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

  getParentNode(node: ExampleFlatNode) {
    const nodeIndex = TREE_DATA.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (TREE_DATA[i].level === node.level - 1) {
        return TREE_DATA[i];
      }
    }

    return null;
  }

  applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log("filterValue:", filterValue);
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }

  applyFilterEncuesta(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log("filterValue:", filterValue);
    this.dataSourceEncuesta.filter = filterValue.trim().toLowerCase();
  }

  applyFilterId(event: any) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    console.log("filterValue:", filterValue);
    if (!filterValue) {
      // Si el valor del filtro está vacío, mostrar todos los datos
      this.dataSource2.filter = '';
    } else {
      // Aplicar el filtro
      this.dataSource2.filterPredicate = (data: any, filter: string) => {
        return data.id.toString().toLowerCase() === filter;
      };
      this.dataSource2.filter = filterValue;
    }
  }

  onMonthSelect(event: any) {
    this.selectedMonthSring = event.value;
    this.months.forEach(element => {
      if (element.mes === event.value) {
        this.selectedMonth = element.id;
      }
    });
    if (event.value === "mes") {
      this.dataSource2.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSource2.filter = ''; //
    } else {
      this.applyFilterYearMonth();
    }
  }

  onUserSelected(event:any){
    console.log("evento:", event);
    this.selectedUser = event.value;
    this.months.forEach((element:any) => {
      if (element.usuario === event.value) {
        this.selectedUser = element.id;
      }
    });
    if (event.value === undefined) {
      this.dataSource2.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSource2.filter = ''; //
    } else {
      this.applyFilterYearMonth();
    }
  }

  onYearSelect(event: any) {
    this.selectedYear = event.value;
    console.log("año", this.selectedYear);
    if (event.value === "año") {
      this.dataSource2.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSource2.filter = ''; //
    } else {
      this.applyFilterYearMonth();
    }
  }

  deleteStudyModal(study: any, modalDelete: any) {
    this.dataDel = study;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '250px';
    this.dialog.open(modalDelete, dialogConfig)
    console.log(this.dataDel);
    /*this.dataservice.deleteStudy(study.id).then((result:any) => {
      
    })*/
  }

  async confirmDeleteStudy(study: any) {
    await this.dataservice.deleteStudy(study.id).then((result: any) => {
      if (result) {
        window.location.reload();
      }
    })
  }

  onStudyTypeSelect(event: any) {
    this.selectedType = event.value;
    console.log("selectedType", this.selectedType);
    if (event.value === "todos") {
      this.dataSource2.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSource2.filter = ''; //
    } else {
      this.applyFilterYearMonth();
    }
  }

  onStudyEntregaSelect(event: any) {
    this.selectedEntrega = event.value;
    console.log("selectedType2", this.selectedEntrega, this.selectedType);
    if (event.value === "todos") {
      this.dataSource2.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSource2.filter = ''; //
    } else {
      this.applyFilterYearMonth();
    }
  }

  onInputSearch(event: any) {
    console.log("search:", this.selectedSearch);
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.selectedSearch === "id") {
      this.dataSource2.filterPredicate = (data: any, filter: string) => {
        return data.id.toString().toLowerCase() === filter;
      };
    } else if (this.selectedSearch === "nombre") {
      console.log("llega a else");

      this.dataSource2.filterPredicate = (data: any, filter: string) => {
        console.log("hola:", data, filter);
        return data.estudiesName.toLowerCase().includes(filter);
      };

    }else if(this.selectedSearch === "usuario"){
      console.log("llega a else");

      this.dataSource2.filterPredicate = (data: any, filter: string) => {
        console.log("hola:", data, filter);
        return data.usuario.toLowerCase().includes(filter);
      };
    } else {
      this.dataSource2.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSource2.filter = ''; //
    }

    this.dataSource2.filter = filterValue;
  }

  onInputSearchResp(event: any) {
    console.log("search2:", this.selectedSearch);
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (filterValue) {
      console.log("llega a else");

      this.dataSourceRespuestas.filterPredicate = (data: any, filter: string) => {
        console.log("hola:", data, filter);
        return data.estudiesName.toLowerCase().includes(filter);
      };

    } else {
      this.dataSourceRespuestas.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSourceRespuestas.filter = ''; //
    }

    this.dataSourceRespuestas.filter = filterValue;
  }

  onInputSearchID(event: any) {
    console.log("search2:", this.selectedSearch);
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (filterValue) {
      console.log("llega a else");
  
      this.dataSourceRespuestas.filterPredicate = (data: any, filter: string) => {
        console.log("hola:", data, filter);
  
        // Ensure data.id is a string or convert it to one if it's not
        const dataIdString = data.id ? data.id.toString().toLowerCase() : '';
  
        return dataIdString === filter;
      };
  
    } else {
      this.dataSourceRespuestas.filterPredicate = () => true; // Set an empty filter function
      this.dataSourceRespuestas.filter = ''; // Clear the filter
    }
  
    this.dataSourceRespuestas.filter = filterValue;
  }

  onInputSearchEntregas(event: any) {
    console.log("search2:", this.selectedSearch);
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (filterValue) {
      console.log("llega a else");
  
      this.dataSourceResultados.filterPredicate = (data: any, filter: string) => {
        console.log("hola:", data, filter);
  
        // Ensure data.id is a string or convert it to one if it's not
        const dataIdString = data.id ? data.id.toString().toLowerCase() : '';
  
        return dataIdString === filter;
      };
  
    } else {
      this.dataSourceResultados.filterPredicate = () => true; // Set an empty filter function
      this.dataSourceResultados.filter = ''; // Clear the filter
    }
  
    this.dataSourceResultados.filter = filterValue;
  }

  onInputSearchResult(event: any) {
    console.log("search2:", this.selectedSearch);
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (filterValue) {
      console.log("llega a else");

      this.dataSourceResultados.filterPredicate = (data: any, filter: string) => {
        console.log("hola:", data, filter);
        return data.estudiesName.toLowerCase().includes(filter);
      };

    } else {
      this.dataSourceResultados.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSourceResultados.filter = ''; //
    }

    this.dataSourceResultados.filter = filterValue;
  }

  changeFilterStudy(event: any) {
    this.inputSearch = ""
    console.log("hola:", event, this.selectedSearch);
    this.dataSource2.filterPredicate = () => true; // Establecer como función de filtro vacía
    this.dataSource2.filter = ''; //
    if (event.value === 'nombre') {
      this.activateNameFilter = true;
      this.activeIDFilter = false;
      this.activateUserFilter = false;
    } else if(event.value === 'id') {
      this.activateNameFilter = false;
      this.activeIDFilter = true;
      this.activateUserFilter = false;
    }else if(event.value === 'usuario'){
      this.activateUserFilter = true;
      this.activeIDFilter = false;
      this.activateNameFilter = false;
    }
  }

  async onFileSelected(event: any, element: any, modal: any, loading: any, errorModal: any) {
    console.log("event:", event, element);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '210px';
    this.dialog.open(loading, dialogConfig);
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        try {
          let response:any = await this.dataservice.uploadPlainBase(element.id, file);
          console.log("response:", response);
          
          // Si la respuesta es exitosa, abre el modal de éxito
          if (response.code === 200) {
            this.msgModalBasePlana = response.message;
            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = '400px';
            dialogConfig.height = '210px';
            this.dialog.open(modal, dialogConfig);
          }
        } catch (error) {
          console.error("Error al subir el archivo:", error);
  
          // Si ocurre un error, abre el modal de error
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '500px';
          dialogConfig.height = '225px';
          this.dialog.open(errorModal, dialogConfig);
        }
      }
    }
  }

  dialogCloseAll(loadingData:any, errorBasePlana:any){
    this.dialog.closeAll();
  }

  reloadPage() {
    window.location.reload();
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

  async onCargoSelected(event: any, element: any, modal: any, loading: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '210px';
    let dialogRef = this.dialog.open(loading, dialogConfig)
    console.log("event:", event, element);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        let response = await this.dataservice.uploadCargos(element.id, file);
        if (response) {
          dialogRef.close();
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '400px';
          dialogConfig.height = '210px';
          this.dialog.open(modal, dialogConfig)
        }
      }
    }
  }

  onStatusSelect(event: any) {
    this.selectedStatus = event.value;
    console.log("SELECTED:", this.selectedStatus);
    if (event.value === "todos") {
      this.dataSource2.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSource2.filter = ''; //
    } else {
      this.applyFilterYearMonth();
    }
  }


  onStatusSelectMetrics(event: any) {
    this.selectedStatus = event.value;
    console.log("SELECTED:", this.selectedStatus);
    if (event.value === "todos") {
      this.dataSourceMetrics.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSourceMetrics.filter = ''; //
    } else {
      this.applyFilterYearMonth();
    }
  }

  onStatusSelectR(event: any) {
    this.selectedStatus = event.value;
    console.log("SELECTED:", this.selectedStatus);
    if (event.value === "todos") {
      this.dataSourceResultados.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSourceResultados.filter = ''; //
    } else {
      this.applyFilterYearMonthR();
    }
  }

  onStatusSelectEmpresa(event: any) {
    this.selectedEmpresa = event.value;
    console.log("SELECTED:", this.selectedEmpresa);

    if (event.value === undefined || event.value === "todos") {
      this.dataSourceEmpresa.filterPredicate = () => true; // Establecer como función de filtro vacía
      this.dataSourceEmpresa.filter = ''; // Mostrar todos los datos
    } else {
      this.dataSourceEmpresa.filterPredicate = (data: any, filter: string) => {
        return data.empresaName.trim().toLowerCase() === filter;
      };
      this.dataSourceEmpresa.filter = this.selectedEmpresa.trim().toLowerCase(); // Aplicar el filtro según la empresa seleccionada
    }
  }

  tabChanged(event: any) {
    console.log("event:", event);
    // Obtener el índice de la pestaña activada
    const tabIndex = event.index;

    // Añadir parámetro a la URL basado en el índice de la pestaña
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabIndex },
      queryParamsHandling: 'merge'  // mantener los otros parámetros de la URL
    });
  }

  onTabChanged(event: any) {
    console.log("event", event);
  }

  onIndexChange(event: any) {
    console.log("event:", event);
    // Añadir parámetro a la URL basado en el índice de la pestaña
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: event },
      queryParamsHandling: 'merge'  // mantener los otros parámetros de la URL
    });
    if (event === 0) {
      this.tab1 = true;
      this.tab2 = false;
      this.tab3 = false;
    } else if (event === 1) {
      this.tab1 = false;
      this.tab3 = false;
      this.tab2 = true;
    } else if (event === 2) {
      this.tab3 = true;
      this.tab1 = false;
      this.tab2 = false;
    }
  }

  applyFilterYearMonth() {
    // Variables para almacenar los filtros seleccionados
    let monthFilter: number | null = null;
    let yearFilter: number | null = null;
    let statusFilter: number | null = null;
    let typeFilter: string | null = null;
    let typeEntrega: string | null = null;
    let typeUser:string | null = null;

    // Si se ha seleccionado un mes, obtener el filtro de mes
    if (this.selectedMonth) {
      monthFilter = parseInt(this.selectedMonth, 10);
    }

    if(this.selectedUser){
      typeUser = this.selectedUser;
    }


    // Si se ha seleccionado un año, obtener el filtro de año
    if (this.selectedYear) {
      yearFilter = parseInt(this.selectedYear, 10);
    }

    if (this.selectedStatus) {
      if (this.selectedStatus === 'Nuevo') {
        statusFilter = 1;
      } else if (this.selectedStatus === 'Vigente') {
        statusFilter = 2;
      } else if (this.selectedStatus === 'Procesando') {
        statusFilter = 3;
      } else if (this.selectedStatus === 'Publicado') {
        statusFilter = 4;
      }
    }

    if (this.selectedType) {
      typeFilter = this.selectedType.toLowerCase();
    }

    console.log("entrega:", this.selectedEntrega);
    if (this.selectedEntrega) {
      typeEntrega = this.selectedEntrega.toLowerCase();
    }

    console.log("dataSource:", this.dataSource2);
    // Crear la función de predicado de filtro
    this.dataSource2.filterPredicate = (data: any) => {
      const fecha = moment(data.create); // Convertir la cadena de fecha a un objeto moment
      const mesNumero = parseInt(fecha.format('MM'), 10); // Obtener el número de mes (01-12)
      const yearNumber = parseInt(fecha.format('YYYY')); // Obtener el año

      // Comprobar si el mes coincide con el filtro de mes (si está definido)
      const monthMatch = monthFilter !== null ? mesNumero === monthFilter : true;
      // Comprobar si el año coincide con el filtro de año (si está definido)
      const yearMatch = yearFilter !== null ? yearNumber === yearFilter : true;
      // Comprobar si el estado coincide con el filtro de estado (si está definido)
      const statusMatch = statusFilter ? data.status === statusFilter : true;
      // Comprobar si el tipo coincide (si está definido)
      const typeMatch = typeFilter ? data.tipeStudies.toLowerCase() === typeFilter : true;
      // Comprobar si el tipo coincide (si está definido)
      const typeEntregaNew = typeEntrega ? data.Entrega.toLowerCase() == typeEntrega : true;

      const typeUserMatch = typeUser ? data.usuario.toLowerCase() === typeUser : true;

      // Devolver true si todas las condiciones coinciden
      return monthMatch && yearMatch && statusMatch && typeMatch && typeEntregaNew && typeUserMatch;
    };

    // Aplicar los filtros
    this.dataSource2.filter = JSON.stringify({ month: monthFilter, year: yearFilter, status: statusFilter, type: typeFilter, Entrega: typeEntrega, usuario:typeUser });
    console.log("filter:", this.dataSource2.filter);
  }

  applyFilterYearMonthR() {

    // Variables para almacenar los filtros seleccionados
    let statusFilter: number | null = null;

    if (this.selectedStatus) {
      if (this.selectedStatus === 'Procesando') {
        statusFilter = 3;
      } else if (this.selectedStatus === 'Publicado') {
        statusFilter = 4;
      }
    }

    // Crear la función de predicado de filtro
    this.dataSourceResultados.filterPredicate = (data: any) => {
      const fecha = moment(data.create); // Convertir la cadena de fecha a un objeto moment
      const mesNumero = parseInt(fecha.format('MM'), 10); // Obtener el número de mes (01-12)
      const yearNumber = parseInt(fecha.format('YYYY')); // Obtener el año

      const statusMatch = statusFilter ? data.status === statusFilter : true;

      // Devolver true si todas las condiciones coinciden
      return statusMatch
    };


    // Aplicar los filtros
    this.dataSourceResultados.filter = JSON.stringify({ status: statusFilter });
  }

  // Función para limpiar los filtros
  cleanFilters() {
    // Limpiar variables de filtro
    this.inputSearch = "";
    this.selectedMonth = null;
    this.selectedMonthSring = "";
    this.selectedYear = "";
    this.selectedStatus = null;
    this.selectedType = null;
    this.selectedEntrega = null;
    // Reiniciar filtros en el dataSource
    this.applyFilterYearMonth();
  }

  cleanFiltersResponse() {
    this.inputSearch = "";
    this.inputSearchId = "";
    this.dataSourceRespuestas.filter = '';
  }

  cleanFiltersEntregas() {
    this.selectedStatus = "";
    this.inputSearch = "";
    this.inputSearchId = "";
    this.dataSourceResultados.filter = '';
  }

  cleanFiltersProgress() {
    this.showTablesMetrics = false;
    this.metricsForm.reset();
  }

  cleanFiltersEmpresas() {
    this.selectedEmpresa = "";
    this.dataSourceEmpresa.filter = "";
  }

  activeElement(type: any) {
    this.dataSource2.filterPredicate = () => true; // Establecer como función de filtro vacía
    this.dataSource2.filter = ''; //
    this.dataSourceRespuestas.filterPredicate = () => true; // Set an empty filter function
    this.dataSourceRespuestas.filter = ''; // Clear the filter
    this.dataSourceResultados.filterPredicate = () => true; // Set an empty filter function
    this.dataSourceResultados.filter = ''; // Clear the filter
    this.inputSearch = "";
    this.inputSearchId = "";
    // Guardar el paginador antes de cambiar de pestaña
    const currentPaginator = this.dataSource2.paginator;
    console.log("type", currentPaginator);
    let document0 = document.getElementById('estudios');
    let document1 = document.getElementById('encuestas');
    let document2 = document.getElementById('resultados');
    let document3 = document.getElementById('entregas');
    let document4 = document.getElementById('empresas');
    let document5 = document.getElementById('metrics');
    if (type === 0) {
      this.activeEncuesta = false;
      this.activeAsignar = false;
      this.activeRespuestas = false;
      this.activeEntregas = false;
      this.activeEmpresas = false;
      this.activeMetrics = false;
      this.activeEstudios = true;
      if (document0) {
        document0.style.display = 'flex';
      }
      if (document1) {
        document1.style.display = 'none'; // Oculta el elemento estudios si existe
      }
      if (document2) {
        document2.style.display = 'none';
      }
      if (document3) {
        document3.style.display = 'none';
      }
      if (document4) {
        document4.style.display = 'none';
      }
      if (document5) {
        document5.style.display = 'none';
      }
    } else if (type === 1) {
      console.log(this.dataSourceEncuesta.data);
      this.activeEstudios = false;
      this.activeAsignar = false;
      this.activeRespuestas = false;
      this.activeEntregas = false;
      this.activeEmpresas = false;
      this.activeMetrics = false;
      this.activeEncuesta = true;
      if (document1) {
        document1.style.display = 'flex';
      }
      if (document0) {
        document0.style.display = 'none'; // Oculta el elemento estudios si existe
      }
      if (document2) {
        document2.style.display = 'none';
      }
      if (document3) {
        document3.style.display = 'none';
      }
      if (document4) {
        document4.style.display = 'none';
      }
      if (document5) {
        document5.style.display = 'none';
      }
    } else if (type === 2) {
      this.activeEstudios = false;
      this.activeAsignar = false;
      this.activeEncuesta = false;
      this.activeEntregas = false;
      this.activeEmpresas = false;
      this.activeMetrics = false;
      this.activeRespuestas = true;

      if (document2) {
        this.dataSourceRespuestas.paginator = this.paginador2;
        document2.style.display = 'flex';
      }
      if (document0) {
        document0.style.display = 'none'; // Oculta el elemento estudios si existe
      }
      if (document1) {
        document1.style.display = 'none';
      }
      if (document3) {
        document3.style.display = 'none';
      }
      if (document4) {
        document4.style.display = 'none';
      }
      if (document5) {
        document5.style.display = 'none';
      }
    } else if (type === 3) {
      this.activeEstudios = false;
      this.activeAsignar = false;
      this.activeEncuesta = false;
      this.activeRespuestas = false;
      this.activeEmpresas = false;
      this.activeMetrics = false;
      this.activeEntregas = true;
      if (document3) {
        this.dataSourceResultados.paginator = this.paginador3;
        document3.style.display = 'flex';

      }
      if (document0) {
        document0.style.display = 'none'; // Oculta el elemento estudios si existe
      }
      if (document1) {
        document1.style.display = 'none';
      }
      if (document2) {
        document2.style.display = 'none';
      }
      if (document4) {
        document4.style.display = 'none';
      }
      if (document5) {
        document5.style.display = 'none';
      }
    } else if (type === 4) {
      this.activeEstudios = false;
      this.activeAsignar = false;
      this.activeEncuesta = false;
      this.activeRespuestas = false;
      this.activeEntregas = false;
      this.activeEmpresas = true;
      this.activeMetrics = false;

      if (document3) {
        document3.style.display = 'none';
      }
      if (document0) {
        document0.style.display = 'none'; // Oculta el elemento estudios si existe
      }
      if (document1) {
        document1.style.display = 'none';
      }
      if (document2) {
        document2.style.display = 'none';
      }
      if (document4) {
        document4.style.display = 'flex';
      }
      if (document5) {
        document5.style.display = 'none';
      }
    } else if (type === 5) {
      this.activeEstudios = false;
      this.activeAsignar = false;
      this.activeEncuesta = false;
      this.activeRespuestas = false;
      this.activeEntregas = false;
      this.activeEmpresas = false;
      this.activeMetrics = true;

      if (document3) {
        document3.style.display = 'none';
      }
      if (document0) {
        document0.style.display = 'none'; // Oculta el elemento estudios si existe
      }
      if (document1) {
        document1.style.display = 'none';
      }
      if (document2) {
        document2.style.display = 'none';
      }
      if (document4) {
        document4.style.display = 'none';
      }
      if (document5) {
        this.dataSourceFilterMetrics.paginator = this.paginadorMetrics;
        document5.style.display = 'flex';
      }
    }
    this.activeTab = type;
    console.log("activeTab:", this.activeTab, this.dataSourceResultados.data);
    this.updateTabContent(type);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: type },
      queryParamsHandling: 'merge'
    });
    this.activeObsTable = false;
    this.cdr.detectChanges();
  }

  modalStatus(element: any, modal: any) {
    this.data = element;
    this.dialog.open(modal, {
      width: '400px',
      data: this.data
      // puedes añadir otras opciones aquí
    });
  }

  async despublish(study:any, status:any){
    let response = await this.dataservice.changeStatus(study.id, status);
    if (response) {
      study.status = status;
      this.eventStatusLoading = false;
      this.dialog.closeAll();
    }
   console.log("LLEGA ACÁ:", study);
  }

  async cancelPublish(study:any, status:any){
     console.log("LLEGA ACÁ111:", study, status, this.dataSourceResultados.data);
    let response = await this.dataservice.changeStatus(study.id, status);
    if (response) {
      study.status = status;
      this.eventStatusLoading = false;
      this.dialog.closeAll();
    }
  }

  async updateStatus(event: any, data: any, errorModal: any, errorModalCompany: any, validationStatus: any, validationStatusId3: any, validationStatusId4: any,validationStatusId5: any, validationCancel: any, validationBP: any) {
    console.log("data:", data);
    let existCompany: any = await this.dataservice.getEmpresaById(data.id);
    this.txtMsgPublish = "";
    this.eventStatusLoading = true;
    let val = 0;
    if (data.surveys.length > 0 && existCompany.length > 0 && data.BasePlane !== "") {
      if (event !== "cancel") {
        console.log("entra:", existCompany);
        if (data.status === 1) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '400px';
          dialogConfig.height = '230px';
          this.dialog.open(validationStatus, dialogConfig)
          this.dataStudySelected = data;
        } else if (data.status === 2) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '400px';
          dialogConfig.height = '230px';
          this.dialog.open(validationStatusId3, dialogConfig)
          this.dataStudySelected = data;
          this.dataSourceResultados.data.unshift(data); // Añadir al inicio del array
        } else if (data.status === 3) {
          console.log("dataStatus:", data);
          if (data.BasePlane != null) {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = '400px';
            dialogConfig.height = '230px';
            this.dialog.open(validationStatusId4, dialogConfig)
            this.dataStudySelected = data;
          } else {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = '400px';
            dialogConfig.height = '230px';
            this.dialog.open(validationBP, dialogConfig)
          }

        } else if (data.status === 4) {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = '400px';
            dialogConfig.height = '230px';
            this.dataStudySelected = data;
            this.dialog.open(validationStatusId5, dialogConfig)
        }
      } else {
        console.log("entraelse:", existCompany);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '400px';
        dialogConfig.height = '230px';
        this.dialog.open(validationCancel, dialogConfig)
        this.dataStudySelected = data;
        val = 2;
      }
    } else {
      if (data.surveys.length === 0) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '400px';
        dialogConfig.height = '230px';
        this.dialog.open(errorModal, dialogConfig)
      }
      if(data.status === 3 && data.BasePlane === ""){
        this.txtMsgPublish = "Para publicar el estudio se debe cargar la base plana.";
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '500px';
        dialogConfig.height = '210px';
        this.dialog.open(errorModalCompany, dialogConfig)
      }
      if (data.surveys.length > 0 && existCompany.length === 0) {
        this.txtMsgPublish = "Debe agregar una empresa antes de activar un estudio.";
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '500px';
        dialogConfig.height = '210px';
        this.dialog.open(errorModalCompany, dialogConfig)
      }
    }
  }


  changeSwitchStatus(nro: number, modal: any) {
    if (nro === 2) {
      if (this.activeSwitchEnable === false) {
        this.activeSwitchEnable = true;
      } else {
        this.activeSwitchEnable = false;
      }
      this.cdr.detectChanges();
      this.dialog.closeAll();
    } else if (nro === 3) {
      if (this.activeSwitchProcessing == false) {
        this.activeSwitchProcessing = true;
      } else {
        this.activeSwitchProcessing = false;
      }
      this.dialog.closeAll();
    } else if (nro === 4) {
      if (this.activeSwitchPublish === false) {
        this.activeSwitchPublish = true;
      } else {
        this.activeSwitchPublish = false;
      }
    } else if (nro === 5) {
      if (this.activeSwitchNew === false) {
        this.activeSwitchNew = true;
      } else {
        this.activeSwitchNew = false;
      }

    }
  }

  async changeStatusValidation(data: any, idStatus: any) {
    console.log("estudio?:", data);
    let val = idStatus;
    if (idStatus === 2) {
      this.allInProcess.push(data);
      // Ordenar this.allInProcess por el campo id
      this.allInProcess.sort((a, b) => b.id - a.id);
      // Actualizar el origen de datos de tu dataSourceRespuestas
      this.dataSourceRespuestas.data = this.allInProcess;
    }

    let response = await this.dataservice.changeStatus(data.id, val);
    if (response) {
      data.status = val;
      this.eventStatusLoading = false;
      this.dialog.closeAll();
    }
  }

  viewDetail(element: any, modal: any, modal2: any) {
    console.log(element);
    this.id = element.id;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-dialog'
    dialogConfig.width = '1200px';
    dialogConfig.height = '34rem'
    this.dialog.open(modal, dialogConfig)

    //this.router.navigateByUrl("add-poll/"+element.idEstudio);
  }

  async downloadResponse(element: any, download: any) {
    let response = await this.dataservice.downloadResponse(element);
    console.log("resp", response);
    if (response) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '210px';
      this.dialog.open(download, dialogConfig)
    }
  }

  modalDownloadFiles(download: any, element: any) {
    this.dataDel2 = element;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '210px';
    this.dialog.open(download, dialogConfig)
  }

  modalDownloadFilesEncuesta(element: any, download: any) {
    console.log("consolidar");
    this.dataDel3 = element;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '210px';
    dialogConfig.data = { element };
    this.dialog.open(download, dialogConfig)
  }

  downloadFile(element: any) {
    if (window.location.host === "localhost:4200" || window.location.host === "200.63.98.203") {
      window.location.href = "http://200.63.98.203:9010/" + element.url;
      //this.reloadPage();
    } else {
      window.location.href = element.url;
    }
  }

  getUploadFiles(element: any) {
    console.log("element2:", element);

    element.filesEstudies.forEach((file: any) => {

      if (window.location.hostname !== 'estudios.clouhr.cl') {
        let url = `http://200.63.98.203:9010/api/metadata/download/${file.metadataId}`;
        window.location.href = url;
      } else {
        //document.location.href = ":9010/api/metadata/download/" + file.metadataId;
        let url = `https://estudios.clouhr.cl/api/metadata/download/${file.metadataId}`;
        window.location.href = url;
      }

      /*this.dataservice.getUploadFiles(file.metadataId).then((result: any) => {
        console.log("windows:", window.location.hostname);
        if (window.location.hostname === '200.63.98.203') {

        } else {
          //document.location.href = ":9010/api/metadata/download/" + file.metadataId;
        }

      })*/
    });
  }

  saveModalObs(modal: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '210px';
    this.dialog.open(modal, dialogConfig)
  }

  async sendObs() {
    console.log("obs:", this.obsSelected);
    let data = {
      "obs": this.fieldObs,
      "uploadFiles": {
        "id": this.obsSelected.id
      }
    }
    this.obsSelected.status = 2;
    let response: any = await this.dataservice.sendAdminObs(data);
    console.log("response:", response);
    if (response.id) {
      this.dialog.closeAll();
    }
    this.booleanObs = true;
    //this.fieldObs = "";
  }

  cancelObs(){
    if(this.booleanObs === false){
       this.fieldObs = "";
    }
   
  }

  addObservations(modal: any, file: any) {
    this.obsSelected = file;
    if (this.obsSelected.status === 1) {
      this.selectedStatusObs = "Validando Respuestas"
    } else if (this.obsSelected.status === 2) {
      this.selectedStatusObs = "Revisar Observaciones"
    } else if (this.obsSelected === 3) {
      this.selectedStatusObs = "Formulario Validado"
    }

    console.log("obsSelecetd:", this.obsSelected, );
    if(this.booleanObs === false){
      this.fieldObs = this.obsSelected.Obs[this.obsSelected.Obs.length - 1];
    }
   

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '800px';
    dialogConfig.height = '575px';
    this.dialog.open(modal, dialogConfig)
  }

  addPersonals(element: any, modal: any) {
    console.log("element:", element);
    element.expanded = true; // Toggle the expanded state
    // Otro código relacionado con la acción
  }

  createCompany(modal: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '600px';
    dialogConfig.height = '600px';
    this.dialog.open(modal, dialogConfig)
  }

  addUserCompany(modal: any, element: any) {
    this.dataModalUser = element;
    console.log("element:", element);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '600px';
    dialogConfig.height = '400px';
    this.dialog.open(modal, dialogConfig)
  }

  async onSubmitModalForm(form: any) {
    if (form.valid) {
      form.form.value.valid = false;
      let newJson = {};
      newJson = form.form.value;
      let response = await this.dataservice.saveEmpresa(newJson);
      if (response) {
        this.dialog.closeAll();
      }
    }
  }

  async onSubmitModalFormUser(form: any) {
    if (form.valid) {
      console.log("data:", this.dataModalUser);
      form.form.value.empresa = {
        "empresaId": this.dataModalUser.empresaId
      }
      let newJson = {};
      newJson = form.form.value;
      let response = await this.dataservice.addEmpresaUser(newJson);
      if (response) {
        this.dialog.closeAll();
      }
    }
  }

  // Función para determinar si un elemento está expandido
  isDetailExpanded(element: any): boolean {
    return this.expandedElement === element;
  }

  // Función para alternar la expansión de los detalles
  toggleDetail(element: any): void {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  async addItems(value: any, modal: any, estudio: any) {
    console.log("event:", estudio);
    this.id = estudio.id;
    this.estudioSelected = estudio;
    if (value === "preguntas") {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.panelClass = 'custom-dialog'
      dialogConfig.width = '1200px';
      dialogConfig.maxHeight = '50rem'
      dialogConfig.height = '100%;'
      this.dialog.open(modal, dialogConfig)
    } else if (value === "empresas") {
      this.isEntrega = false;
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '1000px';
      this.dialog.open(modal, dialogConfig)
    } else if (value === "formularios") {
      this.id = estudio.id;
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '800px';
      this.dialog.open(modal, dialogConfig)
    }
  }

  async saveEmpresa() {
    let pollData = this.pollSelectedEmpresa.surveys.find((a: any) => a.name);
    console.log("data:", pollData);
    if (this.allSelectedUserEmpresa.length > 0 && this.pollSelectedEmpresa.surveys.length > 0) {
      await Promise.all(this.allSelectedUserEmpresa.map(async (persona) => {
        let company = {
          id: pollData.idEstudio
        };
        try {
          const result = await this.dataservice.asociarEmpresa(persona.id, company);
        } catch (error) {
          throw error; // Propaga el error para que Promise.all pueda capturarlo
        }
      })).catch((error) => {
        throw error; // Propaga el error para ser capturado por el try-catch principal
      });
    }
  }

  async newStudy(modal: any): Promise<void> {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-dialog';
    dialogConfig.disableClose = true;
    this.dialogRef = this.dialog.open(modal, dialogConfig);

    // Añadir listener para detectar clic fuera del modal
    this.dialogRef.backdropClick().subscribe(() => {
      this.shakeModal();
    });
  }

  changeStatus(element: any, status: any) {
    console.log("element", element);
  }

  shakeModal(): void {
    const modalElement = document.querySelector('mat-dialog-container');
    if (modalElement) {
      modalElement.classList.add('shake');
      console.log("entra en shake", modalElement.classList);
      setTimeout(() => {
        modalElement.classList.remove('shake');
      }, 500); // Duración de la animación en milisegundos
    }
  }

  getDropdownLeftPosition(event: MouseEvent): number {
    return event.clientX;
  }

  getDropdownTopPosition(event: MouseEvent): number {
    return event.clientY;
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: Event) {
    const menuText = this.el.nativeElement.querySelector('.mdc-list-item-primary-text');
    if (menuText) {
      menuText.classList.add('hover-active');
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: Event) {
    const menuText = this.el.nativeElement.querySelector('.mdc-list-item-primary-text');
    if (menuText) {
      menuText.classList.remove('hover-active');
    }
  }

  backToTable() {
    this.reloadPage();
    this.activeObsTable = false;
    this.activeRespuestas = true;
  }

  async addModal(validateFiles: any, element: any) {
    this.selectedStudyResponse = element;
    let response: any = await this.dataservice.getCustomResponses(element.id);
    console.log("response", response, this.selectedStudyResponse);
    let transformedFiles: any[] = [];

    this.dataSourceObs = new MatTableDataSource(response as any[]);

    // Obtener las empresas únicas del nuevo dataSource
    this.uniqueEmpresas = [...new Set((response as any[]).map((item: any) => item.Empresa))];

    this.activeObsTable = true;

    // Aplicar el filtro de la empresa si ya se seleccionó una antes
    if (this.selectedOption) {
      this.applyFilter(this.selectedOption);
    }
  }

  applyFilterValidateEmpresa(value: any) {
    this.dataSourceObs.filterPredicate = (data: any, filter: string) => {
      return data.Empresa.toLowerCase().includes(filter);
    };

    if (value) {
      this.dataSourceObs.filter = value.trim().toLowerCase();
    } else {
      this.dataSourceObs.filter = ''; // Si selecciona "Todas", muestra todos los datos
    }
  }

  applyFilterStatusEmpresa(value: any) {
    // Configurar el filtro para comparar el status
    this.dataSourceObs.filterPredicate = (data: any, filter: string) => {
      // Convertir a número para asegurar la comparación correcta
      return data.status === +filter; // El "+" convierte filter a número
    };

    // Si se selecciona una opción, aplicar el filtro
    if (value) {
      this.dataSourceObs.filter = value.toString(); // Convertir valor a string para que coincida con el filtro
    } else {
      this.dataSourceObs.filter = ''; // Mostrar todos si se selecciona "Todas"
    }
  }

  async findCustomMetrics() {
    console.log("databeforesend:", this.metricsForm.value);
    let val = null;
    if (this.metricsForm.value.studyStatus === 'Vigente') {
      val = 2;
    } else if (this.metricsForm.value.studyStatus === 'Procesando') {
      val = 3;
    } else if (this.metricsForm.value.studyStatus === 'Publicado') {
      val = 4;
    }
    let response: any = await this.dataservice.getMetricsData(this.metricsForm.value.studyType, val, this.metricsForm.value.studyYear, this.metricsForm.value.studyEntrega)
    console.log("response:", response);
    if (response) {
      response.forEach((element: any) => {
        element.cumplimiento = Math.round((element.CantidadUsuariosRespondio / element.CantidadUsuarios) * 100);
        element.createFormat = moment(element.create).format("DD/MM/YYYY");
        element.nroPreguntas = element.CantidadUsuarios > 0 ? element.CantidadPreguntas / element.CantidadUsuarios : 0;
      });
      this.showTablesMetrics = true;
      this.dataSourceFilterMetrics = response.sort((a: any, b: any) => {
        return new Date(b.create).getTime() - new Date(a.create).getTime();
      });

      this.dataSourceFilterMetrics.paginator = this.paginadorMetrics;

    }
  }

  visorPDF(element: any, modal: any) {
    console.log("element:", element);
    this.estudioSelected = element;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '900px';
    dialogConfig.height = 'auto';
    this.dialog.open(modal, dialogConfig)
  }

  showDataMetrics(element: any) {
    console.log(element);
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  validateFormModalInfo(modal: any, element: any) {
    this.selectedFormValidate = element;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '600px';
    dialogConfig.height = '220px';
    this.dialog.open(modal, dialogConfig)
  }

  validateFormModal(modal: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '220px';
    this.dialog.open(modal, dialogConfig)
  }

  async getConsolidadoEmpresa(element: any) {
    console.log("metadata:", element);
    let response = await this.dataservice.consolidarxempresa(this.selectedStudyResponse.id, element.idempresa, element.metadataid);
    console.log("datA:", response);
  }

  async validateFormAccept() {
    console.log("validate:", this.selectedFormValidate, this.selectedStudyResponse);
    let response: any = await this.dataservice.validateFormSuccess(this.selectedFormValidate.metadataid, this.selectedStudyResponse.id, this.selectedFormValidate.user, this.selectedFormValidate.id);
    if (response) {
      window.location.reload();
    }
  }

  addUsers(modal: any, element: any) {
    this.isEntrega = true;
    console.log("addUsers:", element);
    this.estudioSelected = element;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1000px';
    this.dialog.open(modal, dialogConfig)
  }

}
