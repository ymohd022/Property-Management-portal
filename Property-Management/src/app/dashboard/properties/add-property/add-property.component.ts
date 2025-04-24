import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup,  FormArray, Validators } from "@angular/forms"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { Router } from "@angular/router"

interface FlatType {
  value: string
  viewValue: string
}

interface FlatStatus {
  value: string
  viewValue: string
  color: string
}

@Component({
  selector: 'app-add-property',
  standalone: false,
  templateUrl: './add-property.component.html',
  styleUrl: './add-property.component.css'
})
export class AddPropertyComponent implements OnInit {
  propertyForm: FormGroup
  isLoading = false
  showFlatsSection = false

  siteTypes = [
    { value: "residential", viewValue: "Residential" },
    { value: "commercial", viewValue: "Commercial" },
    { value: "mixed", viewValue: "Mixed Use" },
  ]

  siteStatuses = [
    { value: "active", viewValue: "Active" },
    { value: "upcoming", viewValue: "Upcoming" },
    { value: "completed", viewValue: "Completed" },
  ]

  flatTypes: FlatType[] = [
    { value: "1bhk", viewValue: "1 BHK" },
    { value: "2bhk", viewValue: "2 BHK" },
    { value: "3bhk", viewValue: "3 BHK" },
    { value: "4bhk", viewValue: "4 BHK" },
    { value: "penthouse", viewValue: "Penthouse" },
    { value: "shop", viewValue: "Shop" },
    { value: "office", viewValue: "Office Space" },
  ]

  flatStatuses: FlatStatus[] = [
    { value: "available", viewValue: "Available", color: "#4caf50" },
    { value: "booked", viewValue: "Booked", color: "#ff9800" },
    { value: "sold", viewValue: "Sold", color: "#f44336" },
  ]

  amenities = [
    { value: "gym", viewValue: "Gym" },
    { value: "pool", viewValue: "Swimming Pool" },
    { value: "garden", viewValue: "Garden" },
    { value: "parking", viewValue: "Parking" },
    { value: "security", viewValue: "24x7 Security" },
    { value: "clubhouse", viewValue: "Club House" },
    { value: "playground", viewValue: "Children's Playground" },
    { value: "lift", viewValue: "Lift" },
  ]

  selectedAmenities: string[] = []

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.propertyForm = this.fb.group({
      siteName: ["", [Validators.required]],
      siteType: ["", [Validators.required]],
      sitePrice: ["", [Validators.required, Validators.min(0)]],
      siteLocality: ["", [Validators.required]],
      siteStatus: ["", [Validators.required]],
      totalCount: [1, [Validators.required, Validators.min(1)]],
      totalLandArea: ["", [Validators.required]],
      unitSizes: ["", [Validators.required]],
      amenities: [[]],
      totalFloors: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      flatsPerFloor: [4, [Validators.required, Validators.min(1), Validators.max(20)]],
      floors: this.fb.array([]),
    })
  }

  ngOnInit() {
    // Initialize with one floor
    this.addFloor()
  }

  get floorsArray() {
    return this.propertyForm.get("floors") as FormArray
  }

  addFloor() {
    const floorGroup = this.fb.group({
      floorNumber: [this.floorsArray.length + 1],
      flats: this.fb.array([]),
    })

    this.floorsArray.push(floorGroup)

    // Add default number of flats to this floor
    const flatsPerFloor = this.propertyForm.get("flatsPerFloor")?.value || 4
    const flatsArray = floorGroup.get("flats") as FormArray

    for (let i = 0; i < flatsPerFloor; i++) {
      this.addFlatToFloor(flatsArray, this.floorsArray.length, i + 1)
    }
  }

  addFlatToFloor(flatsArray: FormArray, floorNumber: number, flatIndex: number) {
    flatsArray.push(
      this.fb.group({
        flatNumber: [`${floorNumber}0${flatIndex}`],
        flatType: ["2bhk", [Validators.required]],
        flatSize: ["", [Validators.required, Validators.min(100)]],
        flatStatus: ["available", [Validators.required]],
        flatPrice: ["", [Validators.required, Validators.min(0)]],
      }),
    )
  }

  getFlatsForFloor(floorIndex: number) {
    return (this.floorsArray.at(floorIndex).get("flats") as FormArray).controls
  }

  removeFloor(index: number) {
    this.floorsArray.removeAt(index)

    // Update floor numbers
    for (let i = 0; i < this.floorsArray.length; i++) {
      this.floorsArray
        .at(i)
        .get("floorNumber")
        ?.setValue(i + 1)

      // Update flat numbers
      const flatsArray = this.floorsArray.at(i).get("flats") as FormArray
      for (let j = 0; j < flatsArray.length; j++) {
        flatsArray
          .at(j)
          .get("flatNumber")
          ?.setValue(`${i + 1}0${j + 1}`)
      }
    }
  }

  removeFlatFromFloor(floorIndex: number, flatIndex: number) {
    const flatsArray = this.floorsArray.at(floorIndex).get("flats") as FormArray
    flatsArray.removeAt(flatIndex)

    // Update flat numbers
    for (let j = 0; j < flatsArray.length; j++) {
      flatsArray
        .at(j)
        .get("flatNumber")
        ?.setValue(`${floorIndex + 1}0${j + 1}`)
    }
  }

  addFlatToExistingFloor(floorIndex: number) {
    const flatsArray = this.floorsArray.at(floorIndex).get("flats") as FormArray
    this.addFlatToFloor(flatsArray, floorIndex + 1, flatsArray.length + 1)
  }

  autoGenerateFloors() {
    // Clear existing floors
    while (this.floorsArray.length) {
      this.floorsArray.removeAt(0)
    }

    const totalFloors = this.propertyForm.get("totalFloors")?.value || 1
    const flatsPerFloor = this.propertyForm.get("flatsPerFloor")?.value || 4

    // Generate floors and flats
    for (let i = 0; i < totalFloors; i++) {
      const floorGroup = this.fb.group({
        floorNumber: [i + 1],
        flats: this.fb.array([]),
      })

      this.floorsArray.push(floorGroup)

      // Add flats to this floor
      const flatsArray = floorGroup.get("flats") as FormArray

      for (let j = 0; j < flatsPerFloor; j++) {
        this.addFlatToFloor(flatsArray, i + 1, j + 1)
      }
    }

    this.showFlatsSection = true
  }

  toggleAmenity(amenity: string) {
    const index = this.selectedAmenities.indexOf(amenity)
    if (index === -1) {
      this.selectedAmenities.push(amenity)
    } else {
      this.selectedAmenities.splice(index, 1)
    }
    this.propertyForm.get("amenities")?.setValue(this.selectedAmenities)
  }

  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities.includes(amenity)
  }

  onSubmit() {
    if (this.propertyForm.valid) {
      this.isLoading = true

      // In a real app, you would send this to your backend
      console.log("Property Form Data:", this.propertyForm.value)

      setTimeout(() => {
        this.isLoading = false
        this.snackBar.open("Property added successfully!", "Close", {
          duration: 3000,
        })
        this.router.navigate(["/properties"])
      }, 1500)
    } else {
      this.propertyForm.markAllAsTouched()
      this.snackBar.open("Please fill all required fields correctly", "Close", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      })
    }
  }

  getStatusColor(status: string): string {
    const foundStatus = this.flatStatuses.find((s) => s.value === status)
    return foundStatus ? foundStatus.color : "#757575"
  }
}
