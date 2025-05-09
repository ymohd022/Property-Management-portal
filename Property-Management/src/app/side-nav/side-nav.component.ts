import { Component,  OnInit } from "@angular/core"
import  { Router } from "@angular/router"
import  { AuthService } from "../services/auth.service"

interface NavItem {
  name: string
  icon: string
  route: string
  expanded?: boolean
  children?: NavItem[]
}


@Component({
  selector: 'app-side-nav',
  standalone: false,
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit {
  currentUser: any = null
  isAdmin = false
  isAgent = false
  navItems: NavItem[] = []

  adminMenuItems: NavItem[] = [
    { name: "Dashboard", icon: "dashboard", route: "/dashboard" },
    { name: "Properties", icon: "business", route: "/properties" },
    { name: "Agents", icon: "people", route: "/agents" },
    { name: "Users", icon: "admin_panel_settings", route: "/users" },
    { name: "Reports", icon: "assessment", route: "/reports" },
    { name: "Settings", icon: "settings", route: "/settings" },
  ]

  agentMenuItems: NavItem[] = [
    { name: "Dashboard", icon: "dashboard", route: "/agent/dashboard" },
    { name: "My Properties", icon: "business", route: "/agent/properties" },
    { name: "Leads", icon: "contacts", route: "/agent/leads" },
    { name: "Sales", icon: "paid", route: "/agent/sales" },
    { name: "Commissions", icon: "attach_money", route: "/agent/commissions" },
    { name: "Profile", icon: "person", route: "/agent/profile" },
  ]

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser()
    if (this.currentUser) {
      this.isAdmin = this.currentUser.role === "admin"
      this.isAgent = this.currentUser.role === "agent"

      // Set appropriate menu items based on role
      this.navItems = this.isAdmin ? this.adminMenuItems : this.agentMenuItems
    }
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, false)
  }

  toggleExpand(item: NavItem): void {
    item.expanded = !item.expanded
  }

  navigateTo(route: string) {
    this.router.navigate([route])
  }

  logout() {
    this.authService.logout()
    this.router.navigate(["/login"])
  }
}
