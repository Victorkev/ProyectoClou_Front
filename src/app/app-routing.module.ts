import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { EstudiosComponent } from './estudios/estudios.component';
import { FormularioComponent } from './form/formulario/formulario.component';
import { HomeComponent } from './home/home.component';
import { CreateFormComponent } from './form/create-form/create-form.component';
import { CreatePollComponent } from './form/create-poll/create-poll.component';
import { ResponseQuestionsComponent } from './clients/show-surveys/response-questions/response-questions.component';
import { ShowSurveysComponent } from './clients/show-surveys/show-surveys.component';
import { ChangePasswordComponent } from './recovery-password/change-password/change-password.component';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { AuthGuard } from './guards/auth.guard';
import { EmailMasivoComponent } from './emails/email-masivo/email-masivo.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'client/study', component: EstudiosComponent, canActivate: [AuthGuard] },
  { path: 'estudios', component: FormularioComponent, canActivate: [AuthGuard]},
  { path: 'admin/home', component: HomeComponent,canActivate: [AuthGuard]},
  { path: 'add-study', component: CreateFormComponent,canActivate: [AuthGuard]},
  { path: 'add-poll', component: CreatePollComponent,canActivate: [AuthGuard]},
  { path: 'add-poll/:id', component: CreatePollComponent},
  { path: 'client/response', component: ResponseQuestionsComponent,canActivate: [AuthGuard]},
  { path: 'client/surveys', component: ShowSurveysComponent,canActivate: [AuthGuard]},
  { path: 'recovery', component: RecoveryPasswordComponent},
  { path: 'client/reset-password', component: ChangePasswordComponent },
  { path: 'admin/emails', component: EmailMasivoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,  { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
