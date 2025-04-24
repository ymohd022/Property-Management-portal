import { Component,  OnInit, ViewChild } from "@angular/core"
import {  Router, NavigationEnd } from "@angular/router"
import { filter } from "rxjs/operators"
import  { MatSidenav } from "@angular/material/sidenav"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  @ViewChild("sidenav") sidenav!: MatSidenav

  title = "QMAKS Property Management"
  showNavigation = false

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      // Hide navigation on splash screen and login pages
      this.showNavigation = !["/", "/login", "/forgot-password"].includes(event.url)
    })
  }

  toggleSideNav() {
    if (this.sidenav) {
      this.sidenav.toggle()
    }
  }
}
