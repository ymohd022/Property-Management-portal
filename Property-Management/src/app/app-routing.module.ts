import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddPropertyComponent } from './dashboard/properties/add-property/add-property.component';
import { PropertiesListComponent } from './dashboard/properties/properties-list/properties-list.component';

const routes: Routes = [
  {path: '', redirectTo: '/sp', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'sp', component: SplashScreenComponent},
  {
    path: "dashboard",
    component: DashboardComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: "properties",
    component: PropertiesListComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: "properties/add",
    component: AddPropertyComponent,
    // canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
