import { Component,  OnInit } from "@angular/core"
import  { AgentService } from "../../../services/agent.service"
import  { AuthService } from "../../../services/auth.service"
import { Chart, registerables } from "chart.js"
Chart.register(...registerables)
@Component({
  selector: 'app-agent-dashboard',
  standalone: false,
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.css'
})
export class AgentDashboardComponent implements OnInit {
  isLoading = true
  currentAgent: any
  dashboardData: any = {}
  leadsChart: any
  salesChart: any
  commissionChart: any

  constructor(
    private agentService: AgentService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.currentAgent = this.authService.getCurrentUser()
    this.loadDashboardData()
  }

  loadDashboardData() {
    this.isLoading = true
    this.agentService.getAgentDashboardData(this.currentAgent.id).subscribe({
      next: (data) => {
        this.dashboardData = data
        this.isLoading = false
        setTimeout(() => {
          this.initCharts()
        }, 0)
      },
      error: (error) => {
        console.error("Error loading dashboard data:", error)
        this.isLoading = false
        // Load mock data for demo
        this.loadMockData()
      },
    })
  }

  loadMockData() {
    this.dashboardData = {
      kpis: {
        totalAssignments: 5,
        totalLeads: 12,
        activeLeads: 4,
        totalSales: 8,
        totalCommission: 240000,
        pendingCommission: 60000,
      },
      leadsData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "New Leads",
            data: [3, 2, 4, 1, 2, 0],
          },
          {
            label: "Converted Leads",
            data: [1, 1, 2, 0, 1, 0],
          },
        ],
      },
      salesData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Sales",
            data: [1, 1, 2, 0, 1, 0],
          },
        ],
      },
      commissionData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Commission",
            data: [30000, 35000, 60000, 0, 40000, 0],
          },
        ],
      },
      recentLeads: [
        {
          id: 1,
          clientName: "Rahul Sharma",
          property: "Sunshine Apartments",
          flatNumber: "301",
          status: "Active",
          date: "2023-06-10",
        },
        {
          id: 2,
          clientName: "Priya Patel",
          property: "Green Valley Villas",
          flatNumber: "102",
          status: "Converted",
          date: "2023-06-05",
        },
        {
          id: 3,
          clientName: "Amit Kumar",
          property: "Sunshine Apartments",
          flatNumber: "204",
          status: "Lost",
          date: "2023-05-28",
        },
        {
          id: 4,
          clientName: "Neha Singh",
          property: "Lakeside Residency",
          flatNumber: "402",
          status: "Active",
          date: "2023-05-20",
        },
      ],
      recentSales: [
        {
          id: 1,
          clientName: "Priya Patel",
          property: "Green Valley Villas",
          flatNumber: "102",
          amount: 4500000,
          commission: 45000,
          date: "2023-06-05",
          status: "Completed",
        },
        {
          id: 2,
          clientName: "Vikram Mehta",
          property: "Sunshine Apartments",
          flatNumber: "103",
          amount: 3800000,
          commission: 38000,
          date: "2023-05-15",
          status: "Completed",
        },
        {
          id: 3,
          clientName: "Sanjay Gupta",
          property: "Lakeside Residency",
          flatNumber: "201",
          amount: 5200000,
          commission: 52000,
          date: "2023-04-22",
          status: "Completed",
        },
      ],
      assignedProperties: [
        {
          id: 1,
          name: "Sunshine Apartments",
          location: "Whitefield, Bangalore",
          totalFlats: 5,
          availableFlats: 2,
        },
        {
          id: 2,
          name: "Green Valley Villas",
          location: "Electronic City, Bangalore",
          totalFlats: 3,
          availableFlats: 1,
        },
        {
          id: 3,
          name: "Lakeside Residency",
          location: "Hebbal, Bangalore",
          totalFlats: 4,
          availableFlats: 2,
        },
      ],
    }

    setTimeout(() => {
      this.initCharts()
    }, 0)
  }

  initCharts() {
    this.initLeadsChart()
    this.initSalesChart()
    this.initCommissionChart()
  }

  initLeadsChart() {
    const ctx = document.getElementById("leadsChart") as HTMLCanvasElement
    if (ctx) {
      this.leadsChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.dashboardData.leadsData.labels,
          datasets: [
            {
              label: "New Leads",
              data: this.dashboardData.leadsData.datasets[0].data,
              backgroundColor: "#1a3c8f",
              borderColor: "#1a3c8f",
              borderWidth: 1,
            },
            {
              label: "Converted Leads",
              data: this.dashboardData.leadsData.datasets[1].data,
              backgroundColor: "#4caf50",
              borderColor: "#4caf50",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Number of Leads",
              },
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      })
    }
  }

  initSalesChart() {
    const ctx = document.getElementById("salesChart") as HTMLCanvasElement
    if (ctx) {
      this.salesChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.dashboardData.salesData.labels,
          datasets: [
            {
              label: "Sales",
              data: this.dashboardData.salesData.datasets[0].data,
              backgroundColor: "rgba(76, 175, 80, 0.2)",
              borderColor: "#4caf50",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Number of Sales",
              },
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      })
    }
  }

  initCommissionChart() {
    const ctx = document.getElementById("commissionChart") as HTMLCanvasElement
    if (ctx) {
      this.commissionChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.dashboardData.commissionData.labels,
          datasets: [
            {
              label: "Commission",
              data: this.dashboardData.commissionData.datasets[0].data,
              backgroundColor: "rgba(255, 152, 0, 0.2)",
              borderColor: "#ff9800",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || ""
                  if (label) {
                    label += ": "
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(context.parsed.y)
                  }
                  return label
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Commission Amount (₹)",
              },
              ticks: {
                callback: (value) => "₹" + value.toLocaleString("en-IN"),
              },
            },
          },
        },
      })
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
        return "status-active"
      case "converted":
        return "status-converted"
      case "lost":
        return "status-lost"
      case "completed":
        return "status-completed"
      case "pending":
        return "status-pending"
      default:
        return ""
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
}
