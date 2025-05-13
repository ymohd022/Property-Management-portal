import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../services/payment.service';
import { PropertyService } from '../../services/property.service';
import { AddPaymentDialogComponent } from '../add-payment-dialog/add-payment-dialog.component';
import { EditPaymentComponent } from '../edit-payment/edit-payment.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-payments-list',
  standalone: false,
  templateUrl: './payments-list.component.html',
  styleUrl: './payments-list.component.css'
})
export class PaymentsListComponent implements OnInit {
  displayedColumns: string[] = [
    'property', 'flat', 'flatOwner', 'paymentDate', 
    'paymentType', 'paymentCategory', 'amount', 'reference', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = true;
  properties: any[] = [];
  selectedProperty: number | null = null;
  flats: any[] = [];
  selectedFlat: number | null = null;
  summaryData: any = {
    totalPaid: 0,
    totalOutstanding: 0,
    totalFlats: 0
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private paymentService: PaymentService,
    private propertyService: PropertyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.loadPayments();
    this.loadSummary();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProperties() {
    this.propertyService.getAllProperties().subscribe({
      next: (data) => {
        this.properties = data;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.snackBar.open('Failed to load properties', 'Close', { duration: 3000 });
      }
    });
  }

  loadFlats(propertyId: number) {
    this.propertyService.getFlatsByPropertyId(propertyId).subscribe({
      next: (data) => {
        this.flats = data;
      },
      error: (error) => {
        console.error('Error loading flats:', error);
        this.snackBar.open('Failed to load flats', 'Close', { duration: 3000 });
      }
    });
  }

  loadPayments() {
    this.isLoading = true;
    const filters = {
      propertyId: this.selectedProperty,
      flatId: this.selectedFlat
    };
    
    this.paymentService.getPayments(filters).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.snackBar.open('Failed to load payments', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadSummary() {
    const filters = {
      propertyId: this.selectedProperty,
      flatId: this.selectedFlat
    };
    
    this.paymentService.getPaymentSummary(filters).subscribe({
      next: (data) => {
        this.summaryData = {
          totalPaid: data.totalPaid || 0,
          totalOutstanding: data.totalOutstanding || 0,
          totalFlats: data.totalFlats || 0
        };
      },
      error: (error) => {
        console.error('Error loading payment summary:', error);
      }
    });
  }

  onPropertyChange() {
    if (this.selectedProperty) {
      this.loadFlats(this.selectedProperty);
      this.selectedFlat = null;
    } else {
      this.flats = [];
    }
    this.loadPayments();
    this.loadSummary();
  }

  onFlatChange() {
    this.loadPayments();
    this.loadSummary();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addPayment() {
    const dialogRef = this.dialog.open(AddPaymentDialogComponent, {
      width: '800px',
      data: {
        propertyId: this.selectedProperty,
        flatId: this.selectedFlat
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPayments();
        this.loadSummary();
        this.snackBar.open('Payment added successfully', 'Close', { duration: 3000 });
      }
    });
  }

  editPayment(payment: any) {
    const dialogRef = this.dialog.open(EditPaymentComponent, {
      width: '800px',
      data: { payment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPayments();
        this.loadSummary();
        this.snackBar.open('Payment updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deletePayment(payment: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Payment',
        message: 'Are you sure you want to delete this payment? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.paymentService.deletePayment(payment.id).subscribe({
          next: () => {
            this.loadPayments();
            this.loadSummary();
            this.snackBar.open('Payment deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error deleting payment:', error);
            this.snackBar.open('Failed to delete payment', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  viewPaymentDetails(payment: any) {
    // Navigate to payment details page or open a dialog
    console.log('View payment details:', payment);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  clearFilters() {
    this.selectedProperty = null;
    this.selectedFlat = null;
    this.flats = [];
    this.loadPayments();
    this.loadSummary();
  }
}