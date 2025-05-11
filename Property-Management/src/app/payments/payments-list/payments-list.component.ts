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
  displayedColumns: string[] = ["property", "flat", "date", "type", "category", "amount", "reference", "actions"]
  dataSource = new MatTableDataSource<any>()
  isLoading = true
  summaryData: any[] = []
  totalPaid = 0
  totalOutstanding = 0

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadPayments()
    this.loadSummary()
  }

  loadPayments() {
    this.isLoading = true
    this.paymentService.getAllPayments().subscribe({
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

  loadSummary() {
    this.paymentService.getPaymentSummary().subscribe({
      next: (data) => {
        this.summaryData = data
        this.calculateTotals()
      },
      error: (error) => {
        console.error("Error loading payment summary:", error)
      },
    })
  }

  calculateTotals() {
    this.totalPaid = this.summaryData.reduce((sum, item) => sum + Number.parseFloat(item.total_paid_amount || 0), 0)
    this.totalOutstanding = this.summaryData.reduce((sum, item) => sum + Number.parseFloat(item.balance_amount || 0), 0)
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  viewPaymentDetails(payment: any) {
    this.router.navigate(["/payments", payment.id])
  }

  openAddPaymentDialog() {
    const dialogRef = this.dialog.open(AddPaymentDialogComponent, {
      width: "800px",
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPayments()
        this.loadSummary()
      }
    })
  }

  editPayment(payment: any) {
    const dialogRef = this.dialog.open(AddPaymentDialogComponent, {
      width: "800px",
      data: { payment },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPayments()
        this.loadSummary()
      }
    })
  }

  deletePayment(payment: any) {
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
        this.paymentService.deletePayment(payment.id).subscribe({
          next: () => {
            this.snackBar.open("Payment deleted successfully", "Close", {
              duration: 3000,
            })
            this.loadPayments()
            this.loadSummary()
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

  viewPropertyPayments(propertyId: number) {
    this.router.navigate(["/payments/property", propertyId])
  }

  viewFlatPayments(flatId: number) {
    this.router.navigate(["/payments/flat", flatId])
  }
}
