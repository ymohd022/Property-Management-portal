import { Component, Inject,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA,  MatDialogRef } from "@angular/material/dialog"
import  { AgentService } from "../../../services/agent.service"
import  { MatSnackBar } from "@angular/material/snack-bar"

@Component({
  selector: 'app-assign-agent-dialog',
  standalone: false,
  templateUrl: './assign-agent-dialog.component.html',
  styleUrl: './assign-agent-dialog.component.css'
})
export class AssignAgentDialogComponent implements OnInit {
  assignForm: FormGroup
  properties: any[] = []
  flats: any[] = []
  isLoading = false
  loadingProperties = true
  loadingFlats = false
  errorMessage = "";

  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AssignAgentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { agent: any }
  ) {
    this.assignForm = this.fb.group({
      propertyId: ["", Validators.required],
      flatId: [""],
      commissionRate: [
        this.data.agent.commissionRate || 5,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      notes: [''],
    });
  }

  ngOnInit() {
    this.loadProperties()
  }

  loadProperties() {
    this.loadingProperties = true
    this.agentService.getProperties().subscribe({
      next: (properties) => {
        this.properties = properties
        this.loadingProperties = false
      },
      error: (error) => {
        console.error("Error loading properties:", error)
        this.loadingProperties = false
        this.snackBar.open("Error loading properties", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })

        // Load mock data for demo
        this.properties = [
          { id: 1, name: "Sunshine Apartments", location: "Whitefield, Bangalore" },
          { id: 2, name: "Green Valley Villas", location: "Electronic City, Bangalore" },
          { id: 3, name: "Metro Business Park", location: "MG Road, Bangalore" },
          { id: 4, name: "Lakeside Residency", location: "Hebbal, Bangalore" },
          { id: 5, name: "City Center Mall", location: "Jayanagar, Bangalore" },
        ]
      },
    })
  }

  loadFlats(propertyId: number) {
    if (!propertyId) {
      this.flats = []
      return
    }

    this.loadingFlats = true
    this.agentService.getFlatsForProperty(propertyId).subscribe({
      next: (flats) => {
        this.flats = flats
        this.loadingFlats = false
      },
      error: (error) => {
        console.error("Error loading flats:", error)
        this.loadingFlats = false
        this.snackBar.open("Error loading flats", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })

        // Load mock data for demo
        this.flats = [
          { id: 101, flat_number: "101", flat_type: "2BHK", status: "Available" },
          { id: 102, flat_number: "102", flat_type: "3BHK", status: "Available" },
          { id: 103, flat_number: "103", flat_type: "2BHK", status: "Booked" },
          { id: 104, flat_number: "104", flat_type: "3BHK", status: "Available" },
          { id: 201, flat_number: "201", flat_type: "2BHK", status: "Sold" },
          { id: 202, flat_number: "202", flat_type: "3BHK", status: "Available" },
        ]
      },
    })
  }

  onPropertyChange() {
    const propertyId = this.assignForm.get("propertyId")?.value
    this.assignForm.get("flatId")?.setValue("")
    this.loadFlats(propertyId)
  }

  onSubmit() {
    if (this.assignForm.valid) {
      this.isLoading = true
      this.errorMessage = ""

      const assignmentData = {
        agentId: this.data.agent.id,
        ...this.assignForm.value,
      }

      this.agentService.assignAgent(assignmentData).subscribe({
        next: () => {
          this.isLoading = false
          this.snackBar.open("Agent assigned successfully", "Close", {
            duration: 3000,
          })
          this.dialogRef.close(true)
        },
        error: (error) => {
          console.error("Error assigning agent:", error)
          this.isLoading = false
          this.errorMessage = error.error?.message || "Failed to assign agent. Please try again."
          this.snackBar.open(this.errorMessage, "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          })
        },
      })
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}

