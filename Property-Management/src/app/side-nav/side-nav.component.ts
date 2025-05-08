import { Component,  OnInit } from "@angular/core"
import {  Router, NavigationEnd } from "@angular/router"
import { filter } from "rxjs/operators"
import  { AuthService } from "../services/auth.service"

interface NavItem {
  label: string
  icon: string
  route?: string
  children?: NavItem[]
  expanded?: boolean
}


@Component({
  selector: 'app-side-nav',
  standalone: false,
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit {
  currentUser: any = null
  currentRoute = ""
  isAdmin = false
  isAgent = false

  navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: "dashboard",
      route: "/dashboard",
    },
    {
      label: "Properties",
      icon: "apartment",
      children: [
        { label: "All Properties", icon: "list", route: "/properties" },
        { label: "Add Property", icon: "add_circle", route: "/properties/add" },
      ],
    },
    {
      label: "Clients",
      icon: "people",
      children: [
        { label: "All Clients", icon: "list", route: "/clients" },
        { label: "Add Client", icon: "person_add", route: "/clients/add" },
      ],
    },
    {
      label: "Agents",
      icon: "support_agent",
      children: [
        { label: "All Agents", icon: "list", route: "/agents" },
        { label: "Add Agent", icon: "person_add", route: "/agents/add" },
      ],
    },
    {
      label: "Users",
      icon: "admin_panel_settings",
      route: "/users",
    },
    {
      label: "Payments",
      icon: "payments",
      children: [
        { label: "All Payments", icon: "list", route: "/payments" },
        { label: "Add Payment", icon: "add_circle", route: "/payments/add" },
      ],
    },
    {
      label: "Reports",
      icon: "assessment",
      route: "/reports",
    },
    {
      label: "Settings",
      icon: "settings",
      route: "/settings",
    },
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
    }

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: any) => {
      this.currentRoute = event.url

      // Expand the menu item that contains the current route
      this.navItems.forEach((item) => {
        if (item.children) {
          item.expanded = item.children.some((child) => this.currentRoute.startsWith(child.route ?? ""))
        }
      })
    })
  }

  toggleExpand(item: NavItem) {
    item.expanded = !item.expanded
  }

  isActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route)
  }

  navigateTo(route: string) {
    this.router.navigate([route])
  }

  logout() {
    this.authService.logout()
    this.router.navigate(["/login"])
  }
}