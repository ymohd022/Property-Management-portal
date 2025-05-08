import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup,  FormArray, Validators } from "@angular/forms"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { Router } from "@angular/router"
import  { PropertyService } from "../../../services/property.service"

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
  hasBlocks = false
  selectedFiles: File[] = []
  previewImages: { file: File; preview: string }[] = []

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
    private propertyService: PropertyService,
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
      hasBlocks: [false],
      totalBlocks: [1, [Validators.min(1), Validators.max(10)]],
      permitNumber: [""],
      targetMarket: [""],
      remarks: [""],
      blocks: this.fb.array([]),
      floors: this.fb.array([]), // For non-block properties
    })
  }

  ngOnInit() {
    // Watch for changes to hasBlocks
    this.propertyForm.get("hasBlocks")?.valueChanges.subscribe((hasBlocks) => {
      this.hasBlocks = hasBlocks
      if (hasBlocks) {
        // Clear floors and init blocks
        ;(this.propertyForm.get("floors") as FormArray).clear()
        this.initBlocks()
      } else {
        // Clear blocks and init floors
        ;(this.propertyForm.get("blocks") as FormArray).clear()
        this.addFloor() // Initialize with one floor
      }
    })

    // Initialize with one floor (for non-block properties)
    this.addFloor()
  }

  get floorsArray() {
    return this.propertyForm.get("floors") as FormArray
  }

  get blocksArray() {
    return this.propertyForm.get("blocks") as FormArray
  }

  initBlocks() {
    const totalBlocks = this.propertyForm.get("totalBlocks")?.value || 1
    for (let i = 0; i < totalBlocks; i++) {
      this.addBlock()
    }
  }

  addBlock() {
    const blockGroup = this.fb.group({
      blockName: [`Block ${this.blocksArray.length + 1}`, [Validators.required]],
      totalFloors: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      flatsPerFloor: [4, [Validators.required, Validators.min(1), Validators.max(20)]],
      parkingFacilitiesCount: [0, [Validators.min(0)]],
      floors: this.fb.array([]),
    })

    this.blocksArray.push(blockGroup)

    // Add default floor to this block
    this.addFloorToBlock(this.blocksArray.length - 1)
  }

  removeBlock(blockIndex: number) {
    this.blocksArray.removeAt(blockIndex)
  }

  getBlockFloorsArray(blockIndex: number) {
    return this.blocksArray.at(blockIndex).get("floors") as FormArray
  }

  addFloorToBlock(blockIndex: number) {
    const floorsArray = this.getBlockFloorsArray(blockIndex)
    const floorGroup = this.fb.group({
      floorNumber: [floorsArray.length + 1],
      flats: this.fb.array([]),
    })

    floorsArray.push(floorGroup)

    // Add default number of flats to this floor
    const flatsPerFloor = this.blocksArray.at(blockIndex).get("flatsPerFloor")?.value || 4
    const blockName = this.blocksArray.at(blockIndex).get("blockName")?.value || `Block ${blockIndex + 1}`
    const flatsArray = floorGroup.get("flats") as FormArray

    for (let i = 0; i < flatsPerFloor; i++) {
      this.addFlatToFloorInBlock(flatsArray, blockName, floorsArray.length, i + 1)
    }
  }

  removeFloorFromBlock(blockIndex: number, floorIndex: number) {
    const floorsArray = this.getBlockFloorsArray(blockIndex)
    floorsArray.removeAt(floorIndex)

    // Update floor numbers
    for (let i = 0; i < floorsArray.length; i++) {
      floorsArray
        .at(i)
        .get("floorNumber")
        ?.setValue(i + 1)

      // Update flat numbers
      const flatsArray = floorsArray.at(i).get("flats") as FormArray
      const blockName = this.blocksArray.at(blockIndex).get("blockName")?.value || `Block ${blockIndex + 1}`
      for (let j = 0; j < flatsArray.length; j++) {
        flatsArray
          .at(j)
          .get("flatNumber")
          ?.setValue(`${blockName}-${i + 1}0${j + 1}`)
      }
    }
  }

  addFlatToFloorInBlock(flatsArray: FormArray, blockName: string, floorNumber: number, flatIndex: number) {
    flatsArray.push(
      this.fb.group({
        flatNumber: [`${blockName}-${floorNumber}0${flatIndex}`],
        flatType: ["2bhk", [Validators.required]],
        flatSize: ["", [Validators.required, Validators.min(100)]],
        flatStatus: ["available", [Validators.required]],
        flatPrice: ["", [Validators.required, Validators.min(0)]],
      }),
    )
  }

  getFlatsForFloorInBlock(blockIndex: number, floorIndex: number) {
    return (this.getBlockFloorsArray(blockIndex).at(floorIndex).get("flats") as FormArray).controls
  }

  addFlatToExistingFloorInBlock(blockIndex: number, floorIndex: number) {
    const floorsArray = this.getBlockFloorsArray(blockIndex)
    const flatsArray = floorsArray.at(floorIndex).get("flats") as FormArray
    const blockName = this.blocksArray.at(blockIndex).get("blockName")?.value || `Block ${blockIndex + 1}`
    this.addFlatToFloorInBlock(flatsArray, blockName, floorIndex + 1, flatsArray.length + 1)
  }

  removeFlatFromFloorInBlock(blockIndex: number, floorIndex: number, flatIndex: number) {
    const floorsArray = this.getBlockFloorsArray(blockIndex)
    const flatsArray = floorsArray.at(floorIndex).get("flats") as FormArray
    flatsArray.removeAt(flatIndex)

    // Update flat numbers
    const blockName = this.blocksArray.at(blockIndex).get("blockName")?.value || `Block ${blockIndex + 1}`
    for (let j = 0; j < flatsArray.length; j++) {
      flatsArray
        .at(j)
        .get("flatNumber")
        ?.setValue(`${blockName}-${floorIndex + 1}0${j + 1}`)
    }
  }

  autoGenerateFloorsForBlock(blockIndex: number) {
    const block = this.blocksArray.at(blockIndex)
    const totalFloors = block.get("totalFloors")?.value || 1
    const flatsPerFloor = block.get("flatsPerFloor")?.value || 4
    const blockName = block.get("blockName")?.value || `Block ${blockIndex + 1}`

    // Clear existing floors
    const floorsArray = this.getBlockFloorsArray(blockIndex)
    while (floorsArray.length) {
      floorsArray.removeAt(0)
    }

    // Generate floors and flats
    for (let i = 0; i < totalFloors; i++) {
      const floorGroup = this.fb.group({
        floorNumber: [i + 1],
        flats: this.fb.array([]),
      })

      floorsArray.push(floorGroup)

      // Add flats to this floor
      const flatsArray = floorGroup.get("flats") as FormArray

      for (let j = 0; j < flatsPerFloor; j++) {
        this.addFlatToFloorInBlock(flatsArray, blockName, i + 1, j + 1)
      }
    }

    this.showFlatsSection = true
  }

  // Original methods for non-block properties
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

  // Image handling methods
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) return

    const maxFiles = 5
    const files = Array.from(input.files)

    if (files.length > maxFiles) {
      this.snackBar.open(`You can only upload up to ${maxFiles} images`, "Close", { duration: 3000 })
      return
    }

    // Filter for only images
    const validFiles = files.filter((file) => file.type.startsWith("image/"))
    if (validFiles.length !== files.length) {
      this.snackBar.open("Only image files are allowed", "Close", { duration: 3000 })
    }

    // Create previews
    this.selectedFiles = validFiles
    this.previewImages = []

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        this.previewImages.push({
          file: file,
          preview: e.target.result,
        })
      }
      reader.readAsDataURL(file)
    })
  }

  removeImage(index: number) {
    this.previewImages.splice(index, 1)
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index)
  }

  onSubmit() {
    if (this.propertyForm.valid) {
      this.isLoading = true

      // Send to backend
      this.propertyService.createProperty(this.propertyForm.value).subscribe({
        next: (response) => {
          // Upload images if any
          if (this.selectedFiles.length > 0) {
            this.uploadImages(response.id)
          } else {
            this.handleSubmitSuccess()
          }
        },
        error: (error) => {
          this.isLoading = false
          this.snackBar.open(
            "Error adding property: " + (error.message || error.error?.message || "Unknown error"),
            "Close",
            {
              duration: 5000,
              panelClass: ["error-snackbar"],
            },
          )
        },
      })
    } else {
      this.propertyForm.markAllAsTouched()
      this.snackBar.open("Please fill all required fields correctly", "Close", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      })
    }
  }

  uploadImages(propertyId: number) {
    const formData = new FormData()
    this.selectedFiles.forEach((file) => {
      formData.append("images", file)
    })

    this.propertyService.uploadPropertyImage(propertyId, formData).subscribe({
      next: () => this.handleSubmitSuccess(),
      error: (error) => {
        this.isLoading = false
        this.snackBar.open(
          "Property created but failed to upload images: " + (error.message || error.error?.message || "Unknown error"),
          "Close",
          {
            duration: 5000,
            panelClass: ["error-snackbar"],
          },
        )
        this.router.navigate(["/properties"])
      },
    })
  }

  handleSubmitSuccess() {
    this.isLoading = false
    this.snackBar.open("Property added successfully!", "Close", {
      duration: 3000,
    })
    this.router.navigate(["/properties"])
  }

  getStatusColor(status: string): string {
    const foundStatus = this.flatStatuses.find((s) => s.value === status)
    return foundStatus ? foundStatus.color : "#757575"
  }
}