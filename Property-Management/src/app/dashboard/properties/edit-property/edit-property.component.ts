import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup,  FormArray, Validators } from "@angular/forms"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { ActivatedRoute, Router } from "@angular/router"
import  { PropertyService } from "../../../services/property.service"
import  { Location } from "@angular/common"
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
  selector: 'app-edit-property',
  standalone: false,
  templateUrl: './edit-property.component.html',
  styleUrl: './edit-property.component.css'
})
export class EditPropertyComponent implements OnInit {
  propertyForm: FormGroup
  propertyId: string
  property: any = null
  isLoading = true
  isSaving = false
  showFlatsSection = false
  hasBlocks = false
  selectedFiles: File[] = []
  previewImages: { file: File; preview: string }[] = []
  existingImages: any[] = []
  serverUrl = "http://localhost:3000" // Add server URL for images

  siteTypes = [
    { value: "residential", viewValue: "Residential" },
    { value: "commercial", viewValue: "Commercial" },
    { value: "mixed", viewValue: "Mixed Use" },
  ]

  siteStatuses = [
    { value: "Active", viewValue: "Active" },
    { value: "Upcoming", viewValue: "Upcoming" },
    { value: "Completed", viewValue: "Completed" },
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
    { value: "Available", viewValue: "Available", color: "#4caf50" },
    { value: "Booked", viewValue: "Booked", color: "#ff9800" },
    { value: "Sold", viewValue: "Sold", color: "#f44336" },
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
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private location: Location,
  ) {
    this.propertyId = this.route.snapshot.paramMap.get("id") || ""
    this.propertyForm = this.createPropertyForm()
  }

  createPropertyForm(): FormGroup {
    return this.fb.group({
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
      totalFloors: [1, [Validators.min(1), Validators.max(100)]], // Add this for non-block properties
      flatsPerFloor: [4, [Validators.min(1), Validators.max(20)]], // Add this for non-block properties
    })
  }

  ngOnInit() {
    this.loadPropertyDetails()

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
  }

  loadPropertyDetails() {
    this.isLoading = true
    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (property) => {
        this.property = property
        this.populateForm(property)
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

  populateForm(property: any) {
    // Set basic property details
    this.propertyForm.patchValue({
      siteName: property.name,
      siteType: property.type,
      sitePrice: property.price,
      siteLocality: property.locality,
      siteStatus: property.status,
      totalCount: property.total_count,
      totalLandArea: property.total_land_area,
      unitSizes: property.unit_sizes,
      hasBlocks: property.has_blocks,
      totalBlocks: property.total_blocks,
      permitNumber: property.permit_number,
      targetMarket: property.target_market,
      remarks: property.remarks,
    })

    // Set amenities
    if (property.amenities) {
      this.selectedAmenities = Array.isArray(property.amenities) ? property.amenities : JSON.parse(property.amenities)
      this.propertyForm.get("amenities")?.setValue(this.selectedAmenities)
    }

    // Set existing images
    if (property.images && property.images.length > 0) {
      this.existingImages = property.images.map((img: any) => ({
        ...img,
        image_path: this.getFullImageUrl(img.image_path),
      }))
    }

    // Set blocks or floors based on property type
    if (property.has_blocks) {
      this.hasBlocks = true
      if (property.blocks && property.blocks.length > 0) {
        const blocksArray = this.propertyForm.get("blocks") as FormArray
        blocksArray.clear()

        property.blocks.forEach((block: any) => {
          const blockGroup = this.fb.group({
            blockName: [block.block_name, [Validators.required]],
            totalFloors: [block.total_floors, [Validators.required, Validators.min(1), Validators.max(100)]],
            flatsPerFloor: [block.flats_per_floor, [Validators.required, Validators.min(1), Validators.max(20)]],
            parkingFacilitiesCount: [block.parking_facilities_count || 0, [Validators.min(0)]],
            floors: this.fb.array([]),
          })

          blocksArray.push(blockGroup)

          // Group flats by floor
          const floorMap = new Map<number, any[]>()
          if (block.flats && block.flats.length > 0) {
            block.flats.forEach((flat: any) => {
              if (!floorMap.has(flat.floor_number)) {
                floorMap.set(flat.floor_number, [])
              }
              floorMap.get(flat.floor_number)?.push(flat)
            })
          }

          // Add floors and flats
          const floorsArray = blockGroup.get("floors") as FormArray
          Array.from(floorMap.keys())
            .sort((a, b) => a - b)
            .forEach((floorNumber) => {
              const floorGroup = this.fb.group({
                floorNumber: [floorNumber],
                flats: this.fb.array([]),
              })

              floorsArray.push(floorGroup)

              // Add flats to this floor
              const flatsArray = floorGroup.get("flats") as FormArray
              const flats = floorMap.get(floorNumber) || []
              flats.forEach((flat) => {
                flatsArray.push(
                  this.fb.group({
                    flatNumber: [flat.flat_number],
                    flatType: [flat.flat_type, [Validators.required]],
                    flatSize: [flat.flat_size, [Validators.required, Validators.min(100)]],
                    flatStatus: [flat.status, [Validators.required]],
                    flatPrice: [flat.flat_price, [Validators.required, Validators.min(0)]],
                  }),
                )
              })
            })
        })
      }
    } else {
      // Handle non-block property
      this.hasBlocks = false
      const floorsArray = this.propertyForm.get("floors") as FormArray
      floorsArray.clear()

      // Group flats by floor
      const floorMap = new Map<number, any[]>()
      if (property.flats && property.flats.length > 0) {
        property.flats.forEach((flat: any) => {
          if (!floorMap.has(flat.floor_number)) {
            floorMap.set(flat.floor_number, [])
          }
          floorMap.get(flat.floor_number)?.push(flat)
        })
      }

      // Add floors and flats
      Array.from(floorMap.keys())
        .sort((a, b) => a - b)
        .forEach((floorNumber) => {
          const floorGroup = this.fb.group({
            floorNumber: [floorNumber],
            flats: this.fb.array([]),
          })

          floorsArray.push(floorGroup)

          // Add flats to this floor
          const flatsArray = floorGroup.get("flats") as FormArray
          const flats = floorMap.get(floorNumber) || []
          flats.forEach((flat) => {
            flatsArray.push(
              this.fb.group({
                flatNumber: [flat.flat_number],
                flatType: [flat.flat_type, [Validators.required]],
                flatSize: [flat.flat_size, [Validators.required, Validators.min(100)]],
                flatStatus: [flat.status, [Validators.required]],
                flatPrice: [flat.flat_price, [Validators.required, Validators.min(0)]],
              }),
            )
          })
        })

      this.showFlatsSection = true
    }
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
        flatStatus: ["Available", [Validators.required]],
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
        flatStatus: ["Available", [Validators.required]],
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

  removeExistingImage(imageId: number) {
    if (confirm("Are you sure you want to delete this image?")) {
      this.propertyService.deletePropertyImage(+this.propertyId, imageId).subscribe({
        next: () => {
          this.existingImages = this.existingImages.filter((img) => img.id !== imageId)
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

  setImageAsPrimary(imageId: number) {
    this.propertyService.setPropertyImageAsPrimary(+this.propertyId, imageId).subscribe({
      next: () => {
        this.existingImages = this.existingImages.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
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

  getFullImageUrl(path: string): string {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return `${this.serverUrl}${path}`
  }

  onSubmit() {
    if (this.propertyForm.valid) {
      this.isSaving = true

      // Send to backend
      this.propertyService.updateProperty(this.propertyId, this.propertyForm.value).subscribe({
        next: (response) => {
          // Upload images if any
          if (this.selectedFiles.length > 0) {
            this.uploadImages()
          } else {
            this.handleSubmitSuccess()
          }
        },
        error: (error) => {
          this.isSaving = false
          this.snackBar.open(
            "Error updating property: " + (error.message || error.error?.message || "Unknown error"),
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

  uploadImages() {
    const formData = new FormData()
    this.selectedFiles.forEach((file) => {
      formData.append("images", file)
    })

    this.propertyService.uploadPropertyImage(+this.propertyId, formData).subscribe({
      next: () => this.handleSubmitSuccess(),
      error: (error) => {
        this.isSaving = false
        this.snackBar.open(
          "Property updated but failed to upload images: " + (error.message || error.error?.message || "Unknown error"),
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
    this.isSaving = false
    this.snackBar.open("Property updated successfully!", "Close", {
      duration: 3000,
    })
    this.router.navigate(["/properties"])
  }

  getStatusColor(status: string): string {
    const foundStatus = this.flatStatuses.find((s) => s.value === status)
    return foundStatus ? foundStatus.color : "#757575"
  }

  goBack() {
    this.location.back()
  }
}
