import { Component,  OnInit } from "@angular/core"
import  { Router } from "@angular/router"
import  { AuthService } from "../../services/auth.service"

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userRole: string | null = null

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser()
    if (currentUser) {
      this.userRole = currentUser.role
    } else {
      this.router.navigate(["/login"])
    }
  }
}