import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatStepperModule } from '@angular/material/stepper';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EstudiosComponent } from './estudios/estudios.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { FormularioComponent } from './form/formulario/formulario.component';
import { HomeComponent } from './home/home.component';
import { CreateFormComponent } from './form/create-form/create-form.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CreatePollComponent } from './form/create-poll/create-poll.component';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { ResponseQuestionsComponent } from './clients/show-surveys/response-questions/response-questions.component';
import { ShowSurveysComponent } from './clients/show-surveys/show-surveys.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { ChangePasswordComponent } from './recovery-password/change-password/change-password.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FileUploadComponent } from './clients/show-surveys/file-upload/file-upload.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTreeModule } from '@angular/material/tree';
import { EmailMasivoComponent } from './emails/email-masivo/email-masivo.component';
import { UploadFileStudyComponent } from './form/upload-file-study/upload-file-study.component';
import { AddEmpresaComponent } from './form/add-empresa/add-empresa.component';
import { TruncatePipe } from './truncate';
import { MatListModule } from '@angular/material/list';
import { DialogUploadPdfMultipleComponent } from './form/dialog-upload-pdf-multiple/dialog-upload-pdf-multiple.component';
import { AddConsultorComponent } from './form/add-consultor/add-consultor.component';
import { FooterComponent } from './footer/footer.component';
import { BienvenidaComponent } from './bienvenida/bienvenida.component';
import { getPaginatorIntl } from './mat-paginator-intl-es';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EstudiosComponent,
    FormularioComponent,
    HomeComponent,
    CreateFormComponent,
    CreatePollComponent,
    ResponseQuestionsComponent,
    ShowSurveysComponent,
    RecoveryPasswordComponent,
    ChangePasswordComponent,
    FileUploadComponent,
    EmailMasivoComponent,
    UploadFileStudyComponent,
    AddEmpresaComponent,
    TruncatePipe,
    DialogUploadPdfMultipleComponent,
    AddConsultorComponent,
    FooterComponent,
    BienvenidaComponent
  ],
  imports: [
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTreeModule,
    MatSortModule,
    BrowserModule,
    MatExpansionModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    FormsModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSidenavModule,
    CdkTreeModule,
    MatStepperModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDialogModule,
    MatChipsModule,
    MatListModule
  ],
  exports: [
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule
  ],
  providers: [ 
    { provide: MatPaginatorIntl, useValue: getPaginatorIntl() }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
