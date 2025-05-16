import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { ProfileService } from "../../services/profile.service"
import  { AuthService } from "../../services/auth.service"

@Component({
  selector: 'app-agent-profile',
  standalone: false,
  templateUrl: './agent-profile.component.html',
  styleUrl: './agent-profile.component.css'
})
export class AgentProfileComponent implements OnInit {
  profileForm: FormGroup
  passwordForm: FormGroup
  profileData: any = {}
  isLoading = true
  isSaving = false
  isChangingPassword = false
  selectedFile: File | null = null
  previewUrl: string | ArrayBuffer | null = null
  hideCurrentPassword = true
  hideNewPassword = true

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.profileForm = this.fb.group({
      name: ["", [Validators.required]],
      email: [{ value: "", disabled: true }],
      phone: ["", [Validators.pattern(/^\+?[0-9\s-]{10,15}$/)]],
      address: [""],
      role: [{ value: "", disabled: true }],
      commissionRate: [{ value: "", disabled: true }],
    })

    this.passwordForm = this.fb.group({
      currentPassword: ["", [Validators.required, Validators.minLength(6)]],
      newPassword: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  ngOnInit(): void {
    this.loadProfile()
  }

  loadProfile(): void {
    this.isLoading = true
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.profileData = data
        this.profileForm.patchValue({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          address: data.address || "",
          role: data.role,
          commissionRate: data.commissionRate || "N/A",
        })
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading profile:", error)
        this.snackBar.open("Failed to load profile data", "Close", { duration: 3000 })
        this.isLoading = false
      },
    })
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSaving = true
      const formData = {
        name: this.profileForm.get("name")?.value,
        phone: this.profileForm.get("phone")?.value,
        address: this.profileForm.get("address")?.value,
      }

      this.profileService.updateProfile(formData).subscribe({
        next: () => {
          this.isSaving = false
          this.snackBar.open("Profile updated successfully", "Close", { duration: 3000 })

          // Update the user name in local storage
          const currentUser = this.authService.getCurrentUser()
          if (currentUser) {
            currentUser.name = formData.name
            localStorage.setItem("current_user", JSON.stringify(currentUser))
          }
        },
        error: (error) => {
          console.error("Error updating profile:", error)
          this.isSaving = false
          this.snackBar.open("Failed to update profile", "Close", { duration: 3000 })
        },
      })
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true
      const passwordData = {
        currentPassword: this.passwordForm.get("currentPassword")?.value,
        newPassword: this.passwordForm.get("newPassword")?.value,
      }

      this.profileService.changePassword(passwordData).subscribe({
        next: () => {
          this.isChangingPassword = false
          this.passwordForm.reset()
          this.snackBar.open("Password changed successfully", "Close", { duration: 3000 })
        },
        error: (error) => {
          console.error("Error changing password:", error)
          this.isChangingPassword = false
          this.snackBar.open(error.error?.message || "Failed to change password", "Close", { duration: 3000 })
        },
      })
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0]

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        this.previewUrl = reader.result
      }
      reader.readAsDataURL(this.selectedFile)
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) {
      return
    }

    this.isSaving = true
    this.profileService.uploadProfilePicture(this.selectedFile).subscribe({
      next: (response) => {
        this.isSaving = false
        this.snackBar.open("Profile picture uploaded successfully", "Close", { duration: 3000 })

        // Update profile picture in local storage
        const currentUser = this.authService.getCurrentUser()
        if (currentUser) {
          currentUser.profile_picture = response.profilePicture
          localStorage.setItem("current_user", JSON.stringify(currentUser))
        }

        // Reload profile to get updated data
        this.loadProfile()
      },
      error: (error) => {
        console.error("Error uploading profile picture:", error)
        this.isSaving = false
        this.snackBar.open("Failed to upload profile picture", "Close", { duration: 3000 })
      },
    })
  }

  getProfileImageUrl(): string {
    if (this.previewUrl) {
      return this.previewUrl as string
    }

    if (this.profileData.profilePicture) {
      return `http://localhost:3000${this.profileData.profilePicture}`
    }

    return "assets/images/default-profile.png"
  }
}
