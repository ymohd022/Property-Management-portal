import { Component, Inject,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA,  MatDialogRef } from "@angular/material/dialog"
import { AgentService } from "../../../services/agent.service"

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
  loadingFlats = false;

  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    public dialogRef: MatDialogRef<AddLeadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { agentId: number }
  ) {
    this.leadForm = this.fb.group({
      clientName: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientPhone: ['', [Validators.required, Validators.pattern("^[0-9+\\s-]{10,15}$")]],
      propertyId: ['', Validators.required],
      flatId: [""],
      notes: [""],
    })
  }

  ngOnInit() {
    this.loadProperties()
  }

  loadProperties() {
    this.loadingProperties = true
    this.agentService.getAssignedProperties(this.data.agentId).subscribe({
      next: (properties) => {
        this.properties = properties
        this.loadingProperties = false
      },
      error: (error) => {
        console.error("Error loading properties:", error)
        this.loadingProperties = false

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

        // Load mock data for demo
        this.flats = [
          { id: 101, flatNumber: "101", type: "2BHK", status: "Available" },
          { id: 102, flatNumber: "102", type: "3BHK", status: "Available" },
          { id: 103, flatNumber: "103", type: "2BHK", status: "Booked" },
          { id: 104, flatNumber: "104", type: "3BHK", status: "Available" },
          { id: 201, flatNumber: "201", type: "2BHK", status: "Sold" },
          { id: 202, flatNumber: "202", type: "3BHK", status: "Available" },
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
      const leadData = {
        agentId: this.data.agentId,
        ...this.leadForm.value,
        status: "Active",
        date: new Date().toISOString().split("T")[0],
      }

      this.agentService.addLead(leadData).subscribe({
        next: () => {
          this.isLoading = false
          this.dialogRef.close(true)
        },
        error: (error) => {
          console.error("Error adding lead:", error)
          this.isLoading = false

          // For demo, close dialog anyway
          this.dialogRef.close(true)
        },
      })
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}
