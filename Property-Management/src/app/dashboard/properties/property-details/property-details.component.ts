import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { MatSnackBar } from "@angular/material/snack-bar"
import { PropertyService } from "../../../services/property.service"

@Component({
  selector: 'app-property-details',
  standalone: false,
  templateUrl: './property-details.component.html',
  styleUrl: './property-details.component.css'
})
export class PropertyDetailsComponent implements OnInit {
  propertyId = ""
  property: any = null
  isLoading = true
  activeTab = 0

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.propertyId = params["id"]
      this.loadPropertyDetails()
    })
  }

  loadPropertyDetails() {
    this.isLoading = true
    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (data) => {
        this.property = data
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading property details:", error)
        this.isLoading = false
        this.snackBar.open("Error loading property details", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
        this.router.navigate(["/properties"])
      },
    })
  }

  getPrimaryImage(): string {
    if (!this.property?.images) return ''
    const primary = this.property.images.find((img: any) => img.is_primary)
    return primary?.image_path || this.property.images[0]?.image_path || ''
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "Active": return "#4caf50"
      case "Upcoming": return "#2196f3"
      case "Completed": return "#ff9800"
      default: return "#757575"
    }
  }

  getFlatStatusColor(status: string): string {
    switch (status) {
      case "Available": return "#4caf50"
      case "Booked": return "#ff9800"
      case "Sold": return "#f44336"
      default: return "#757575"
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  setImageAsPrimary(imageId: number) {
    this.propertyService.setPropertyImageAsPrimary(+this.propertyId, imageId).subscribe({
      next: () => {
        this.loadPropertyDetails()
        this.snackBar.open("Primary image updated", "Close", { duration: 3000 })
      },
      error: (error) => {
        console.error("Error setting primary image:", error)
        this.snackBar.open("Error updating primary image", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
      },
    })
  }

  deleteImage(imageId: number) {
    if (confirm("Are you sure you want to delete this image?")) {
      this.propertyService.deletePropertyImage(+this.propertyId, imageId).subscribe({
        next: () => {
          this.loadPropertyDetails()
          this.snackBar.open("Image deleted successfully", "Close", { duration: 3000 })
        },
        error: (error) => {
          console.error("Error deleting image:", error)
          this.snackBar.open("Error deleting image", "Close", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          })
        },
      })
    }
  }

  navigateToEdit() {
    this.router.navigate(["/properties/edit", this.propertyId])
  }

  goBack() {
    this.router.navigate(["/properties"])
  }
}