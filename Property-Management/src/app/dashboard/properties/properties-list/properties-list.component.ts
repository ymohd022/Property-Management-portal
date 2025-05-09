import { Component,  OnInit } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import  { Router } from "@angular/router"
import  { PropertyService } from "../../../services/property.service"
import  { MatSnackBar } from "@angular/material/snack-bar"

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

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadProperties()
  }

  loadProperties() {
    this.isLoading = true
    this.propertyService.getAllProperties().subscribe({
      next: (data) => {
        this.dataSource.data = data
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading properties:", error)
        this.isLoading = false
        this.snackBar.open("Error loading properties", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })

        // Load mock data for demo
        this.loadMockData()
      },
    })
  }

  loadMockData() {
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

  viewPropertyDetails(propertyId: string) {
    this.router.navigate(["/properties", propertyId])
  }

  editProperty(propertyId: string) {
    this.router.navigate(["/properties/edit", propertyId])
  }

  deleteProperty(propertyId: string) {
    if (confirm("Are you sure you want to delete this property?")) {
      this.propertyService.deleteProperty(propertyId).subscribe({
        next: () => {
          this.loadProperties()
          this.snackBar.open("Property deleted successfully", "Close", {
            duration: 3000,
          })
        },
        error: (error) => {
          console.error("Error deleting property:", error)
          this.snackBar.open("Error deleting property", "Close", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          })
        },
      })
    }
  }
}
