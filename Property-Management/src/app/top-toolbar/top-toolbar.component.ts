import { Component,  OnInit, Output, EventEmitter } from "@angular/core"
import  { Router } from "@angular/router"
import  { AuthService } from "../services/auth.service"
@Component({
  selector: 'app-top-toolbar',
  standalone: false,
  templateUrl: './top-toolbar.component.html',
  styleUrl: './top-toolbar.component.css'
})
export class TopToolbarComponent implements OnInit {
  @Output() toggleSideNav = new EventEmitter<void>()
   currentUser: any = null
  isAdmin = false
  isAgent = false

  // currentUser: any
  notifications = [
    { id: 1, message: "New payment received", time: "5 min ago", read: false },
    { id: 2, message: "New client registered", time: "1 hour ago", read: false },
    { id: 3, message: "System update completed", time: "2 hours ago", read: true },
  ]

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser()
    if (this.currentUser) {
      this.isAdmin = this.currentUser.role === "admin"
      this.isAgent = this.currentUser.role === "agent"
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length
  }

  markAsRead(notification: any) {
    notification.read = true
  }

  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true))
  }

  getProfileRoute(): string {
    return this.isAgent ? "/agent/profile" : "/profile"
  }

  getProfileImageUrl(): string {
    if (this.currentUser && this.currentUser.profile_picture) {
      return `http://localhost:3000${this.currentUser.profile_picture}`
    }
    return "assets/images/default-profile.png"
  }

  logout() {
    this.authService.logout()
    this.router.navigate(["/login"])
  }

  onMenuClick() {
    this.toggleSideNav.emit()
  }
}