import { Component,  OnInit } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import  { Router } from "@angular/router"
import  { MatDialog } from "@angular/material/dialog"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { PaymentService } from "../../services/payment.service"
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component"
import { AddPaymentDialogComponent } from "../add-payment-dialog/add-payment-dialog.component"

@Component({
  selector: 'app-payments-list',
  standalone: false,
  templateUrl: './payments-list.component.html',
  styleUrl: './payments-list.component.css'
})
export class PaymentsListComponent implements OnInit {
  displayedColumns: string[] = [
    "property",
    "flat",
    "date",
    "type",
    "method",
    "amount",
    "client",
    "reference",
    "actions",
  ]
  dataSource = new MatTableDataSource<any>()
  isLoading = true
  selectedPropertyId: number | null = null
  properties: any[] = []

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadPayments()
  }

  loadPayments() {
    this.isLoading = true

    const request = this.selectedPropertyId
      ? this.paymentService.getPaymentsByPropertyId(this.selectedPropertyId)
      : this.paymentService.getAllPayments()

    request.subscribe({
      next: (data) => {
        this.dataSource.data = data
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading payments:", error)
        this.snackBar.open("Error loading payments", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        })
        this.isLoading = false
      },
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  onPropertyChange() {
    this.loadPayments()
  }

  viewPaymentDetails(paymentId: number) {
    this.router.navigate(["/payments", paymentId])
  }

  openAddPaymentDialog() {
    const dialogRef = this.dialog.open(AddPaymentDialogComponent, {
      width: "800px",
      data: { propertyId: this.selectedPropertyId },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPayments()
        this.snackBar.open("Payment added successfully", "Close", {
          duration: 3000,
        })
      }
    })
  }

  editPayment(payment: any) {
    const dialogRef = this.dialog.open(AddPaymentDialogComponent, {
      width: "800px",
      data: { payment, isEdit: true },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPayments()
        this.snackBar.open("Payment updated successfully", "Close", {
          duration: 3000,
        })
      }
    })
  }

  deletePayment(paymentId: number) {
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
        this.paymentService.deletePayment(paymentId).subscribe({
          next: () => {
            this.loadPayments()
            this.snackBar.open("Payment deleted successfully", "Close", {
              duration: 3000,
            })
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
      month: "short",
      day: "numeric",
    })
  }
}