import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

export interface userData {
  atributo: any[];
  id: any,
  isValid: any,
  personal: any;
  role: { roleName: string, roleDescription: string }[];
  token: any;
  username: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataserviceService {
  //public endpoint:any = "https://estudios.clouhr.cl";
  //public endpoint:any = "http://154.12.246.51:8090"; 
  public endpoint: any = "http://200.63.98.203:9010";
  public headers: any = HttpHeaders;
  private _userData: userData | null;
  private inactivityTimer: any;

  constructor(private http: HttpClient, public router: Router) {
    let userData: any = localStorage.getItem('userData');
    this._userData = !!localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') ?? '{}') : null;
    this.setupHeaders();

    // Escucha cambios en el almacenamiento
    window.addEventListener('storage', (event) => {
      if (event.key === 'userData') {
        this._userData = event.newValue ? JSON.parse(event.newValue) : null;
        this.setupHeaders(); // Actualiza las cabeceras
      }
    })
  }

  private setupHeaders() {
    if (this._userData && this._userData.token) {
      console.log("entra1");
      this.headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._userData.token);
    } else {
      this.headers = new HttpHeaders().set('Content-Type', 'application/json');
    }
  }

  isLoggedIn = (): boolean => {
    console.log("session:", this._userData);
    return !!this._userData;
  }

  login(data: any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/auth/login', {
          username: data.username,
          password: data.password
        })
        .subscribe(
          (result: any) => {
            console.log("result:", result);
            this._userData = result;
            localStorage.setItem('userData', JSON.stringify(result));
            this.setupHeaders(); // Actualiza las cabeceras
            this.startInactivityTimer(); // Reiniciar temporizador después de login
            resolve(result);
          },
          (error: any) => {
            console.log("Error:", error);
            reject(error);
          }
        );
    });
  }


  // Iniciar el temporizador de inactividad
  private startInactivityTimer(): void {
    // Si el temporizador ya está en marcha, lo limpiamos
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Establecer el temporizador de inactividad para 5 minutos
    this.inactivityTimer = setTimeout(() => {
      this.logout(); // Llamar al método logout después de 5 minutos
    }, 10 * 60 * 1000); // 5 minutos en milisegundos
  }

  // Reiniciar el temporizador en caso de actividad del usuario
  resetInactivityTimer(): void {
    this.startInactivityTimer(); // Reiniciar el temporizador
  }

  logout = async () => {
    // Limpia los datos en memoria
    this._userData = null;
  
    // Elimina los datos del almacenamiento local
    localStorage.removeItem('userData');
  
    // Limpia las cabeceras
    this.setupHeaders();
  
    // Opcional: Redirigir al usuario al login
     this.router.navigate(['/login']);
  };

  getPreguntas() {
    //console.log("DATA:", JSON.stringify(this._userData));
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/questions/get', {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getEstudies() {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.endpoint + '/api/estudies/get', {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        },
          (error: any) => {
            console.log("EL ERROR ES:", error);
            reject(error);
          });
    });
  }

  getSurvey() {
    //console.log("DATA:", JSON.stringify(this._userData));
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/survey/get', {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getEmpresaById(idEstudio: any) {
    //console.log("DATA:", JSON.stringify(this._userData));
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/personals/getbyestudyid/' + idEstudio, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getConsultors(){
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/empresas/getConsultor', {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getDataFromSurvey(idEstudio: any) {
    //console.log("DATA:", JSON.stringify(this._userData));
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/estudies/getResume/' + idEstudio, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }



  getDescriptionBenefits(value: any) {
    return new Promise((resolve, reject) => {
      this.http
      .get(this.endpoint + '/api/group/getDesc?name=' + value, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        },
          (error: any) => {
            console.log("EL ERROR ES:", error);
            resolve(error);
          });
    });
  }

  getCargo() {
    //console.log("DATA:", JSON.stringify(this._userData));
    return new Promise((resolve) => {
      this.http
        .post(this.endpoint + '/api/excel/upload/cargos', {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  consolidarxempresa(estudioId: any, empresaId: any, metadata: any) {
    return new Promise((resolve, reject) => {
      this.http.get(this.endpoint + '/api/metadata/down/' + estudioId + '/' + empresaId + '/' + metadata, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this._userData?.token}`
        }),
        responseType: 'blob' // Important for file downloads
      }).subscribe(
        (result: Blob) => {
          this.handleFileDownload(result, "consolidado.xlsx"); // Handle the file download
          resolve(result);
        },
        (error) => {
          console.error('Error downloading file:', error);
          reject(error);
        }
      );
    });
  }

  getMetricsData(tipo: any, status: any, year: any, entrega: any): Promise<any[]> {
    console.log("dataservice:", tipo, status, year, entrega);

    // Construir la URL dinámicamente según los valores recibidos
    let url = `${this.endpoint}/api/survey/getByEstudys?`;
    const params = [];

    if (tipo) {
      params.push(`tipeStudies=${tipo}`);
    }
    if (status) {
      params.push(`status=${status}`);
    }
    if (year) {
      params.push(`year=${year}`);
    }
    if (entrega) {
      params.push(`entrega=${entrega}`);
    }

    // Unir los parámetros con "&" y añadirlos a la URL
    url += params.join('&');

    return new Promise((resolve, reject) => {
      this.http
        .get(url, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          }),

        })
        .subscribe(
          (result: any) => {
            try {
              resolve(result);
            } catch (error) {
              console.error('Error al parsear la respuesta:', error);
              resolve([]); // Resolver con un array vacío en caso de error
            }
          },
          (error) => {
            console.error('Error en la solicitud:', error);
            reject(error);
          }
        );
    });
  }

  getDataFiles(idEstudio: any, idUsuario: any) {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/uploadFiles/get/study/' + idEstudio + '/' + idUsuario, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getPdfFile(file: any) {
    console.log("file:", file);
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + "/" + file, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getDataFilesByStudy(idEstudio: any) {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/uploadFiles/get/study/' + idEstudio, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }


  getFiltersByStudy(idEstudio: any) {
    //console.log("DATA:", JSON.stringify(this._userData));
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/custom/benefits/filters?id=' + idEstudio, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getEmpresaByEstudio(idEstudio: any) {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/survey/getByEstudy/' + idEstudio, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getFilesByConsolidar(idEstudio: any) {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/v1/filesEstudies/getFilesByConsolidar/' + idEstudio, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe( (result: any) => {
          resolve(result);
        },
        (error) => {
          resolve({ "error": error });
        });
    });
  }

  createStudy(data: any) {
    console.log("data", data);
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/estudies/save', data, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error) => {
            console.error('Error:', error); // Logging del error
            resolve({ "error": error });
          }
        );
    });
  }

  toggleQuestion(idGroup: any, idBeneficio:any, data:any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + `/api/estudies/${idGroup}/grupos/${idBeneficio}/applicability`, data, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error) => {
            console.error('Error:', error); // Logging del error
            resolve({ "error": error });
          }
        );
    });
  }

  deleteQuestions(id: any) {
    return new Promise((resolve, reject) => {
      this.http.delete(this.endpoint + '/api/v2/questions/delete/' + id, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this._userData?.token}`
        })
      })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error) => {
            console.error('Error:', error); // Logging del error
            resolve({ "error": error });
          }
        );
    });
  }

  savePdfFilesMultiple(file:any, estudioId:any) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      console.log("file:", file);
      this.http
        .post(this.endpoint + '/api/v1/filesEstudies/saveDownload/' + estudioId, formData, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  
  getPdfFilesMultiple(estudioId: any) {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/v1/filesEstudies/getFilesByTypebase/' + estudioId, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            if (result && result.length > 0) {
              resolve(result);
            } else {
              resolve([]); // si no hay datos
            }
          },
          (error) => {
            if (error.status === 404) {
              // 👈 tratamos 404 como "sin datos"
              resolve([]);
            } else {
              console.error('Error al obtener archivos:', error);
              resolve([]); // o reject si querís que el error suba
            }
          }
        );
    });
  }

  getPdfFilesMultiple2(estudioId: any) {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.endpoint + '/api/v1/filesEstudies/getFilesByType/' + estudioId, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            // Verificamos si result tiene datos
            if (result && result.length > 0) {
              resolve(result);
            } else {
              // Si no hay datos, puedes resolver con un valor por defecto o manejarlo de otra forma
              resolve([]); // o reject(new Error('No data found'));
            }
          },
          (error) => {
            // Manejar errores en la solicitud HTTP
            reject(error);
          }
        );
    });
  }

  deleteFiles(idFile:any){
    return new Promise((resolve, reject) => {
      this.http
        .delete(this.endpoint + '/api/v1/filesEstudies/delete/' + idFile, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }



  asociarEmpresa(persona: any, company: any) {
    console.log("persona:", persona, company);
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/personals/add/Survey/' + persona, company, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            console.log("resultado:", result);
            resolve(result);
          },
          (error: any) => {
            // Verificar si el error es el específico que quieres ignorar
            if (error.status === 400 && error.error?.message === "El Estudio ya ha sido agregada al Personal.") {
              console.log("Error específico detectado, continuando sin interrumpir el flujo.");
              resolve(null); // Continúa sin rechazar la promesa
            } else {
              reject(error); // Para otros errores, rechaza la promesa
            }
          }
        );
    });
  }

  deleteStudy(studyId: any) {
    return new Promise((resolve, reject) => {
      this.http
        .delete(this.endpoint + '/api/estudies/delete/' + studyId, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  createPoll(data: any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/survey/save', data, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            console.log("response:", result);
            resolve(result);
          }
        );
    });
  }

  createQuestion(idSurvey: any, arrayQuestions: any) {
    console.log("ENVIO QUESTIONS:", idSurvey, arrayQuestions);
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/questions/addSurvey/' + idSurvey, arrayQuestions, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  createAllQuestion(arrayQuestions: any) {
    console.log("ENVIO QUESTIONS:", arrayQuestions);
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/v2/questions/saveAll', arrayQuestions, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            console.log("errorModal:", error);
            reject(error);
          }
        );
    });
  }


  getBenefitTypes() {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/typeb/getAll', {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  async getDetailsFromStudy(idEncuesta: any, idEmpresa: any, idUsuario: any): Promise<any> {
    let data: any[] = [];
    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._userData?.token}`
      });

      const result: any = await this.http.get(this.endpoint + '/api/survey/' + idEncuesta + '/details/' + idEmpresa + '/' + idUsuario, { headers }).toPromise();

      return result;

    } catch (error) {
      throw error;
    }
  }

  getStudyById(idEmpresa: any) {
    let iduser = this.userData?.id;
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/empresas/getByEmpresaId/' + idEmpresa + '/userid/' + iduser, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getClientById(idEmpresa: any) {
    let iduser = this.userData?.id;
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/personals/getByPersonalId/' + iduser, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  sendObs(idEstudio: any, observation: any) {
    let iduser = this.userData?.id;
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/uploadFiles/updateObs/' + idEstudio + '?obs=' + observation, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  sendAdminObs(data: any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/v1/obs/save', data, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          }),
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  validateFiles(data: any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/filedata/upload/', {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          }),
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  getCustomResponses(idStudy: any) {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/personals/getCustomResponses/' + idStudy, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getUploadFiles(idEstudio: any) {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/metadata/download/' + idEstudio, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          }), responseType: 'text'
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  uploadPlainBase(estudioId: any, file: any) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      this.http
        .post(this.endpoint + '/api/baseplain/upload/' + estudioId, formData, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error) => {
            reject(error);  // Si ocurre un error, rechaza la promesa
          }
        );
    });
  }

  getDataFromFilters(idEstudio: any, area: any, cargo: any, filters: any) {
    // Asegúrate de que los campos obligatorios están presentes
    const queryParams = new URLSearchParams({
      filtro_area_funcional: area || 'todos',
      filtro_cargo: cargo || 'todos'
    });

    // Añade los filtros opcionales al objeto de parámetros de consulta
    for (const [key, value] of Object.entries(filters)) {
      // Reemplaza los espacios por guiones bajos
      const formattedKey = key.replace(/\s+/g, '_');

      // Asegúrate de no duplicar los valores ya añadidos manualmente
      if (formattedKey !== 'filtro_area_funcional' && formattedKey !== 'filtro_cargo') {
        queryParams.append(`filtro_${formattedKey}`, String(value || 'todos'));
      }
    }

    // Construye la URL final
    const url = `${this.endpoint}/api/custom/benefits/fetch/${idEstudio}?${queryParams.toString()}`;

    console.log("URL construida:", url);

    return new Promise((resolve) => {
      this.http
        .get(url, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getDataFromFilters3(idEstudio: any, area: any, cargo: any, filters: any) {
    console.log("filters:", filters);

    // Asegúrate de que los campos obligatorios están presentes
    const queryParams = new URLSearchParams({

    });

    // Añade los filtros opcionales al objeto de parámetros de consulta
    for (const [key, value] of Object.entries(filters)) {
      // Reemplaza los espacios por guiones bajos
      const formattedKey = key.replace(/\s+/g, '_');

      // Asegúrate de no duplicar los valores ya añadidos manualmente
      if (formattedKey !== 'filtro_area_funcional' && formattedKey !== 'filtro_cargo') {
        queryParams.append(`filtro_${formattedKey}`, String(value || 'todos'));
      }
    }

    // Construye la URL final
    const url = `${this.endpoint}/api/custom/benefits/fetch/${idEstudio}/${area}?${queryParams.toString()}`;

    console.log("URL construida:", url);

    return new Promise((resolve) => {
      this.http
        .get(url, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          console.log("resultado::", result);
          resolve(result);
        });
    });
  }

  getDataFromFilters2(idEstudio: any, area: any, filters: any) {
    // Asegúrate de que los campos obligatorios están presentes
    const queryParams = new URLSearchParams({
      filtro_beneficio: area || 'todos',
    });

    // Añade los filtros opcionales al objeto de parámetros de consulta
    for (const [key, value] of Object.entries(filters)) {
      // Reemplaza los espacios por guiones bajos
      const formattedKey = key.replace(/\s+/g, '_');

      // Asegúrate de no duplicar los valores ya añadidos manualmente
      if (formattedKey !== 'filtro_beneficio') {
        queryParams.append(`filtro_${formattedKey}`, String(value || 'todos'));
      }
    }

    // Construye la URL final
    const url = `${this.endpoint}/api/custom/benefits/fetch/${idEstudio}?${queryParams.toString()}`;


    return new Promise((resolve) => {
      this.http
        .get(url, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  saveSurvey(data: any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/anserws/sabe', data, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  saveSurveyAll(data: any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/anserws/saveAll', data, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  downloadFile(file: any) {
    console.log("salida:", this.endpoint + "/" + file.url);
    return new Promise((resolve, reject) => {
      this.http.post(this.endpoint + "/" + file.url, {}, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this._userData?.token}`
        }),
        responseType: 'blob' // Important for file downloads
      }).subscribe(
        (result: Blob) => {
          this.handleFileDownload(result, file.name); // Handle the file download
          resolve(result);
        },
        (error) => {
          console.error('Error downloading file:', error);
          reject(error);
        }
      );
    });
  }

  handleFileDownload(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob); // Create a URL for the blob
    const a = document.createElement('a'); // Create a link element
    a.href = url;
    a.download = fileName; // Set the file name
    document.body.appendChild(a);
    a.click(); // Simulate a click to trigger download
    document.body.removeChild(a); // Remove the link from the document
    window.URL.revokeObjectURL(url); // Clean up the URL object
  }

  uploadFileClient(metaDataId: any, estudioId: any, userId: any, file: any) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      this.http
        .post(this.endpoint + '/api/uploadFiles/save/' + userId + '/' + estudioId + '/' + metaDataId, formData, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  getEmpresas() {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/empresas/get', {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  deleteByEmpresas(id:any, estudioId:any) {
    return new Promise((resolve) => {
      this.http
        .delete(this.endpoint + '/api/personals/deletebyestudy/'+id+"/"+estudioId, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }


  saveEmpresa(form: any) {
    const requestOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this._userData?.token}`
      })
    };

    return new Promise((resolve, reject) => {
      this.http.post(this.endpoint + '/api/empresas/add', form, requestOptions)
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  addEmpresaUser(form: any) {
    const requestOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this._userData?.token}`
      })
    };

    return new Promise((resolve, reject) => {
      this.http.post(this.endpoint + '/api/personals/save', form, requestOptions)
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  sendEmailMasivo(form: any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/emailServices/send', {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  sendEmailRecovery(correo: any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(
          this.endpoint + '/api/password-reset/request?email=' + correo,
          {},
          {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${this._userData?.token}`
            })
          }
        )
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            resolve(error);
          }
        );
    });
  }

  saveNewPassword(correo: any, token: any, password: any) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/password-reset/reset?token=' + token + '&password=' + password + '&username=' + correo, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  changeStatus(idEstudio: any, status: any) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._userData?.token}`
      });

      const url = `${this.endpoint}/api/estudies/updateStatusById?id=${idEstudio}&status=${status}`;
      console.log('URL:', url); // Logging de la URL

      this.http
        .post(url, {}, { headers })
        .subscribe(
          (result: any) => {
            console.log('Response:', result); // Logging de la respuesta
            resolve(result);
          },
          (error) => {
            console.error('Error:', error); // Logging del error
            reject(error);
          }
        );
    });
  }

  uploadStudy(file: any, idEstudio: any) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      this.http
        .post(this.endpoint + '/api/v1/filesEstudies/save/' + idEstudio, formData, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          }),
        })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            console.log("errorDS:", error);
            reject(error);
          }
        );
    });
  }


  downloadResponse(estudio: any) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._userData?.token}`
      });
      let url: any;
      console.log("window:", window.location.hostname, estudio);
      if (window.location.hostname === '200.63.98.203') {
        url = `${this.endpoint}/api/consolidado/download/${estudio.id}`;
        console.log("url:", url);
      } else {
        url = `${this.endpoint}/api/consolidado/download/${estudio.id}`;
      }

      //console.log('URL:', url); // Logging de la URL

      this.http
        .get(url, { headers, responseType: 'blob' }) // Cambiado responseType a 'blob'
        .subscribe(
          (result: Blob) => {
            console.log('Response:', result); // Logging de la respuesta

            // Crear un objeto URL para el blob y descargar el archivo
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(result);
            a.href = objectUrl;

            a.download = `Encuestas_${estudio.estudiesName}.xlsx`; // Puedes cambiar el nombre del archivo si es necesario
            a.click();
            URL.revokeObjectURL(objectUrl);
            console.log("downloadREPONSE:", a);
            resolve(result);
          },
          (error) => {
            console.error('Error:', error); // Logging del error
            reject(error);
          }
        );
    });
  }

  uploadCargos(estudioId: any, file: any) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._userData?.token}`
      });
      const formData = new FormData();
      formData.append('file', file);
      this.http
        .post(this.endpoint + '/api/excel/upload/cargos/' + estudioId, formData, { headers, responseType: 'text' })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  uploadPdfResumen(estudioId: any, file: any) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this._userData?.token}`
      });
      const formData = new FormData();
      formData.append('id', estudioId);
      formData.append('File', file);
      this.http
        .put(this.endpoint + '/api/estudies/update', formData, { headers, responseType: 'text' })
        .subscribe(
          (result: any) => {
            resolve(result);
          }
        );
    });
  }

  getCargos(idEstudio: any, name: any) {

    const nombreCargo = name; // Nombre que deseas enviar
    const encodedNombreCargo = encodeURIComponent(nombreCargo); // Codificar el nombre
    console.log("cargods:", encodedNombreCargo);

    // Usar comillas invertidas para las plantillas literales
    const url = `${this.endpoint}/api/excel/get/cargos?name=${encodedNombreCargo}&studiesId=${idEstudio}`;


    return new Promise((resolve) => {
      this.http
        .get(url, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }

  getFileByStudy(idEstudio: any) {
    return new Promise((resolve) => {
      this.http
        .get(this.endpoint + '/api/v1/filesEstudies/get/' + idEstudio, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this._userData?.token}`
          })
        })
        .subscribe((result: any) => {
          resolve(result);
        });
    });
  }
  validateFormSuccess(metadataId: any, estudioId: any, userId: any, idfile: any) {
    console.log("dataUser:", this._userData);
    return new Promise((resolve, reject) => {
      this.http
        .post(this.endpoint + '/api/filedata/upload/' + metadataId + '/' + estudioId + '/' + userId + '/' + idfile,
          {}, // No hay cuerpo en la solicitud
          {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${this._userData?.token}`
            })
          })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  getTemplate() {
    console.log("dataUser:", this._userData);
    return new Promise((resolve, reject) => {
      this.http
        .get(this.endpoint + '/api/survey/getTemplate',
          {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${this._userData?.token}`
            })
          })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  getHtmlFormat(id:any){
    return new Promise((resolve, reject) => {
      this.http
        .get(this.endpoint + '/api/formatHtml/all/' + id,
          {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${this._userData?.token}`
            })
          })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  selectedTemplate(id: any) {
    console.log("dataUser:", this._userData);
    return new Promise((resolve, reject) => {
      this.http
        .get(this.endpoint + '/api/survey/' + id + '/details',
          {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${this._userData?.token}`
            })
          })
        .subscribe(
          (result: any) => {
            resolve(result);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }







  get userData(): userData | null {
    return this._userData;
  }


}



