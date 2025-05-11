import { Component, Inject,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA,  MatDialogRef } from "@angular/material/dialog"
import  { AgentService } from "../../../services/agent.service"
import  { MatSnackBar } from "@angular/material/snack-bar"

@Component({
  selector: 'app-add-lead-dialog',
  standalone: false,
  templateUrl: './add-lead-dialog.component.html',
  styleUrl: './add-lead-dialog.component.css'
})
export class AddLeadDialogComponent implements OnInit {
  leadForm: FormGroup
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
    public dialogRef: MatDialogRef<AddLeadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { agentId: number }
  ) {
    this.leadForm = this.fb.group({
      clientName: ["", Validators.required],
      clientEmail: ["", [Validators.required, Validators.email]],
      clientPhone: ["", [Validators.required, Validators.pattern("^[0-9+\\s-]{10,15}$")]],
      propertyId: ["", Validators.required],
      flatId: [""],
      notes: [""],
    });
  }

  ngOnInit() {
    this.loadProperties()
  }

  loadProperties() {
    this.loadingProperties = true
    this.agentService.getAssignedProperties(this.data.agentId).subscribe({
      next: (assignments) => {
        // Extract unique properties from assignments
        const propertyMap = new Map()
        assignments.forEach((assignment) => {
          if (!propertyMap.has(assignment.property_id)) {
            propertyMap.set(assignment.property_id, {
              id: assignment.property_id,
              name: assignment.property_name,
              location: assignment.property_location,
            })
          }
        })
        this.properties = Array.from(propertyMap.values())
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
          { id: 3, name: "Lakeside Residency", location: "Hebbal, Bangalore" },
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
    const propertyId = this.leadForm.get("propertyId")?.value
    this.leadForm.get("flatId")?.setValue("")
    this.loadFlats(propertyId)
  }

  onSubmit() {
    if (this.leadForm.valid) {
      this.isLoading = true
      this.errorMessage = ""

      const leadData = {
        agentId: this.data.agentId,
        ...this.leadForm.value,
        status: "Active",
      }

      this.agentService.addLead(leadData).subscribe({
        next: () => {
          this.isLoading = false
          this.dialogRef.close(true)
          this.snackBar.open("Lead added successfully", "Close", {
            duration: 3000,
          })
        },
        error: (error) => {
          console.error("Error adding lead:", error)
          this.isLoading = false
          this.errorMessage = error.error?.message || "Failed to add lead. Please try again."
          this.snackBar.open(this.errorMessage, "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          })
        },
      })
    } else {
      this.leadForm.markAllAsTouched()
      this.errorMessage = "Please fill all required fields correctly"
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}
