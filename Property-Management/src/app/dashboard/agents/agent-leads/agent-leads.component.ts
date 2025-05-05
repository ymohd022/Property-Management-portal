import { Component,  OnInit } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import  { MatDialog } from "@angular/material/dialog"
import  { MatSnackBar } from "@angular/material/snack-bar"
import { AgentService } from "../../../services/agent.service"
import { AddLeadDialogComponent } from "../add-lead-dialog/add-lead-dialog.component"

interface Lead {
  id: number
  clientName: string
  clientEmail: string
  clientPhone: string
  property: string
  flatNumber: string
  status: string
  notes: string
  date: string
}

@Component({
  selector: 'app-agent-leads',
  standalone: false,
  templateUrl: './agent-leads.component.html',
  styleUrl: './agent-leads.component.css'
})
export class AgentLeadsComponent implements OnInit {
  displayedColumns: string[] = ["clientName", "clientContact", "property", "flatNumber", "date", "status", "actions"]
  dataSource = new MatTableDataSource<Lead>()
  isLoading = true
  currentAgent: any

  constructor(
    private agentService: AgentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.currentAgent = { id: 1 } // In a real app, get this from auth service
    this.loadLeads()
  }

  loadLeads() {
    this.isLoading = true
    this.agentService.getAgentLeads(this.currentAgent.id).subscribe({
      next: (leads) => {
        this.dataSource.data = leads
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading leads:", error)
        this.snackBar.open("Failed to load leads", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
        this.isLoading = false

        // Load mock data for demo
        this.loadMockData()
      },
    })
  }

  loadMockData() {
    this.dataSource.data = [
      {
        id: 1,
        clientName: "Rahul Sharma",
        clientEmail: "rahul.sharma@example.com",
        clientPhone: "+91 9876543210",
        property: "Sunshine Apartments",
        flatNumber: "301",
        status: "Active",
        notes: "Interested in 3BHK, looking to finalize within a month",
        date: "2023-06-10",
      },
      {
        id: 2,
        clientName: "Priya Patel",
        clientEmail: "priya.patel@example.com",
        clientPhone: "+91 9876543211",
        property: "Green Valley Villas",
        flatNumber: "102",
        status: "Converted",
        notes: "Booked the flat with 10% down payment",
        date: "2023-06-05",
      },
      {
        id: 3,
        clientName: "Amit Kumar",
        clientEmail: "amit.kumar@example.com",
        clientPhone: "+91 9876543212",
        property: "Sunshine Apartments",
        flatNumber: "204",
        status: "Lost",
        notes: "Found another property that better suits their needs",
        date: "2023-05-28",
      },
      {
        id: 4,
        clientName: "Neha Singh",
        clientEmail: "neha.singh@example.com",
        clientPhone: "+91 9876543213",
        property: "Lakeside Residency",
        flatNumber: "402",
        status: "Active",
        notes: "Visited the property twice, negotiating on price",
        date: "2023-05-20",
      },
      {
        id: 5,
        clientName: "Vikram Mehta",
        clientEmail: "vikram.mehta@example.com",
        clientPhone: "+91 9876543214",
        property: "Metro Business Park",
        flatNumber: "Office 3",
        status: "Active",
        notes: "Looking for office space, scheduled second visit",
        date: "2023-05-15",
      },
    ]
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "Active":
        return "#ff9800"
      case "Converted":
        return "#4caf50"
      case "Lost":
        return "#f44336"
      default:
        return "#757575"
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  openAddLeadDialog() {
    const dialogRef = this.dialog.open(AddLeadDialogComponent, {
      width: "600px",
      data: { agentId: this.currentAgent.id },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open("Lead added successfully!", "Close", {
          duration: 3000,
        })
        this.loadLeads()
      }
    })
  }

  updateLeadStatus(lead: Lead, newStatus: string) {
    this.agentService.updateLeadStatus(lead.id, newStatus).subscribe({
      next: () => {
        lead.status = newStatus
        this.snackBar.open(`Lead status updated to ${newStatus}`, "Close", {
          duration: 3000,
        })
      },
      error: (error) => {
        console.error("Error updating lead status:", error)
        this.snackBar.open("Failed to update lead status", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })

        // For demo, update the status anyway
        lead.status = newStatus
      },
    })
  }

  viewLeadDetails(lead: Lead) {
    // In a real app, navigate to lead details page or open a dialog
    console.log("View lead details:", lead)
  }
}
