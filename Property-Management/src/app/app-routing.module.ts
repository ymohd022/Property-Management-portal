import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddPropertyComponent } from './dashboard/properties/add-property/add-property.component';
import { PropertiesListComponent } from './dashboard/properties/properties-list/properties-list.component';
import { AgentsListComponent } from './dashboard/agents/agents-list/agents-list.component';
import { AddAgentComponent } from './dashboard/agents/add-agent/add-agent.component';
import { AgentDashboardComponent } from './dashboard/agents/agent-dashboard/agent-dashboard.component';
import { AgentLeadsComponent } from './dashboard/agents/agent-leads/agent-leads.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { RoleGuard } from './guards/role.guard';
import { AuthGuard } from './guards/auth.guard';
import { PropertyDetailsComponent } from './dashboard/properties/property-details/property-details.component';

const routes: Routes = [
  { path: "", component: SplashScreenComponent },
  { path: "login", component: LoginComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "properties",
    component: PropertiesListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "properties/add",
    component: AddPropertyComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "properties/:id", // Add this line
    component: PropertyDetailsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "agents",
    component: AgentsListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "agents/add",
    component: AddAgentComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "users",
    component: UsersListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["admin"] },
  },
  {
    path: "agent/dashboard",
    component: AgentDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["agent"] },
  },
  {
    path: "agent/leads",
    component: AgentLeadsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["agent"] },
  },
  { path: "**", redirectTo: "" },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
