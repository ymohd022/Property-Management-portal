import { Injectable } from "@angular/core"
import  { CanActivate, ActivatedRouteSnapshot, Router } from "@angular/router"
import  { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data["roles"] as Array<string>
    const currentUser = this.authService.getCurrentUser()

    if (!currentUser || !expectedRoles.includes(currentUser.role)) {
      // Redirect to appropriate dashboard based on role
      if (currentUser && currentUser.role === "admin") {
        this.router.navigate(["/dashboard"])
      } else if (currentUser && currentUser.role === "agent") {
        this.router.navigate(["/agent/dashboard"])
      } else {
        this.router.navigate(["/login"])
      }
      return false
    }

    return true
  }
}
