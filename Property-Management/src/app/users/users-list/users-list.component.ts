import { Component,  OnInit } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import  { MatDialog } from "@angular/material/dialog"
import { UserService } from "../../services/user.service"
import { AddUserDialogComponent } from "../add-user-dialog/add-user-dialog.component"
import  { MatSnackBar } from "@angular/material/snack-bar"

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  displayedColumns: string[] = ["name", "email", "role", "status", "actions"]
  dataSource = new MatTableDataSource<any>()
  isLoading = true
  roles = ["admin", "agent", "manager"]

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadUsers()
  }

  loadUsers() {
    this.isLoading = true
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading users:", error)
        this.snackBar.open("Error loading users", "Close", { duration: 3000 })
        this.isLoading = false
      },
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  addUser() {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: "500px",
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: () => {
            this.snackBar.open("User created successfully", "Close", { duration: 3000 })
            this.loadUsers()
          },
          error: (error) => {
            console.error("Error creating user:", error)
            this.snackBar.open("Error creating user: " + (error.error?.message || "Unknown error"), "Close", {
              duration: 5000,
            })
          },
        })
      }
    })
  }

  editUser(user: any) {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: "500px",
      data: { user, isEdit: true },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.updateUser(user.id, result).subscribe({
          next: () => {
            this.snackBar.open("User updated successfully", "Close", { duration: 3000 })
            this.loadUsers()
          },
          error: (error) => {
            console.error("Error updating user:", error)
            this.snackBar.open("Error updating user: " + (error.error?.message || "Unknown error"), "Close", {
              duration: 5000,
            })
          },
        })
      }
    })
  }

  toggleUserStatus(user: any) {
    const newStatus = user.status === "Active" ? "Inactive" : "Active"
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        this.snackBar.open(`User ${newStatus.toLowerCase()}d successfully`, "Close", { duration: 3000 })
        this.loadUsers()
      },
      error: (error) => {
        console.error("Error updating user status:", error)
        this.snackBar.open("Error updating user status: " + (error.error?.message || "Unknown error"), "Close", {
          duration: 5000,
        })
      },
    })
  }

  getRoleClass(role: string): string {
    switch (role) {
      case "admin":
        return "role-admin"
      case "agent":
        return "role-agent"
      case "manager":
        return "role-manager"
      default:
        return ""
    }
  }

  getStatusClass(status: string): string {
    return status === "Active" ? "status-active" : "status-inactive"
  }
}