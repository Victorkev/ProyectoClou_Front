import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DataserviceService } from 'src/app/services/dataservice.service';

@Component({
  selector: 'app-add-empresa',
  templateUrl: './add-empresa.component.html',
  styleUrls: ['./add-empresa.component.css']
})
export class AddEmpresaComponent {
  @Input() estudio: any;
  @Input() consultor: any;
  empresasForm: FormGroup;
  empresas: any[] = []; // Empresas disponibles
  isCheckedEmpresaAll = false;
  isCheckedEmpresa: boolean[] = [];
  isCheckedEmpresaPeople: boolean[][] = [];
  selectedPersonal: any[] = []; // Array para almacenar el personal seleccionado
  precargados: any[] = []; // Datos precargados (para verificar selección inicial)
  userByEmpresa: any;
  arrayUser: any[] = []; // Array para almacenar todos los usuarios
  selectedEmployees: any[] = [];
  arrayUserDel: any[] = [];
  historicUser: any[] = [];

  constructor(private fb: FormBuilder, private dataservice: DataserviceService, private dialog: MatDialog) {
    this.empresasForm = this.fb.group({});
  }

  async ngOnInit() {
    try {
      console.log("estudioSelected:", this.estudio);
      console.log("true:", this.consultor);

      // Obtener datos de empresa y usuarios
      /* if(this.consultor === true){
         //se cargan datos con consultores
         const empresasData: any = await this.dataservice.getConsultors();
         this.empresas = empresasData.filter((a:any) => a.personal.length);
         console.log("empresasData:", this.empresas);
       }else{
         const empresasData: any = await this.dataservice.getEmpresas();
         this.empresas = empresasData.filter((a:any) => a.personal.length);
         this.fetchAndUpdateData();
       }*/

      const empresasData: any = await this.dataservice.getEmpresas();
      this.empresas = empresasData.filter((a: any) => a.personal.length);
      this.empresas.sort((a: any, b: any) => {
        if (a.empresaName < b.empresaName) return -1;
        if (a.empresaName > b.empresaName) return 1;
        return 0;
      });
      this.fetchAndUpdateData();
      console.log("arrayEmpersas:", this.empresas);
      //console.log("empresas:", this.empresas);

      // Obtener usuarios filtrados por el ID
      /*const response: any = await this.dataservice.getEmpresaById(this.estudio.id);
      console.log("responseNew:", response);

      // Extraer los IDs de los usuarios en el response
      const userIds = response.map((user: any) => user.id);

      // Filtrar las empresas que tienen personas con los IDs de response
      this.userByEmpresa = this.empresas.filter((empresa: any) =>
        empresa.personal.some((persona: any) => userIds.includes(persona.id))
      );
      console.log("data:", this.userByEmpresa);*/




      // Preparar array de usuarios con el nombre de la empresa
      this.empresas.forEach((empresaItem: any) => {
        empresaItem.personal.forEach((personalItem: any) => {
          // Añadir empresaName a cada objeto personal
          personalItem.empresaName = empresaItem.empresaName;
          this.arrayUser.push(personalItem);
        });
      });

      this.initializeCheckedArrays();
      console.log("arrayUser:", this.arrayUser);


    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  }

  updateCheckboxStates(response: any): void {
    // Crear un conjunto de IDs de empleados seleccionados para una búsqueda rápida
    const selectedEmployeesSet = new Set(response.map((emp: any) => emp.id));

    // Iterar sobre cada empresa y actualizar los estados de los checkboxes
    this.isCheckedEmpresa.forEach((_, empresaIndex) => {
      const empresa = this.empresas[empresaIndex];
      if (!empresa) return;

      // Determinar si la empresa debe estar marcada
      // Marca la empresa si al menos uno de sus empleados está seleccionado
      const anyEmployeeSelected = empresa.personal.some((persona: any) => selectedEmployeesSet.has(persona.id));
      this.isCheckedEmpresa[empresaIndex] = anyEmployeeSelected;

      // Actualizar el estado de los empleados de la empresa
      this.isCheckedEmpresaPeople[empresaIndex] = empresa.personal.map((persona: any) =>
        selectedEmployeesSet.has(persona.id)
      );
    });

    // Actualizar el array de empleados seleccionados
    this.selectedEmployees = response;
  }

  async fetchAndUpdateData() {
    try {
      const response: any = await this.dataservice.getEmpresaById(this.estudio.id);
      console.log("responseNew:", response);
      this.historicUser = response;

      if(this.consultor === true){
        let resp = response.filter((a: any) => a.tipo !== "Editor");
        this.updateCheckboxStates(resp);
        console.log("responseNew:", resp);
      }else{
        this.updateCheckboxStates(response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  initializeCheckedArrays() {
    this.isCheckedEmpresa = new Array(this.empresas.length).fill(false);
    this.isCheckedEmpresaPeople = this.empresas.map(empresa =>
      new Array(empresa.personal.length).fill(false)
    );

    console.log("checked:", this.isCheckedEmpresaPeople, this.empresas);
  }

  get allChecked(): boolean {
    return this.isCheckedEmpresa.length > 0 && this.isCheckedEmpresa.every(checked => checked);
  }

  toggleCheckedEmpresa(index: number): void {
    const isCurrentlyChecked = this.isCheckedEmpresa[index];
    this.isCheckedEmpresa[index] = !isCurrentlyChecked;

    // Actualizar el estado de los empleados de la empresa
    this.isCheckedEmpresaPeople[index] = this.isCheckedEmpresaPeople[index].map(() => !isCurrentlyChecked);

    // Añadir o eliminar empleados del array de empleados seleccionados
    if (!isCurrentlyChecked) {
      // Si la empresa estaba desmarcada y ahora está marcada, añadir todos los empleados
      this.empresas[index].personal.forEach((emp: any) => {
        // Verificar si el empleado ya está en selectedEmployees
        const exists = this.selectedEmployees.some((existingEmp: any) => existingEmp.id === emp.id);
        if (!exists) {
          // Solo añadir el empleado si no está duplicado
          this.selectedEmployees.push(emp);
        }
      });
      if(this.consultor === true){
        this.arrayUserDel = this.arrayUserDel.filter(emp =>
          // Filtrar solo los empleados que no están en personal y que están en historicUser
          !this.empresas[index].personal.some((p: any) => p.id === emp.id && p.tipo !== "Editor") &&
          this.historicUser.some((user: any) => user.id === emp.id)
        );
      }else{
        this.arrayUserDel = this.arrayUserDel.filter(emp =>
          // Filtrar solo los empleados que no están en personal y que están en historicUser
          !this.empresas[index].personal.some((p: any) => p.id === emp.id) &&
          this.historicUser.some((user: any) => user.id === emp.id)
        );
      }

      console.log("empresaDEL-SE-QUITA:", this.arrayUserDel);
      console.log("selectedAllCompany:", this.selectedEmployees);
    } else {
      this.selectedEmployees.forEach(emp => {
        // Comprobar si el empleado pertenece a la empresa desmarcada
        if(this.consultor === true){
          if (this.empresas[index].personal.some((p: any) => p.id === emp.id  && p.tipo !== "Editor")) {
            // Verificar si el empleado está en historicUser
            const isInHistoricUser = this.historicUser.some((user: any) => user.id === emp.id);
            
            if (isInHistoricUser) {
              // Añadir el empleado a arrayUserDel si está en historicUser
              this.arrayUserDel.push(emp);
            }
          }
        }else{
          if (this.empresas[index].personal.some((p: any) => p.id === emp.id)) {
            // Verificar si el empleado está en historicUser
            const isInHistoricUser = this.historicUser.some((user: any) => user.id === emp.id);
            
            if (isInHistoricUser) {
              // Añadir el empleado a arrayUserDel si está en historicUser
              this.arrayUserDel.push(emp);
            }
          }
        }

      });
      console.log("empresaDEL-SE AÑADE:", this.arrayUserDel);
      this.selectedEmployees = this.selectedEmployees.filter(emp =>
        !this.empresas[index].personal.some((p: any) => p.id === emp.id)
      );
      console.log("empresa:", this.selectedEmployees);
    }

  }

  toggleCheckedEmpresaAll(checked: boolean): void {
    this.isCheckedEmpresa = new Array(this.empresas.length).fill(checked);
    this.isCheckedEmpresaPeople = this.empresas.map(empresa =>
      new Array(empresa.personal.length).fill(checked)
    );
    // Actualizar el array de empleados seleccionados
    if (checked) {
      this.selectedEmployees = this.empresas.flatMap(empresa => empresa.personal);
      this.arrayUserDel = [];
    } else {
      if(this.consultor === true){
        this.arrayUserDel = this.empresas.flatMap(empresa =>
          empresa.personal.filter((emp: any) =>
            this.historicUser.some((user: any) => user.id === emp.id && emp.tipo !== "Editor")
          )
        );
      }else{
        this.arrayUserDel = this.empresas.flatMap(empresa =>
          empresa.personal.filter((emp: any) =>
            this.historicUser.some((user: any) => user.id === emp.id)
          )
        );
      }

      this.selectedEmployees = [];
    }
    console.log("all:", this.selectedEmployees, this.arrayUserDel);
  }

  toggleCheckedEmpresaPeople(persona: any, empresaIndex: number, personaIndex: number): void {
    console.log("dataADD:", persona);
    if (this.isCheckedEmpresaPeople[empresaIndex]) {
      const isCurrentlyChecked = this.isCheckedEmpresaPeople[empresaIndex][personaIndex];
      this.isCheckedEmpresaPeople[empresaIndex][personaIndex] = !isCurrentlyChecked;

      // Actualizar el array de empleados seleccionados
      if (!isCurrentlyChecked) {
        // Si el empleado estaba desmarcado y ahora está marcado, añadir al array
        // Si el empleado estaba marcado y ahora está desmarcado, eliminar del array
        this.selectedEmployees.push(persona);
        if(this.consultor === true){
          this.arrayUserDel = this.arrayUserDel.filter(emp => emp.id !== persona.id && persona.tipo !== "Editor");
        }else{
          this.arrayUserDel = this.arrayUserDel.filter(emp => emp.id !== persona.id);
        }

      } else {
        // Buscar el empleado en la lista de empleados seleccionados
        let delUser = this.selectedEmployees.find(emp => emp.id === persona.id);
        if(this.consultor === true){
          if (this.historicUser.some(user => user.id === delUser?.id && persona.tipo !== "Editor")) {
            this.arrayUserDel.push(delUser);
          }
        }else{
          if (this.historicUser.some(user => user.id === delUser?.id)) {
            this.arrayUserDel.push(delUser);
          }
        }
        // Verificar si el empleado existe en this.historicUser antes de agregarlo a arrayUserDel
        
        console.log("dataADD:", this.arrayUserDel);
        this.selectedEmployees = this.selectedEmployees.filter(emp => emp.id !== persona.id);
      }

      // Actualizar el estado del checkbox de la empresa si es necesario
      const allChecked = this.empresas[empresaIndex].personal.every((p: any, i: any) => this.isCheckedEmpresaPeople[empresaIndex][i]);
      this.isCheckedEmpresa[empresaIndex] = allChecked;
    }
  }

  async saveEmpresa(success: any) {
    console.log("selectedPersonal:", this.selectedEmployees);
  
    try {
      // Asociar empresas y esperar a que todas las promesas se resuelvan
      await Promise.all(this.selectedEmployees.map(async (persona) => {
        let company = {
          id: this.estudio.id
        };
        return await this.dataservice.asociarEmpresa(persona.id, company);
      }));
  
      // Si todas las promesas de asociación de empresa se resuelven correctamente,
      // ahora ejecutamos la eliminación de los usuarios en arrayUserDel
      await Promise.all(this.arrayUserDel.map(async (user) => {
        return await this.dataservice.deleteByEmpresas(user.id, this.estudio.id); // Llamar al servicio de eliminación
      }));
  
      // Si todo ha ido bien, abrir el modal
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '400px';
      dialogConfig.height = '210px';
      this.dialog.open(success, dialogConfig);
  
    } catch (error) {
      console.error("Error al asociar empresa o eliminar usuarios:", error);
      // Manejar el error adecuadamente si es necesario
    }
  }

  closeData() {
    this.dialog.closeAll();
    location.reload();
  }
}

