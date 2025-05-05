import { Component,  OnInit } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import  { MatDialog } from "@angular/material/dialog"
import  { MatSnackBar } from "@angular/material/snack-bar"
import { AgentService } from "../../../services/agent.service"
import { AssignAgentDialogComponent } from "../assign-agent-dialog/assign-agent-dialog.component"

interface Agent {
  id: number
  name: string
  email: string
  phone: string
  status: string
  totalAssignments: number
  totalLeads: number
  totalSales: number
  totalCommission: number
}
@Component({
  selector: 'app-agents-list',
  standalone: false,
  templateUrl: './agents-list.component.html',
  styleUrl: './agents-list.component.css'
})
export class AgentsListComponent implements OnInit {
  displayedColumns: string[] = [
    "name",
    "email",
    "phone",
    "totalAssignments",
    "totalLeads",
    "totalSales",
    "totalCommission",
    "status",
    "actions",
  ]
  dataSource = new MatTableDataSource<Agent>()
  isLoading = true

  constructor(
    private agentService: AgentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadAgents()
  }

  loadAgents() {
    this.isLoading = true
    this.agentService.getAgents().subscribe({
      next: (agents) => {
        this.dataSource.data = agents
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading agents:", error)
        this.snackBar.open("Failed to load agents", "Close", {
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
        name: "John Smith",
        email: "john.smith@qmaks.com",
        phone: "+91 9876543210",
        status: "Active",
        totalAssignments: 5,
        totalLeads: 12,
        totalSales: 8,
        totalCommission: 240000,
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.johnson@qmaks.com",
        phone: "+91 9876543211",
        status: "Active",
        totalAssignments: 4,
        totalLeads: 10,
        totalSales: 6,
        totalCommission: 180000,
      },
      {
        id: 3,
        name: "Michael Brown",
        email: "michael.brown@qmaks.com",
        phone: "+91 9876543212",
        status: "Inactive",
        totalAssignments: 2,
        totalLeads: 5,
        totalSales: 3,
        totalCommission: 90000,
      },
      {
        id: 4,
        name: "Emily Davis",
        email: "emily.davis@qmaks.com",
        phone: "+91 9876543213",
        status: "Active",
        totalAssignments: 3,
        totalLeads: 8,
        totalSales: 5,
        totalCommission: 150000,
      },
      {
        id: 5,
        name: "David Wilson",
        email: "david.wilson@qmaks.com",
        phone: "+91 9876543214",
        status: "Active",
        totalAssignments: 3,
        totalLeads: 7,
        totalSales: 4,
        totalCommission: 120000,
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
        return "#4caf50"
      case "Inactive":
        return "#f44336"
      default:
        return "#757575"
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  openAssignDialog(agent: Agent) {
    const dialogRef = this.dialog.open(AssignAgentDialogComponent, {
      width: "600px",
      data: { agent },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open(`Agent assigned successfully!`, "Close", {
          duration: 3000,
        })
        this.loadAgents()
      }
    })
  }

  toggleAgentStatus(agent: Agent) {
    const newStatus = agent.status === "Active" ? "Inactive" : "Active"

    this.agentService.updateAgentStatus(agent.id, newStatus).subscribe({
      next: () => {
        agent.status = newStatus
        this.snackBar.open(`Agent status updated to ${newStatus}`, "Close", {
          duration: 3000,
        })
      },
      error: (error) => {
        console.error("Error updating agent status:", error)
        this.snackBar.open("Failed to update agent status", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })

        // For demo, update the status anyway
        agent.status = newStatus
      },
    })
  }
}
