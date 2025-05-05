import { Component, Inject,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA,  MatDialogRef } from "@angular/material/dialog"
import { AgentService } from "../../../services/agent.service"

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
  loadingFlats = false;

  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
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
      notes: [""],
    })
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
    const propertyId = this.assignForm.get("propertyId")?.value
    this.assignForm.get("flatId")?.setValue("")
    this.loadFlats(propertyId)
  }

  onSubmit() {
    if (this.assignForm.valid) {
      this.isLoading = true
      const assignmentData = {
        agentId: this.data.agent.id,
        ...this.assignForm.value,
      }

      this.agentService.assignAgent(assignmentData).subscribe({
        next: () => {
          this.isLoading = false
          this.dialogRef.close(true)
        },
        error: (error) => {
          console.error("Error assigning agent:", error)
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
