import { Component,  OnInit } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"

interface Property {
  id: string
  name: string
  location: string
  type: string
  totalFlats: number
  soldFlats: number
  availableFlats: number
  status: string
}

@Component({
  selector: 'app-properties-list',
  standalone: false,
  templateUrl: './properties-list.component.html',
  styleUrl: './properties-list.component.css'
})
export class PropertiesListComponent implements OnInit {
  displayedColumns: string[] = [
    "name",
    "location",
    "type",
    "totalFlats",
    "soldFlats",
    "availableFlats",
    "status",
    "actions",
  ]
  dataSource = new MatTableDataSource<Property>()
  isLoading = true

  constructor() {}

  ngOnInit() {
    // Simulate API call
    setTimeout(() => {
      this.dataSource.data = [
        {
          id: "1",
          name: "Sunshine Apartments",
          location: "Whitefield, Bangalore",
          type: "Residential",
          totalFlats: 48,
          soldFlats: 32,
          availableFlats: 16,
          status: "Active",
        },
        {
          id: "2",
          name: "Green Valley Villas",
          location: "Electronic City, Bangalore",
          type: "Residential",
          totalFlats: 24,
          soldFlats: 18,
          availableFlats: 6,
          status: "Active",
        },
        {
          id: "3",
          name: "Metro Business Park",
          location: "MG Road, Bangalore",
          type: "Commercial",
          totalFlats: 36,
          soldFlats: 28,
          availableFlats: 8,
          status: "Completed",
        },
        {
          id: "4",
          name: "Lakeside Residency",
          location: "Hebbal, Bangalore",
          type: "Residential",
          totalFlats: 60,
          soldFlats: 45,
          availableFlats: 15,
          status: "Active",
        },
        {
          id: "5",
          name: "City Center Mall",
          location: "Jayanagar, Bangalore",
          type: "Commercial",
          totalFlats: 72,
          soldFlats: 64,
          availableFlats: 8,
          status: "Completed",
        },
      ]
      this.isLoading = false
    }, 1000)
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  getAvailabilityPercentage(property: Property): number {
    return (property.availableFlats / property.totalFlats) * 100
  }

  getSoldPercentage(property: Property): number {
    return (property.soldFlats / property.totalFlats) * 100
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "Active":
        return "#4caf50"
      case "Upcoming":
        return "#2196f3"
      case "Completed":
        return "#ff9800"
      default:
        return "#757575"
    }
  }
}
