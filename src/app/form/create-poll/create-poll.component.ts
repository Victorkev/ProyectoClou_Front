import {
  FlatTreeControl,
  getTreeControlFunctionsMissingError,
} from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { DataserviceService } from 'src/app/services/dataservice.service';

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css'],
})
export class CreatePollComponent {
  @Input() estudio: any;
  encuestaForm: any = FormGroup;
  empresasForm: any = FormGroup;
  templates: any = FormGroup;
  createQuestionForm: any = FormGroup;
  allQuestions: any[] = [];
  loading: boolean = false;
  responseForm: boolean = false;
  selectedQuestions: any;
  benefitTypes: any[] = [];
  groupTypes: any[] = [];
  estudies: any[] = [];
  empresas: any[] = [];
  user: any;
  isChecked: boolean = false; // Variable to track checkbox state

  @ViewChildren(MatExpansionPanel) panels: any = QueryList<MatExpansionPanel>;
  currentIndex: number = 0;
  stepQuestion: any[] = [];
  currentIndex2: number | null = null;
  @ViewChild(MatStepper) stepper: any = MatStepper;
  isCheckedQuestions: boolean[] = [];
  allSelectedQuestions: any[] = [];
  allSelectedEmpresa: any[] = [];
  allSelectedUserEmpresa: any[] = [];
  isCheckedEmpresa: boolean[] = [];
  isCheckedEmpresaPeople: boolean[] = [];
  isCheckedEmpresaAll: any;
  firstLetter: any;
  type: any;
  name: any;
  selectedFile: File | null = null;
  archivoSelect: boolean = false;
  fileName: any;
  fileNames: any[] = [];
  displayedGroupNames: Set<string> = new Set<string>();
  typesStudy: any[] = [];
  arrayEstudiesFilter: any[] = [];
  @Input() id: any;
  @Input() typeAction: any;
  activeCheckedAll: boolean = false;
  empresasSelected: any[] = [];
  step: any = 0;
  allData: any = {};
  selectedOptions: boolean[] = [];
  allGroups: any[] = [];
  selectedBenefit: any = { groupBeneficios: [] };
  dataType: boolean = false;
  radioButtons: string[] = ['']; // Initialize with one empty value
  radioButtonControls: FormControl[] = [new FormControl('')];
  step2Modal: boolean = false;
  allTemplates: any;
  selectedTemplate: any;
  historyQuestions: any[] = [];
  tmpQuestions: any[] = [];
  obligatoriedad: boolean = false;
  isEditingQuestion: boolean = false;
  questionEditActive: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dataservice: DataserviceService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {}

  async ngOnInit() {
    console.log('id:', this.id, this.typeAction);
    //valida parametro en url (id)
    this.loading = true;
    //this.id = this.route.snapshot.paramMap.get('id');
    this.user = this.dataservice.userData;
    this.firstLetter = this.user.personal.nombre[0];
    this.name =
      this.user.personal.nombre.charAt(0).toUpperCase() +
      this.user.personal.nombre.slice(1);
    this.type = this.user.role[0].roleName;
    await this.dataservice.getBenefitTypes().then((result: any) => {
      this.benefitTypes = result;
      this.loading = false;
    });

    this.createQuestionForm = this.fb.group({
      group: [''],
      benefit: [''],
      type: [''],
      looked: [false],
      format: [''],
      seleccionMultiple: [''],
      question: [''],
      selectedOptionRadioButton: [''],
      radioButtons: this.fb.group({}),
      pregunta_id: [''],
    });

    this.encuestaForm = new FormGroup({
      pollName: new FormControl(''),
      pollType: new FormControl('', [Validators.required]),
      pollGroup: new FormControl(''),
      pollEstudies: new FormControl('', [Validators.required]),
      questions: new FormArray([]),
    });

    this.templates = new FormGroup({
      idStudy: new FormControl(''),
      nameStudy: new FormControl(''),
    });

    if (this.id) {
      this.dataservice.getDataFromSurvey(this.id).then((result: any) => {
        console.log('data:', result);
        this.allData = result;
        // Transformar los datos para agrupar por empresa
        this.empresasSelected = result.empresa.reduce(
          (acc: any[], current: any) => {
            let empresa = acc.find(
              (item) => item.empresaName === current.empresaName,
            );
            if (!empresa) {
              empresa = {
                empresaName: current.empresaName,
                personal: [],
              };
              acc.push(empresa);
            }
            empresa.personal.push(current.personal);
            return acc;
          },
          [],
        );
        this.encuestaForm.setValue({
          pollName: result.estudiesName,
          pollType: result.tipeStudies,
          pollGroup: 'Grupo de encuesta',
          pollEstudies: { estudiesName: result.estudiesName },
          questions: [], // Aquí deberías proporcionar los valores para el FormArray si es necesario
        });
        let questions: any = [];
        result?.groupBeneficios?.forEach((group: any) => {
          group.groupBeneficios.forEach((question: any) => {
            if (this.typeAction) {
              question.preguntas.forEach((pregunta: any) => {
                console.log('result2:', pregunta);
                questions.push({
                  looked: pregunta.looked,
                  groupName: group.description,
                  nameBenefitGroup: question.name,
                  pregunta_id: pregunta.pregunta_id,
                  name: pregunta.pregunta_name,
                  questionNumber: pregunta.questionNumber,
                  tipoDato: pregunta.tipoDato,
                  seleccionMultiple: pregunta.seleccionMultiple,
                  opcion: pregunta.opcion.map((op: any) => ({
                    value: op,
                    selected: true,
                  })),
                  groupId: group.id,
                  groupBeneficios: { id: question.id },
                  benefitId: group.id,
                  checked: true,
                  type: pregunta.type,
                });
              });
              console.log('QUESTIONS:', questions);
              this.benefitTypes.forEach((benefitT: any) => {
                benefitT.groupBeneficios.forEach((groupT: any) => {
                  groupT.preguntas.forEach((preguntaT: any) => {
                    console.log('PREGUNTA:', preguntaT);
                    // Busca si existe una pregunta en 'questions' con el mismo nombre que preguntaT.name
                    const foundQuestion = questions.find(
                      (q: any) => q.questionNumber === preguntaT.pregunta_id,
                    );
                    if (foundQuestion != undefined) {
                      console.log('foundQuestions:', foundQuestion);
                    }

                    // Si la pregunta existe, establece checked en true
                    if (foundQuestion) {
                      preguntaT.checked = true;
                    }
                  });
                });
              });
            } else {
              questions.push({
                groupName: group.description,
                nameBenefitGroup: question.name,
                questions: question.preguntas,
              });
            }
          });
        });
        this.historyQuestions = questions;
        this.allSelectedQuestions = questions;
        console.log('allSelectedQuestions:', this.allSelectedQuestions);
        this.allSelectedEmpresa = result.empresa;
        if (result.files.length > 0) {
          this.archivoSelect = true;
          this.fileNames = result.files;
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSelect = true;
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.fileNames.push(file);
      }
    }
  }

  selectType(event: any) {
    let estudiesLet = this.estudies.filter((a) => a.surveys.length === 0);
    this.arrayEstudiesFilter = estudiesLet.filter(
      (a) => a.tipeStudies.toLowerCase() === event.value.toLowerCase(),
    );
  }

  private addCheckboxes() {
    this.allQuestions.forEach((_, i) => {
      const control = new FormControl(false);
      (this.encuestaForm.controls.questions as FormArray).push(control);
    });
  }

  setStep(index: number) {
    this.step.set(index);
  }

  nextStep() {
    this.step.update((i: any) => i + 1);
  }

  prevStep() {
    this.step.update((i: any) => i - 1);
  }

  getPeople(): any[] {
    const tableData = [];
    console.log('empresa:', this.empresasSelected);
    for (const empresa of this.empresasSelected) {
      for (const person of empresa.personal) {
        tableData.push({
          empresa: empresa.empresaName,
          nombre: person.nombre,
          email: person.email,
          tipo: person.tipo,
        });
      }
    }

    return tableData;
  }

  toggleChecked(question: any, event: any, benefit: any): void {
    console.log(
      'Datos del formulario1:',
      this.allSelectedQuestions,
      question,
      benefit,
    );
    const preguntaId = question.pregunta_id;
    question.groupName = benefit.name;
    question.groupId = benefit.id;

    // Buscar el grupo que contiene la pregunta con el pregunta_id dado
    const group = benefit.groupBeneficios.find((grupo: any) =>
      grupo.preguntas.some(
        (pregunta: any) => pregunta.pregunta_id === preguntaId,
      ),
    );

    console.log('GROUPSELECCIONDO:', group);

    // Si se encuentra el grupo, asignar el nombre del grupo a question.nameBenefitGroup
    if (group) {
      question.nameBenefitGroup = group.name;
      question.benefitId = group.id;
      question.groupBeneficios = { id: group.id };
    } else {
      question.nameBenefitGroup = null; // O cualquier valor que desees usar si no se encuentra el grupo
    }

    // Verifica si todos los elementos de question.opcion ya tienen las propiedades 'value' y 'selected'
    const allHaveValueAndSelected = question.opcion.every(
      (op: any) => op.hasOwnProperty('value') && op.hasOwnProperty('selected'),
    );

    if (!allHaveValueAndSelected) {
      // Solo inicializa si no todas las opciones tienen las propiedades necesarias
      question.opcion = question.opcion.map((op: any) => ({
        value: op,
        selected: true, // Inicializar todas las opciones como seleccionadas
      }));
    }
    // Cambiar el estado del checkbox individual
    question.checked = event.checked; // Update the checked property directly
    this.isCheckedQuestions[preguntaId] = event.checked;
    console.log('GROUP:', this.isCheckedQuestions[preguntaId]);

    // Actualizar la lista de preguntas seleccionadas
    if (event.checked) {
      const targetGroupId = question.groupBeneficios?.id;

      let insertIndex = -1;

      // Buscar desde el final el último del mismo groupBeneficios.id
      for (let i = this.allSelectedQuestions.length - 1; i >= 0; i--) {
        if (
          this.allSelectedQuestions[i].groupBeneficios?.id === targetGroupId
        ) {
          insertIndex = i;
          break;
        }
      }

      if (insertIndex !== -1) {
        // Insertar después del último del mismo grupo
        this.allSelectedQuestions.splice(insertIndex + 1, 0, question);
      } else {
        // Si no existe ninguno de ese grupo, va al final
        this.allSelectedQuestions.push(question);
      }
    } else {
      console.log('ID3:', this.allSelectedQuestions, preguntaId);
      this.activeCheckedAll = false;
      // Quitar la pregunta si no está marcada
      this.allSelectedQuestions = this.allSelectedQuestions.filter(
        (selectedQuestion) => {
          // Si pregunta_id coincide con preguntaId o con questionNumber, se elimina del array
          return (
            selectedQuestion.pregunta_id !== preguntaId &&
            selectedQuestion.questionNumber !== preguntaId
          );
        },
      );

      console.log('ID3:', this.allSelectedQuestions);
    }
  }

  toggleCheckedAll(checked: boolean) {
    this.activeCheckedAll = true;
    this.allSelectedQuestions = []; // Vaciar el array antes de añadir todas las preguntas
    for (let benefit of this.benefitTypes) {
      for (let group of benefit.groupBeneficios) {
        for (let question of group.preguntas) {
          question.checked = checked;
          this.isCheckedQuestions[question.pregunta_id] = checked;

          if (checked) {
            question.groupName = benefit.name;
            question.nameBenefitGroup = group.name;
            question.groupBeneficios = { id: group.id };
            // Verifica si todos los elementos de question.opcion ya tienen las propiedades 'value' y 'selected'
            const allHaveValueAndSelected = question.opcion.every(
              (op: any) =>
                op.hasOwnProperty('value') && op.hasOwnProperty('selected'),
            );

            if (!allHaveValueAndSelected) {
              // Solo inicializa si no todas las opciones tienen las propiedades necesarias
              question.opcion = question.opcion.map((op: any) => ({
                value: op,
                selected: true, // Inicializar todas las opciones como seleccionadas
              }));
            }
            this.allSelectedQuestions.push(question);
          }
        }
      }
    }
    console.log('question', this.allSelectedQuestions);

    if (!checked) {
      this.allSelectedQuestions = [];
    }
  }

  isFirstInGroup(groupName: string, index: number): boolean {
    if (index === 0) {
      return true;
    }
    return this.allSelectedQuestions[index - 1].groupName !== groupName;
  }

  isFirstInGroup2(nameBenefitGroup: string, index: number): boolean {
    if (index === 0) {
      return true;
    }
    return (
      this.allSelectedQuestions[index - 1].nameBenefitGroup !== nameBenefitGroup
    );
  }

  isFirstInGroupEmpresa(empresaName: string, index: number): boolean {
    if (index === 0) {
      return true; // Si es el primer elemento, siempre devuelve true
    }

    // Compara con el elemento anterior en el array
    return (
      this.allSelectedUserEmpresa[index - 1].empresa.empresaName !== empresaName
    );
  }

  toggleCheckedEmpresaAll(checked: boolean): void {
    this.isCheckedEmpresaAll = checked;
    this.allSelectedEmpresa = [];

    console.log('checked:', checked);

    this.empresas.forEach((empresa, o) => {
      this.isCheckedEmpresa[o] = checked;
      if (checked) {
        this.allSelectedEmpresa.push(empresa);
      }

      empresa.personal.forEach((persona: any, u: any) => {
        this.isCheckedEmpresaPeople[u] = checked;
      });
    });

    if (!checked) {
      this.allSelectedEmpresa = [];
    }
  }

  toggleCheckedEmpresa(empresa: any, index: number): void {
    this.isCheckedEmpresa[index] = !this.isCheckedEmpresa[index];

    if (this.isCheckedEmpresa[index]) {
      empresa.personal.forEach((persona: any) => {
        persona.empresa = empresa;
        if (
          !this.allSelectedUserEmpresa.some(
            (selectedPersona: any) => selectedPersona.id === persona.id,
          )
        ) {
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
        const personaIndex = this.allSelectedUserEmpresa.findIndex(
          (selectedPersona: any) => selectedPersona.id === persona.id,
        );
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
    console.log('personaEmpresa:', this.allSelectedUserEmpresa);
  }

  get allChecked(): boolean {
    return (
      this.isCheckedEmpresa.length > 0 &&
      this.isCheckedEmpresa.every((checked) => checked)
    );
  }

  toggleCheckedEmpresaPeople(
    persona: any,
    index: number,
    empresa: any,
    indexEmp: number,
  ): void {
    const isChecked = !this.isCheckedEmpresaPeople[index];
    this.isCheckedEmpresaPeople[index] = isChecked;
    if (isChecked) {
      persona.empresa = empresa;
      if (
        !this.allSelectedUserEmpresa.some(
          (selectedPersona: any) => selectedPersona.id === persona.id,
        )
      ) {
        this.allSelectedUserEmpresa.push(persona);
      }
    } else {
      const personaIndex = this.allSelectedUserEmpresa.findIndex(
        (selectedPersona: any) => selectedPersona.id === persona.id,
      );
      if (personaIndex !== -1) {
        this.allSelectedUserEmpresa.splice(personaIndex, 1);
        this.isCheckedEmpresa[indexEmp] = !this.isCheckedEmpresa[indexEmp];
      }

      if (this.allSelectedUserEmpresa.length === 0) {
        this.isCheckedEmpresa[indexEmp] = !this.isCheckedEmpresa[indexEmp];
      }
    }
    console.log('personaEmpresa:', this.allSelectedUserEmpresa);
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

  onPanelOpened(index: number) {
    this.currentIndex = index;
    this.stepQuestion = [];
    const openedBenefit = this.groupTypes[index];
    this.encuestaForm.patchValue({
      pollGroup: openedBenefit,
    });
    openedBenefit.preguntas.forEach((question: any) => {
      this.stepQuestion.push(question);
    });
  }

  // Modifica el método onSelectionChange para que solo marque los checkboxes si el índice del panel de expansión coincide con currentIndex
  onSelectionChange(event: any) {
    if (event.value) {
      this.allQuestions = [];
      this.groupTypes = event.value.groupBeneficios;
      this.groupTypes.forEach((element, index) => {
        element.preguntas.forEach((question: any) => {
          question.groupName = event.value.name;
          this.allQuestions.push(question);
          // Agrega una condición para marcar los checkboxes solo si el índice del panel de expansión coincide con currentIndex
          if (this.currentIndex === index) {
            this.addCheckboxes();
          }
        });
      });
    }
  }

  createForm() {
    if (
      this.allSelectedQuestions.length > 0 &&
      this.empresas.length > 0 &&
      this.encuestaForm.status === 'VALID'
    ) {
      this.responseForm = true;
      this.stepper.next();
    } else {
      if (
        this.encuestaForm.status === 'INVALID' ||
        (this.allSelectedQuestions.length == 0 && this.empresas.length == 0)
      ) {
        this.snackBar.open('Debes ingresar todos los datos', 'Error', {
          duration: 3000,
        });
      }
    }
  }

  validateStep(error: any) {
    this.responseForm = true;
    this.stepper.next();
    /* if (this.allSelectedQuestions.length > 0) {
 
       console.log("selectedQuestions:", this.allSelectedQuestions);
 
 
       this.responseForm = true;
       this.stepper.next();
     } else {
       if (this.encuestaForm.status === 'INVALID' || this.allSelectedQuestions.length == 0) {
         const dialogConfig = new MatDialogConfig();
         dialogConfig.width = '400px';
         dialogConfig.height = '210px';
         this.dialog.open(error, dialogConfig)
       }
     }*/
  }

  validateStep2(errorEmpresa: any) {
    console.log('selected:', this.allSelectedUserEmpresa);
    if (this.allSelectedUserEmpresa.length > 0) {
      this.responseForm = true;
      this.stepper.next();
    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '210px';
      this.dialog.open(errorEmpresa, dialogConfig);
    }
  }

  onEstudioChange(event: any, surveyExist: any) {
    if (this.encuestaForm.value.pollEstudies.surveys.length > 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '210px';
      this.dialog.open(surveyExist, dialogConfig);
      // Resetea el valor del control del formulario
      this.encuestaForm.get('pollEstudies').reset();
    }
  }

  modalConfirm(confirmacion: any, errorMultiple: any) {
    console.log('final:', this.allSelectedQuestions);
    if (this.allSelectedQuestions.length > 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '210px';
      this.dialog.open(confirmacion, dialogConfig);
    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '210px';
      this.dialog.open(errorMultiple, dialogConfig);
    }
  }

  // Function to handle checkbox change event
  onCheckboxChange(event: any) {
    this.isChecked = event.checked;
  }

  logOut() {
    localStorage.removeItem('userData');
    this.router.navigateByUrl('/login');
  }

  backForm() {
    this.responseForm = false;
  }

  nextStepper() {
    this.stepper.next();
  }

  deleteFile(fileToDelete: { name: string }) {
    this.fileNames = this.fileNames.filter((file) => file !== fileToDelete);
  }

  downloadFile(file: any) {
    window.location.href =
      window.location.origin + '/api/media/files/' + file.url;
  }

  closeData() {
    this.dialog.closeAll();
    location.reload();
  }

  // Method to enable edit mode for a specific question
  editQuestion(question: any, index: number, modal: any): void {
    console.log('question:', question);
    //question.isEditing = true;
    this.isEditingQuestion = true;
    let selectedBenefit = this.benefitTypes.find(
      (a: any) => question.benefitId === a.id,
    );
    // Encuentra el grupo que coincida con el nombre del grupo de la pregunta
    let selectedGroup = this.benefitTypes.find(
      (b: any) => b.name === question.groupName,
    );

    this.selectedBenefit = selectedGroup;
    // Encuentra el beneficio que contiene el grupo con el ID deseado
    let selectedBenefit2 = selectedGroup.groupBeneficios.find(
      (a: any) => question.groupBeneficios.id === a.id,
    );
    this.questionEditActive = question;
    let val = null;

    if (question.type === 'SIMPLE') {
      if (question.tipoDato === 'TEXTO') {
        val = '0';
      } else {
        val = '1';
      }
    } else if (question.type === 'MULTIPLE') {
      if (question.seleccionMultiple === 0) {
        val = 0;
      } else if (question.seleccionMultiple === 1) {
        val = 1;
      }
    }
    // Configurar valores básicos en el formulario
    this.createQuestionForm.patchValue({
      group: selectedGroup,
      benefit: selectedBenefit2,
      type: question.type,
      looked: question.looked,
      format: val,
      seleccionMultiple: question.seleccionMultiple === true ? 1 : 0,
      question: question.name,
      selectedOptionRadioButton: '',
      pregunta_id: question.pregunta_id,
    });

    // Crear controles dinámicamente para `radioButtons` con el `value` de cada opción
    const radioButtonsGroup = this.fb.group({});
    question.opcion.forEach((opt: any, index: any) => {
      radioButtonsGroup.addControl(
        `option${index}`,
        this.fb.control(opt.value),
      );
    });

    // Asignar el grupo `radioButtons` ya configurado al formulario
    this.createQuestionForm.setControl('radioButtons', radioButtonsGroup);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '800px';
    dialogConfig.height = '800px';
    this.dialog.open(modal, dialogConfig);
  }

  cancelEditQuestion(question: any, index: number): void {
    question.isEditing = false;
  }

  onCheckboxSelectedChange(event: any, opcion: any) {
    console.log('opcion:', opcion);
  }

  addQuestions(modal: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '800px';
    dialogConfig.height = '800px';
    this.dialog.open(modal, dialogConfig);
  }

  cancelModal(modal: any) {
    this.createQuestionForm.reset();
  }

  nextStepModal(modal: any) {
    console.log(this.createQuestionForm.value);
    this.step2Modal = true;
    if (
      this.createQuestionForm.value.benefit &&
      this.createQuestionForm.value.group
    ) {
      this.step2Modal = true;
    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '210px';
      this.dialog.open(modal, dialogConfig);
    }
  }

  nextStepBackModal() {
    this.step2Modal = false;
  }

  getBenefitType(benefit: any) {
    console.log('benefit2:', benefit);
    let benefitSelected = this.benefitTypes.find(
      (a: any) => a.name === benefit.name,
    );
    console.log('benefit1:', benefitSelected, this.benefitTypes);
    this.selectedBenefit = benefitSelected;
    console.log('benefit:', this.selectedBenefit);
  }

  selectionTypeResponse(event: any) {
    console.log('event:', event);
    if (event.value === 'simple') {
      this.dataType = true;
    } else {
      this.dataType = false;
    }
  }

  saveChangesQuestion(question: any, index: any) {
    question.isEditing = false;
    console.log('question:', question, index, this.createQuestionForm.value);
  }

  capitalizeFirstLetter(text: string): string {
    if (text === '0') {
      text = 'Texto';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    if (text === '1') {
      text = 'Numérico';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  getRadioButtonKeys() {
    const radioButtons = this.createQuestionForm.get(
      'radioButtons',
    ) as FormGroup;
    if (radioButtons) {
      return Object.keys(radioButtons.controls);
    }
    return []; // Retorna un array vacío si no hay controles
  }

  addRadioButton() {
    const radioButtons = this.createQuestionForm.get(
      'radioButtons',
    ) as FormGroup;
    const index = Object.keys(radioButtons.controls).length;
    radioButtons.addControl(`option${index}`, this.fb.control(''));
    console.log('addoption:', radioButtons);
  }

  removeRadioButton(index: any) {
    const radioButtonsGroup = this.createQuestionForm.get(
      'radioButtons',
    ) as FormGroup;
    const keyToRemove = index;
    console.log('TEST:', keyToRemove);
    if (radioButtonsGroup && radioButtonsGroup.get(keyToRemove)) {
      radioButtonsGroup.removeControl(keyToRemove);
    }
    console.log('hola:', radioButtonsGroup, keyToRemove);
  }

  deleteQuestion(question: any, index: any) {
    this.tmpQuestions.push(question);
    this.allSelectedQuestions.splice(index, 1);
  }

  emptyForm(modalAddQuestion: any) {
    // Resetea el formulario
    this.createQuestionForm.reset({
      group: null,
      benefit: null,
      type: null,
      format: null,
      seleccionMultiple: null,
      question: null,
      selectedOptionRadioButton: null,
    });

    modalAddQuestion.closeAll();
  }

  createQuestion(validationModal: any, errorMultiple: any) {
    const form = this.createQuestionForm.value;

    const isSimpleValid =
      form.benefit &&
      form.group &&
      form.type === 'SIMPLE' &&
      form.question?.trim();

    const isMultipleValid =
      form.type === 'MULTIPLE' &&
      form.question?.trim() &&
      Object.keys(form.radioButtons || {}).length > 0;

    if (!isSimpleValid && !isMultipleValid) {
      return this.openDialog(validationModal);
    }

    // Validar opciones vacías en MULTIPLE
    if (form.type === 'MULTIPLE') {
      const hasEmptyOption = Object.values(form.radioButtons).some(
        (value: any) => !value?.trim(),
      );

      if (hasEmptyOption) {
        return this.openDialog(errorMultiple);
      }
    }

    // Construcción de opciones
    const opciones =
      form.type === 'MULTIPLE'
        ? Object.values(form.radioButtons).map((value: any) => ({
            value,
            selected: true,
          }))
        : [];

    // Tipo de dato
    const tipoDato =
      form.type === 'MULTIPLE'
        ? 'TEXTO'
        : form.format === '0' || form.format === 0
          ? 'TEXTO'
          : 'NUMERICO';

    const newQuestion = {
      groupBeneficios: { id: form.benefit.id },
      groupName: form.group.name,
      nameBenefitGroup: form.benefit.name,
      opcion: opciones,
      tipoDato,
      isEditing: false,
      name: form.question,
      newQuestion: true,
      type: form.type,
      looked: false,
      seleccionMultiple: form.seleccionMultiple,
    };

    this.insertQuestionInCorrectGroup(newQuestion);
    this.resetQuestionForm();
  }

  private insertQuestionInCorrectGroup(question: any) {
    const groupIndexes = this.allSelectedQuestions
      .map((q, index) => (q.groupName === question.groupName ? index : -1))
      .filter((index) => index !== -1);

    console.log('GROUPINDEXES:', groupIndexes, this.allSelectedQuestions);

    if (groupIndexes.length > 0) {
      // Insertar después del último del grupo
      const lastIndex = groupIndexes[groupIndexes.length - 1];
      this.allSelectedQuestions.splice(lastIndex + 1, 0, question);
    } else {
      // Si no existe el grupo → push normal
      this.allSelectedQuestions.push(question);
    }
  }

  private resetQuestionForm() {
    this.step2Modal = false;

    this.createQuestionForm.reset({
      group: null,
      benefit: null,
      type: null,
      format: null,
      seleccionMultiple: null,
      question: null,
      selectedOptionRadioButton: null,
    });

    const radioButtons = this.createQuestionForm.get(
      'radioButtons',
    ) as FormGroup;

    Object.keys(radioButtons.controls).forEach((key) => {
      radioButtons.removeControl(key);
    });
  }

  private openDialog(template: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '210px';
    this.dialog.open(template, dialogConfig);
  }

  saveQuestionEdit(
    validationModal: any,
    errorMultiple: any,
    modalAddQuestion: any,
  ) {
    console.log('this.data:', this.createQuestionForm);
    if (
      this.createQuestionForm.value.benefit &&
      this.createQuestionForm.value.group
    ) {
      if (this.createQuestionForm.value.type === 'MULTIPLE') {
        console.log('questions:', this.createQuestionForm);
        // Cambia la condición para verificar si hay alguna opción vacía
        const radioButtons = this.createQuestionForm.value.radioButtons;
        if (
          Object.keys(radioButtons).length > 0 &&
          this.createQuestionForm.value.name !== null &&
          Object.values(radioButtons).some((value: any) => value.trim() === '')
        ) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '400px';
          dialogConfig.height = '210px';
          this.dialog.open(errorMultiple, dialogConfig);
        } else {
          const result = Object.values(
            this.createQuestionForm.value.radioButtons,
          ).map((value) => ({
            value,
            selected: true,
          }));
          const index = this.allSelectedQuestions.findIndex(
            (a: any) => a.pregunta_id === this.questionEditActive.pregunta_id,
          );
          console.log('index:', index);
          if (index !== -1) {
            // Si se encuentra el objeto, actualiza los valores directamente en el arreglo
            // Si se encuentra el objeto, reemplaza todo el objeto en el arreglo con `data`
            this.allSelectedQuestions[index] = {
              groupBeneficios: { id: this.createQuestionForm.value.benefit.id },
              groupName: this.createQuestionForm.value.group.name,
              nameBenefitGroup: this.createQuestionForm.value.benefit.name,
              opcion:
                this.createQuestionForm.value.type === 'MULTIPLE' ? result : [],
              tipoDato:
                this.createQuestionForm.value.type === 'MULTIPLE'
                  ? 'TEXTO'
                  : this.createQuestionForm.value.format,
              isEditing: false,
              name: this.createQuestionForm.value.question,
              newQuestion: true,
              type: this.createQuestionForm.value.type,
              looked: this.createQuestionForm.value.looked,
              seleccionMultiple:
                this.createQuestionForm.value.seleccionMultiple,
              pregunta_id: this.createQuestionForm.value.pregunta_id,
            };
          }

          console.log('dataDATA:', this.allSelectedQuestions);
          this.step2Modal = false;

          // Resetea el formulario
          this.createQuestionForm.reset({
            group: null,
            benefit: null,
            type: null,
            format: null,
            seleccionMultiple: null,
            question: null,
            selectedOptionRadioButton: null,
          });

          // Obtén el FormGroup de radioButtons
          const radioButtons = this.createQuestionForm.get(
            'radioButtons',
          ) as FormGroup;

          // Elimina todos los controles del grupo de radio buttons
          Object.keys(radioButtons.controls).forEach((key) => {
            radioButtons.removeControl(key);
          });
          console.log('fin1:', this.createQuestionForm.value);
        }
      } else if (this.createQuestionForm.value.type === 'SIMPLE') {
        const result = Object.values(
          this.createQuestionForm.value.radioButtons,
        ).map((value) => ({
          value,
          selected: true,
        }));

        const index = this.allSelectedQuestions.findIndex(
          (a: any) => a.pregunta_id === this.questionEditActive.pregunta_id,
        );
        console.log('index:', index);
        if (index !== -1) {
          // Si se encuentra el objeto, actualiza los valores directamente en el arreglo
          // Si se encuentra el objeto, reemplaza todo el objeto en el arreglo con `data`
          this.allSelectedQuestions[index] = {
            groupBeneficios: { id: this.createQuestionForm.value.benefit.id },
            groupName: this.createQuestionForm.value.group.name,
            nameBenefitGroup: this.createQuestionForm.value.benefit.name,
            opcion:
              this.createQuestionForm.value.type === 'MULTIPLE' ? result : [],
            tipoDato:
              this.createQuestionForm.value.type === 'MULTIPLE'
                ? 'TEXTO'
                : this.createQuestionForm.value.format,
            isEditing: false,
            name: this.createQuestionForm.value.question,
            newQuestion: true,
            type: this.createQuestionForm.value.type,
            looked: this.createQuestionForm.value.looked,
            seleccionMultiple: this.createQuestionForm.value.seleccionMultiple,
            pregunta_id: this.createQuestionForm.value.pregunta_id,
          };
        }

        console.log('dataDATA:', this.allSelectedQuestions);
        this.step2Modal = false;

        // Resetea el formulario
        this.createQuestionForm.reset({
          group: null,
          benefit: null,
          type: null,
          format: null,
          seleccionMultiple: null,
          question: null,
          selectedOptionRadioButton: null,
        });

        // Obtén el FormGroup de radioButtons
        const radioButtons = this.createQuestionForm.get(
          'radioButtons',
        ) as FormGroup;

        // Elimina todos los controles del grupo de radio buttons
        Object.keys(radioButtons.controls).forEach((key) => {
          radioButtons.removeControl(key);
        });

        console.log('fin2:', this.createQuestionForm.value);
      } else {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '400px';
        dialogConfig.height = '210px';
        this.dialog.open(errorMultiple, dialogConfig);
      }
    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '210px';
      this.dialog.open(validationModal, dialogConfig);
    }
  }

  test() {
    console.log('datA:', this.createQuestionForm.value);
  }

  async createPoll(success: any, loadingData: any, errorsendfiles2: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.maxHeight = '200px';
    dialogConfig.height = '100%';
    let dialogRef = this.dialog.open(loadingData, dialogConfig);

    let quest = null;
    let data = null;
    let company = null;

    data = {
      name: this.estudio.estudiesName,
      type: null,
      group: null,
      estudies: {
        id: this.estudio.id,
      },
    };

    try {
      /*const diferencia = this.historyQuestions.filter(
        (question) => !this.allSelectedQuestions.includes(question)
      );*/
      // Usa Promise.all para esperar a que se completen todas las eliminaciones
      console.log('hay diferencia2:', this.tmpQuestions);
      await Promise.all(
        this.tmpQuestions.map((question: any) =>
          this.dataservice.deleteQuestions(question.pregunta_id),
        ),
      );

      // Crear encuesta y luego asociar preguntas
      await this.dataservice
        .createPoll(data)
        .then(async (survey: any) => {
          try {
            let arrayQuestions = [];
            if (this.id && this.typeAction) {
              // Obtener un array de todas las preguntas seleccionadas y añadir survey_id
              arrayQuestions = this.allSelectedQuestions.map((question) => ({
                name: question.name,
                type: question.type,
                opcion: JSON.stringify(
                  question.opcion
                    .filter((option: any) => option.selected) // Filtra las opciones donde selected es true
                    .map((option: any) => option.value), // Extrae solo los valores
                ),
                tipoDato:
                  question.tipoDato === 'TEXTO' || question.tipoDato === '0'
                    ? 'TEXTO'
                    : 'NUMERICO',
                groupBeneficios: question.groupBeneficios,
                pregunta_id: question.pregunta_id,
                looked: question.looked ? question.looked : false,
                seleccionMultiple: question.seleccionMultiple,
                survey: {
                  survey_id: survey.survey_id,
                },
                questionNumber: question.pregunta_id ? question.pregunta_id : 0,
              }));
            } else {
              // Obtener un array de todas las preguntas seleccionadas y añadir survey_id
              arrayQuestions = this.allSelectedQuestions.map((question) => ({
                name: question.name,
                type: question.type,
                opcion: JSON.stringify(
                  question.opcion
                    .filter((option: any) => option.selected) // Filtra las opciones donde selected es true
                    .map((option: any) => option.value), // Extrae solo los valores
                ),
                tipoDato:
                  question.tipoDato === 'TEXTO' || question.tipoDato === '0'
                    ? 'TEXTO'
                    : 'NUMERICO',
                groupBeneficios: question.groupBeneficios,
                looked: question.looked ? question.looked : false,
                seleccionMultiple: question.seleccionMultiple,
                survey: {
                  survey_id: survey.survey_id,
                },
                questionNumber: question.pregunta_id ? question.pregunta_id : 0,
              }));
            }

            // Llamar al servicio una sola vez con todos los IDs
            const result: any =
              await this.dataservice.createAllQuestion(arrayQuestions);
            console.log('result:', result);

            this.modalSuccess(success);
          } catch (error) {
            this.modalSuccess(errorsendfiles2);
            // Manejar errores aquí si la creación falla
            console.error('Error al crear preguntas:', error);
          }

          dialogRef.close();
        })
        .catch((error) => {
          console.error('Error creating poll:', error);
          throw error;
        });
    } catch (error) {
      this.snackBar.open('No se ha podido crear la encuesta', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  modalSuccess(success: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '210px';
    this.dialog.open(success, dialogConfig);
  }

  // Método para manejar el cambio de selección
  onSelectionChangeTemplate(event: any): void {
    console.log('event:', event.options[0].value);
    this.selectedTemplate = event.options[0].value;
  }

  async selectTemplate(modal: any) {
    let response: any = await this.dataservice.selectedTemplate(
      this.selectedTemplate.id,
    );
    let questions: any[] = [];

    // Recorre la respuesta para establecer el estado de checked
    response.forEach((benefit: any) => {
      benefit.groupBeneficios.forEach((group: any) => {
        group.preguntas.forEach((pregunta: any) => {
          let event = { checked: true };
          pregunta.name = pregunta.pregunta_name;
          pregunta.checked = true;
          pregunta.looked = false;
          this.toggleChecked(pregunta, event, benefit);
          questions.push(pregunta);
        });
      });
    });

    this.benefitTypes.forEach((benefitT: any) => {
      benefitT.groupBeneficios.forEach((groupT: any) => {
        groupT.preguntas.forEach((preguntaT: any) => {
          // Busca si existe una pregunta en 'questions' con el mismo nombre que preguntaT.name
          const foundQuestion = questions.find(
            (q: any) => q.pregunta_name === preguntaT.name,
          );

          // Si la pregunta existe, establece checked en true
          if (foundQuestion) {
            preguntaT.checked = true;
          }
        });
      });
    });

    console.log('Datos del formulario:', this.allSelectedQuestions);
  }

  isQuestionSelected(question: any): boolean {
    return this.selectedQuestions.includes(question.name);
  }

  async getTemplate(modal: any) {
    this.allTemplates = await this.dataservice.getTemplate();
    console.log('templateS:', this.allTemplates);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '600px';
    dialogConfig.height = 'auto';
    this.dialog.open(modal, dialogConfig);
  }
}
