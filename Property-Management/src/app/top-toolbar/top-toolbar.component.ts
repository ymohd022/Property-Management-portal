import { Component,  OnInit, Output, EventEmitter } from "@angular/core"
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-top-toolbar',
  standalone: false,
  templateUrl: './top-toolbar.component.html',
  styleUrl: './top-toolbar.component.css'
})
export class TopToolbarComponent implements OnInit {
  @Output() toggleSideNav = new EventEmitter<void>()

  currentUser: any
  notifications = [
    { id: 1, message: "New payment received", time: "5 min ago", read: false },
    { id: 2, message: "New client registered", time: "1 hour ago", read: false },
    { id: 3, message: "System update completed", time: "2 hours ago", read: true },
  ]

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser()
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

  onMenuClick() {
    this.toggleSideNav.emit()
  }
}