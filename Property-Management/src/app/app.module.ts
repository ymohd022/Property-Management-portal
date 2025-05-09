import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {  HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from "@angular/common/http"
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from "@angular/material/chips"
import { MatExpansionModule } from "@angular/material/expansion"
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';


// Components
import { AppComponent } from './app.component';

// Routes
import { AppRoutingModule } from './app-routing.module';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { TopToolbarComponent } from './top-toolbar/top-toolbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { KpiCardComponent } from './dashboard/kpi-card/kpi-card.component';
import { ChartCardComponent } from './dashboard/chart-card/chart-card.component';
import { AddPropertyComponent } from './dashboard/properties/add-property/add-property.component';
import { PropertiesListComponent } from './dashboard/properties/properties-list/properties-list.component';
import { AgentsListComponent } from './dashboard/agents/agents-list/agents-list.component';
import { AddAgentComponent } from './dashboard/agents/add-agent/add-agent.component';
import { AssignAgentDialogComponent } from './dashboard/agents/assign-agent-dialog/assign-agent-dialog.component';
import { AgentDashboardComponent } from './dashboard/agents/agent-dashboard/agent-dashboard.component';
import { AgentLeadsComponent } from './dashboard/agents/agent-leads/agent-leads.component';
import { AddLeadDialogComponent } from './dashboard/agents/add-lead-dialog/add-lead-dialog.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { AddUserDialogComponent } from './users/add-user-dialog/add-user-dialog.component';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { PropertyDetailsComponent } from './dashboard/properties/property-details/property-details.component';

@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    LoginComponent,
    ForgotPasswordComponent,
    SideNavComponent,
    TopToolbarComponent,
    DashboardComponent,
    KpiCardComponent,
    ChartCardComponent,
    AddPropertyComponent,
    PropertiesListComponent,
    AgentsListComponent,
    AddAgentComponent,
    AssignAgentDialogComponent,
    AgentDashboardComponent,
    AgentLeadsComponent,
    AddLeadDialogComponent,
    UsersListComponent,
    AddUserDialogComponent,
    PropertyDetailsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule,
    
    // Material Modules
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatChipsModule,
    MatExpansionModule,
    MatRadioModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }