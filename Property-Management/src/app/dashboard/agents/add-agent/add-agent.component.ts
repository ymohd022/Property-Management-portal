import { Component } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { Router } from "@angular/router"
import  { MatSnackBar } from "@angular/material/snack-bar"
import { AgentService } from "../../../services/agent.service"

@Component({
  selector: 'app-add-agent',
  standalone: false,
  templateUrl: './add-agent.component.html',
  styleUrl: './add-agent.component.css'
})
export class AddAgentComponent {
  agentForm: FormGroup
  isLoading = false
  hidePassword = true

  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.agentForm = this.fb.group(
      {
        name: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        phone: ["", [Validators.required, Validators.pattern("^[0-9+\\s-]{10,15}$")]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
        address: [""],
        commissionRate: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
        status: ["Active"],
      },
      { validator: this.checkPasswords },
    )
  }

  checkPasswords(group: FormGroup) {
    const password = group.get("password")?.value
    const confirmPassword = group.get("confirmPassword")?.value
    return password === confirmPassword ? null : { notMatching: true }
  }

  onSubmit() {
    if (this.agentForm.valid) {
      this.isLoading = true
      const agentData = { ...this.agentForm.value }
      delete agentData.confirmPassword

      this.agentService.addAgent(agentData).subscribe({
        next: () => {
          this.isLoading = false
          this.snackBar.open("Agent added successfully!", "Close", {
            duration: 3000,
          })
          this.router.navigate(["/agents"])
        },
        error: (error) => {
          console.error("Error adding agent:", error)
          this.isLoading = false
          this.snackBar.open("Failed to add agent", "Close", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          })

          // For demo, navigate anyway
          setTimeout(() => {
            this.router.navigate(["/agents"])
          }, 1000)
        },
      })
    } else {
      this.agentForm.markAllAsTouched()
      this.snackBar.open("Please fill all required fields correctly", "Close", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      })
    }
  }
}
