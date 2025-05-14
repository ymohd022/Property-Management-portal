import { Component,  OnInit } from "@angular/core"
import  { ActivatedRoute, Router } from "@angular/router"
import  { MatDialog } from "@angular/material/dialog"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { PaymentService } from "../../services/payment.service"
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component"
import { AddPaymentDialogComponent } from "../add-payment-dialog/add-payment-dialog.component"

@Component({
  selector: 'app-payment-details',
  standalone: false,
  templateUrl: './payment-details.component.html',
  styleUrl: './payment-details.component.css'
})
export class PaymentDetailsComponent implements OnInit {
  payment: any = null
  isLoading = true
  paymentId = 0

  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.paymentId = +params["id"]
      this.loadPaymentDetails()
    })
  }

  loadPaymentDetails() {
    this.isLoading = true
    this.paymentService.getPaymentById(this.paymentId).subscribe({
      next: (data) => {
        this.payment = data
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading payment details:", error)
        this.snackBar.open("Error loading payment details", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
        this.isLoading = false
        this.router.navigate(["/payments"])
      },
    })
  }

  editPayment() {
    const dialogRef = this.dialog.open(AddPaymentDialogComponent, {
      width: "800px",
      data: { payment: this.payment, isEdit: true },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPaymentDetails()
        this.snackBar.open("Payment updated successfully", "Close", {
          duration: 3000,
        })
      }
    })
  }

  deletePayment() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Delete Payment",
        message: "Are you sure you want to delete this payment? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.paymentService.deletePayment(this.paymentId).subscribe({
          next: () => {
            this.snackBar.open("Payment deleted successfully", "Close", {
              duration: 3000,
            })
            this.router.navigate(["/payments"])
          },
          error: (error) => {
            console.error("Error deleting payment:", error)
            this.snackBar.open("Error deleting payment", "Close", {
              duration: 3000,
              panelClass: ["error-snackbar"],
            })
          },
        })
      }
    })
  }

  goBack() {
    this.router.navigate(["/payments"])
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
}