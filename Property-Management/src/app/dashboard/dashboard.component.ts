import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  dashboardData: any = {};
  revenueChart: any;
  propertyOccupancyChart: any;
  agentPerformanceChart: any;
  
  constructor(private dashboardService: DashboardService) {}
  
  ngOnInit() {
    this.loadDashboardData();
  }
  
  loadDashboardData() {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
        
        setTimeout(() => {
          this.initCharts();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
        
        // Load mock data for demo
        this.loadMockData();
      }
    });
  }
  
  loadMockData() {
    this.dashboardData = {
      kpis: {
        totalSites: 12,
        totalFlats: 240,
        soldFlats: 187,
        availableFlats: 53,
        totalRevenue: 4250000,
        pendingPayments: 850000
      },
      revenueData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Revenue',
            data: [350000, 420000, 380000, 450000, 320000, 380000, 410000, 390000, 405000, 365000, 390000, 420000]
          }
        ]
      },
      occupancyData: {
        labels: ['Site A', 'Site B', 'Site C', 'Site D', 'Site E', 'Site F'],
        datasets: [
          {
            label: 'Sold',
            data: [42, 38, 35, 30, 25, 17]
          },
          {
            label: 'Available',
            data: [8, 12, 5, 10, 5, 13]
          }
        ]
      },
      agentPerformanceData: {
        labels: ['John', 'Sarah', 'Mike', 'Emily', 'David'],
        datasets: [
          {
            label: 'Sales (in units)',
            data: [45, 38, 32, 28, 22]
          }
        ]
      },
      recentTransactions: [
        { id: 'TRX001', client: 'John Smith', property: 'Flat 101, Site A', amount: 120000, date: '2023-04-15', status: 'Completed' },
        { id: 'TRX002', client: 'Mary Johnson', property: 'Flat 205, Site B', amount: 150000, date: '2023-04-12', status: 'Pending' },
        { id: 'TRX003', client: 'Robert Brown', property: 'Flat 310, Site C', amount: 135000, date: '2023-04-10', status: 'Completed' },
        { id: 'TRX004', client: 'Patricia Davis', property: 'Flat 402, Site A', amount: 125000, date: '2023-04-08', status: 'Completed' },
        { id: 'TRX005', client: 'James Wilson', property: 'Flat 115, Site D', amount: 140000, date: '2023-04-05', status: 'Failed' }
      ]
    };
    
    setTimeout(() => {
      this.initCharts();
    }, 0);
  }
  
  initCharts() {
    this.initRevenueChart();
    this.initPropertyOccupancyChart();
    this.initAgentPerformanceChart();
  }
  
  initRevenueChart() {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (ctx) {
      this.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.dashboardData.revenueData.labels,
          datasets: [{
            label: 'Revenue (₹)',
            data: this.dashboardData.revenueData.datasets[0].data,
            backgroundColor: 'rgba(26, 60, 143, 0.2)',
            borderColor: '#1a3c8f',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-IN', { 
                      style: 'currency', 
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₹' + value.toLocaleString('en-IN');
                }
              }
            }
          }
        }
      });
    }
  }
  
  initPropertyOccupancyChart() {
    const ctx = document.getElementById('propertyOccupancyChart') as HTMLCanvasElement;
    if (ctx) {
      this.propertyOccupancyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.dashboardData.occupancyData.labels,
          datasets: [
            {
              label: 'Sold',
              data: this.dashboardData.occupancyData.datasets[0].data,
              backgroundColor: '#1a3c8f',
              borderColor: '#1a3c8f',
              borderWidth: 1
            },
            {
              label: 'Available',
              data: this.dashboardData.occupancyData.datasets[1].data,
              backgroundColor: '#e63946',
              borderColor: '#e63946',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Flats'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Sites'
              }
            }
          }
        }
      });
    }
  }
  
  initAgentPerformanceChart() {
    const ctx = document.getElementById('agentPerformanceChart') as HTMLCanvasElement;
    if (ctx) {
      this.agentPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.dashboardData.agentPerformanceData.labels,
          datasets: [{
            label: 'Sales (in units)',
            data: this.dashboardData.agentPerformanceData.datasets[0].data,
            backgroundColor: [
              'rgba(26, 60, 143, 0.8)',
              'rgba(26, 60, 143, 0.7)',
              'rgba(26, 60, 143, 0.6)',
              'rgba(26, 60, 143, 0.5)',
              'rgba(26, 60, 143, 0.4)'
            ],
            borderColor: [
              'rgba(26, 60, 143, 1)',
              'rgba(26, 60, 143, 1)',
              'rgba(26, 60, 143, 1)',
              'rgba(26, 60, 143, 1)',
              'rgba(26, 60, 143, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Sales'
              }
            }
          }
        }
      });
    }
  }
  
  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
