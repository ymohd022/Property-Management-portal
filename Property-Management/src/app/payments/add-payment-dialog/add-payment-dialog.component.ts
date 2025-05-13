import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../services/payment.service';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-add-payment-dialog',
  standalone: false,
  templateUrl: './add-payment-dialog.component.html',
  styleUrl: './add-payment-dialog.component.css'
})
export class AddPaymentDialogComponent implements OnInit {
  paymentForm: FormGroup;
  properties: any[] = [];
  flats: any[] = [];
  flatDetails: any = null;
  isLoading = false;
  loadingProperties = false;
  loadingFlats = false;
  loadingFlatDetails = false;
  selectedFile: File | null = null;
  
  paymentTypes = ['Cash', 'UPI', 'Cheque', 'Bank Transfer', 'Other'];
  paymentCategories = [
    'Base Price',
    'Semi Finished',
    'Work Order Estimate',
    'RGST',
    'Registration GST',
    'Miscellaneous Charges',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private propertyService: PropertyService,
    public dialogRef: MatDialogRef<AddPaymentDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { propertyId?: number, flatId?: number }
  ) {
    this.paymentForm = this.fb.group({
      property_id: ['', Validators.required],
      flat_id: ['', Validators.required],
      payment_date: [new Date().toISOString().split('T')[0], Validators.required],
      payment_type: ['Cash', Validators.required],
      payment_category: ['Base Price', Validators.required],
      payment_amount: ['', [Validators.required, Validators.min(0)]],
      reference_number: [''],
      comments: ['']
    });
  }

  ngOnInit(): void {
    this.loadProperties();
    
    // Pre-select property if provided
    if (this.data?.propertyId) {
      this.paymentForm.get('property_id')?.setValue(this.data.propertyId);
      this.loadFlats(this.data.propertyId);
      
      // Pre-select flat if provided
      if (this.data?.flatId) {
        this.paymentForm.get('flat_id')?.setValue(this.data.flatId);
        this.loadFlatDetails(this.data.flatId);
      }
    }
  }

  loadProperties() {
    this.loadingProperties = true;
    this.propertyService.getAllProperties().subscribe({
      next: (data) => {
        this.properties = data;
        this.loadingProperties = false;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.snackBar.open('Failed to load properties', 'Close', { duration: 3000 });
        this.loadingProperties = false;
      }
    });
  }

  loadFlats(propertyId: number) {
    this.loadingFlats = true;
    this.propertyService.getFlatsByPropertyId(propertyId).subscribe({
      next: (data) => {
        this.flats = data;
        this.loadingFlats = false;
      },
      error: (error) => {
        console.error('Error loading flats:', error);
        this.snackBar.open('Failed to load flats', 'Close', { duration: 3000 });
        this.loadingFlats = false;
      }
    });
  }

  loadFlatDetails(flatId: number) {
    this.loadingFlatDetails = true;
    this.propertyService.getFlatDetails(flatId).subscribe({
      next: (data) => {
        this.flatDetails = data;
        this.loadingFlatDetails = false;
      },
      error: (error) => {
        console.error('Error loading flat details:', error);
        this.snackBar.open('Failed to load flat details', 'Close', { duration: 3000 });
        this.loadingFlatDetails = false;
      }
    });
  }

  onPropertyChange() {
    const propertyId = this.paymentForm.get('property_id')?.value;
    this.paymentForm.get('flat_id')?.setValue('');
    this.flatDetails = null;
    
    if (propertyId) {
      this.loadFlats(propertyId);
    } else {
      this.flats = [];
    }
  }

  onFlatChange() {
    const flatId = this.paymentForm.get('flat_id')?.value;
    if (flatId) {
      this.loadFlatDetails(flatId);
    } else {
      this.flatDetails = null;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      this.isLoading = true;
      
      const formData = new FormData();
      
      // Add form values to FormData
      Object.keys(this.paymentForm.value).forEach(key => {
        formData.append(key, this.paymentForm.value[key]);
      });
      
      // Add file if selected
      if (this.selectedFile) {
        formData.append('receipt_image', this.selectedFile, this.selectedFile.name);
      }
      
      this.paymentService.createPayment(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error adding payment:', error);
          this.isLoading = false;
          this.snackBar.open('Failed to add payment', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.paymentForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}