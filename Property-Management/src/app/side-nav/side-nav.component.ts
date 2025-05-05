import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-side-nav',
  standalone: false,
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit {
  currentUser: any;
  currentRoute: string = '';
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Properties',
      icon: 'apartment',
      children: [
        { label: 'All Properties', icon: 'list', route: '/properties' },
        { label: 'Add Property', icon: 'add_circle', route: '/properties/add' }
      ]
    },
    {
      label: 'Clients',
      icon: 'people',
      children: [
        { label: 'All Clients', icon: 'list', route: '/clients' },
        { label: 'Add Client', icon: 'person_add', route: '/clients/add' }
      ]
    },
    {
      label: 'Payments',
      icon: 'payments',
      children: [
        { label: 'All Payments', icon: 'list', route: '/payments' },
        { label: 'Add Payment', icon: 'add_circle', route: '/payments/add' }
      ]
    },
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/reports'
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;

      // Expand the menu item that contains the current route
      this.navItems.forEach(item => {
        if (item.children) {
          item.expanded = item.children.some(child => child.route && this.currentRoute.startsWith(child.route));
        }
      });
    });
  }

  toggleExpand(item: NavItem) {
    item.expanded = !item.expanded;
  }

  isActive(route: string | undefined): boolean {
    return route ? this.currentRoute === route || this.currentRoute.startsWith(route) : false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
