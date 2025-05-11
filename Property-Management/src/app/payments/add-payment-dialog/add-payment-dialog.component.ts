import { Component, Inject,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import {  MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
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
  flats: any[] = []
  isLoading = false
  loadingProperties = true
  loadingFlats = false
  isEdit = false
  selectedFile: File | null = null
  paymentCategories = ["Base Price", "Semi Finished", "Work Order Estimate", "RGST", "Miscellaneous Charges", "Other"]
  paymentTypes = ["Cash", "UPI", "Cheque", "Bank Transfer", "Other"]
  flatDetails: any = null;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private propertyService: PropertyService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = !!data && !!data.payment;

    this.paymentForm = this.fb.group({
      property_id: ['', Validators.required],
      flat_id: ['', Validators.required],
      payment_date: [new Date(), Validators.required],
      payment_type: ["Cash", Validators.required],
      payment_amount: ["", [Validators.required, Validators.min(1)]],
      payment_category: ["Base Price", Validators.required],
      reference_number: [""],
      comments: [""],
    });

    if (this.isEdit) {
      this.paymentForm.patchValue({
        property_id: data.payment.property_id,
        flat_id: data.payment.flat_id,
        payment_date: new Date(data.payment.payment_date),
        payment_type: data.payment.payment_type,
        payment_amount: data.payment.payment_amount,
        payment_category: data.payment.payment_category,
        reference_number: data.payment.reference_number || "",
        comments: data.payment.comments || "",
      });
    }
  }

  ngOnInit() {
    this.loadProperties()

    if (this.isEdit) {
      this.loadFlats(this.data.payment.property_id)
      this.loadFlatDetails(this.data.payment.flat_id)
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

  loadFlats(propertyId: number) {
    if (!propertyId) {
      this.flats = []
      return
    }

    this.loadingFlats = true
    // this.propertyService.getPropertyById(propertyId).subscribe({
    //   next: (property) => {
    //     if (property && property.flats) {
    //       this.flats = property.flats
    //     } else {
    //       this.flats = []
    //     }
    //     this.loadingFlats = false
    //   },
    //   error: (error) => {
    //     console.error("Error loading flats:", error)
    //     this.loadingFlats = false
    //     this.snackBar.open("Error loading flats", "Close", {
    //       duration: 3000,
    //       panelClass: ["error-snackbar"],
    //     })
    //   },
    // })
  }

  loadFlatDetails(flatId: number) {
    if (!flatId) {
      this.flatDetails = null
      return
    }

    this.paymentService.getPaymentSummaryByFlatId(flatId).subscribe({
      next: (data) => {
        this.flatDetails = data
      },
      error: (error) => {
        console.error("Error loading flat details:", error)
        this.snackBar.open("Error loading flat details", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
      },
    })
  }

  onPropertyChange() {
    const propertyId = this.paymentForm.get("property_id")?.value
    this.paymentForm.get("flat_id")?.setValue("")
    this.flatDetails = null
    this.loadFlats(propertyId)
  }

  onFlatChange() {
    const flatId = this.paymentForm.get("flat_id")?.value
    this.loadFlatDetails(flatId)
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open("File size should not exceed 5MB", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
        return
      }

      // Check file type (only images)
      if (!file.type.startsWith("image/")) {
        this.snackBar.open("Only image files are allowed", "Close", {
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
      const paymentData = {
        ...this.paymentForm.value,
        payment_date: this.formatDate(this.paymentForm.value.payment_date),
      }

      if (this.isEdit) {
        this.paymentService.updatePayment(this.data.payment.id, paymentData, this.selectedFile || undefined).subscribe({
          next: () => {
            this.isLoading = false
            this.snackBar.open("Payment updated successfully", "Close", {
              duration: 3000,
            })
            this.dialogRef.close(true)
          },
          error: (error) => {
            console.error("Error updating payment:", error)
            this.isLoading = false
            this.snackBar.open("Error updating payment", "Close", {
              duration: 3000,
              panelClass: ["error-snackbar"],
            })
          },
        })
      } else {
        this.paymentService.createPayment(paymentData, this.selectedFile || undefined).subscribe({
          next: () => {
            this.isLoading = false
            this.snackBar.open("Payment added successfully", "Close", {
              duration: 3000,
            })
            this.dialogRef.close(true)
          },
          error: (error) => {
            console.error("Error adding payment:", error)
            this.isLoading = false
            this.snackBar.open("Error adding payment", "Close", {
              duration: 3000,
              panelClass: ["error-snackbar"],
            })
          },
        })
      }
    }
  }

  onCancel() {
    this.dialogRef.close()
  }

  formatDate(date: Date): string {
    const d = new Date(date)
    let month = "" + (d.getMonth() + 1)
    let day = "" + d.getDate()
    const year = d.getFullYear()

    if (month.length < 2) month = "0" + month
    if (day.length < 2) day = "0" + day

    return [year, month, day].join("-")
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }
}
