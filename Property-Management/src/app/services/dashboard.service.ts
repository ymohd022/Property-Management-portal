import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient) {}
  
  getDashboardData(): Observable<any> {
    // For demo purposes, we'll return mock data
    // In a real app, this would make an HTTP request to your backend
    return of({
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
    }).pipe(delay(1500)); // Simulate network delay
  }
}