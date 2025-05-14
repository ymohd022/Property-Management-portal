import { Component, Inject,  OnInit } from "@angular/core"
import {  FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA,  MatDialogRef } from "@angular/material/dialog"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { PaymentService } from "../../services/payment.service"
import  { PropertyService } from "../../services/property.service"

@Component({
  selector: 'app-add-payment-dialog',
  standalone: false,
  templateUrl: './add-payment-dialog.component.html',
  styleUrl: './add-payment-dialog.component.css'
})
export class AddPaymentDialogComponent implements OnInit {
  paymentForm: FormGroup
  properties: any[] = []
  blocks: any[] = []
  flats: any[] = []
  clients: any[] = []
  isLoading = false
  loadingProperties = true
  loadingBlocks = false
  loadingFlats = false
  loadingClients = false
  selectedFile: File | null = null
  paymentTypes = ["Semi Furnished", "Work Order Estimate", "RGST", "Miscellaneous Charges", "Other"]
  paymentMethods = ["Cash", "UPI", "Cheque", "Bank Transfer", "Other"];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private propertyService: PropertyService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddPaymentDialogComponent>
  ) {
    this.paymentForm = this.fb.group({
      propertyId: ["", Validators.required],
      blockId: [""],
      flatId: ["", Validators.required],
      clientId: [""],
      paymentDate: [new Date(), Validators.required],
      paymentType: ["", Validators.required],
      paymentMethod: ["", Validators.required],
      amount: ["", [Validators.required, Validators.min(0)]],
      referenceNumber: [""],
      comments: [""],
    });
  }

  ngOnInit() {
    this.loadProperties()

    // If editing, populate the form
    if (this.data.isEdit && this.data.payment) {
      this.paymentForm.patchValue({
        propertyId: this.data.payment.property_id,
        blockId: this.data.payment.block_id,
        flatId: this.data.payment.flat_id,
        clientId: this.data.payment.client_id,
        paymentDate: new Date(this.data.payment.payment_date),
        paymentType: this.data.payment.payment_type,
        paymentMethod: this.data.payment.payment_method,
        amount: this.data.payment.amount,
        referenceNumber: this.data.payment.reference_number,
        comments: this.data.payment.comments,
      })

      // Load related data
      this.onPropertyChange()
    } else if (this.data.propertyId) {
      // If property ID is provided, select it
      this.paymentForm.get("propertyId")?.setValue(this.data.propertyId)
      this.onPropertyChange()
    }
  }

  loadProperties() {
    this.loadingProperties = true
    this.propertyService.getAllProperties().subscribe({
      next: (data) => {
        this.properties = data
        this.loadingProperties = false
      },
      error: (error) => {
        console.error("Error loading properties:", error)
        this.loadingProperties = false
        this.snackBar.open("Error loading properties", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
      },
    })
  }

  onPropertyChange() {
    const propertyId = this.paymentForm.get("propertyId")?.value
    if (!propertyId) {
      this.blocks = []
      this.flats = []
      this.paymentForm.get("blockId")?.setValue("")
      this.paymentForm.get("flatId")?.setValue("")
      return
    }

    // Load blocks for this property
    this.loadingBlocks = true
    this.propertyService.getPropertyById(propertyId).subscribe({
      next: (property) => {
        if (property.has_blocks && property.blocks) {
          this.blocks = property.blocks
        } else {
          this.blocks = []
        }
        this.loadingBlocks = false

        // Load flats directly if no blocks
        if (this.blocks.length === 0) {
          this.loadFlats(propertyId)
        }
      },
      error: (error) => {
        console.error("Error loading property details:", error)
        this.loadingBlocks = false
        this.snackBar.open("Error loading property details", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
      },
    })
  }

  onBlockChange() {
    const propertyId = this.paymentForm.get("propertyId")?.value
    const blockId = this.paymentForm.get("blockId")?.value

    if (!propertyId) return

    this.loadFlats(propertyId, blockId)
  }

  loadFlats(propertyId: number, blockId?: number) {
    this.loadingFlats = true
    this.propertyService.getPropertyById(propertyId).subscribe({
      next: (property) => {
        if (blockId) {
          // Get flats for specific block
          const block = property.blocks.find((b: any) => b.id === blockId)
          this.flats = block ? block.flats : []
        } else if (property.has_blocks) {
          // Get all flats from all blocks
          this.flats = []
          property.blocks.forEach((block: any) => {
            if (block.flats) {
              this.flats = [...this.flats, ...block.flats]
            }
          })
        } else {
          // Get flats directly
          this.flats = property.flats || []
        }
        this.loadingFlats = false
      },
      error: (error) => {
        console.error("Error loading flats:", error)
        this.loadingFlats = false
        this.snackBar.open("Error loading flats", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
      },
    })
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open("File size should not exceed 5MB", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
        return
      }

      // Check file type
      if (!file.type.match(/image\/*|application\/pdf/)) {
        this.snackBar.open("Only image and PDF files are allowed", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
        return
      }

      this.selectedFile = file
    }
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      this.isLoading = true

      const formData = new FormData()

      // Add form values to FormData
      Object.keys(this.paymentForm.value).forEach((key) => {
        if (key === "paymentDate") {
          // Format date as YYYY-MM-DD
          const date = this.paymentForm.get(key)?.value
          formData.append(key, date.toISOString().split("T")[0])
        } else {
          formData.append(key, this.paymentForm.get(key)?.value)
        }
      })

      // Add file if selected
      if (this.selectedFile) {
        formData.append("receiptImage", this.selectedFile)
      }

      // Create or update payment
      const request = this.data.isEdit
        ? this.paymentService.updatePayment(this.data.payment.id, formData)
        : this.paymentService.createPayment(formData)

      request.subscribe({
        next: () => {
          this.isLoading = false
          this.dialogRef.close(true)
        },
        error: (error) => {
          console.error("Error saving payment:", error)
          this.isLoading = false
          this.snackBar.open("Error saving payment", "Close", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          })
        },
      })
    } else {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.paymentForm)
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }

  onCancel() {
    this.dialogRef.close()
  }
}
