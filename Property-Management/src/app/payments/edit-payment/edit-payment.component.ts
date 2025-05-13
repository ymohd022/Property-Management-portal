import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../services/payment.service';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-edit-payment',
  standalone: false,
  templateUrl: './edit-payment.component.html',
  styleUrl: './edit-payment.component.css'
})
export class EditPaymentComponent implements OnInit {
  paymentForm: FormGroup;
  flatDetails: any = null;
  isLoading = false;
  loadingFlatDetails = false;
  selectedFile: File | null = null;
  existingImageUrl: string | null = null;
  
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
    public dialogRef: MatDialogRef<EditPaymentComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { payment: any }
  ) {
    this.paymentForm = this.fb.group({
      id: [this.data.payment.id],
      property_id: [{ value: this.data.payment.property_id, disabled: true }],
      flat_id: [{ value: this.data.payment.flat_id, disabled: true }],
      payment_date: [this.data.payment.payment_date, Validators.required],
      payment_type: [this.data.payment.payment_type, Validators.required],
      payment_category: [this.data.payment.payment_category, Validators.required],
      payment_amount: [this.data.payment.payment_amount, [Validators.required, Validators.min(0)]],
      reference_number: [this.data.payment.reference_number],
      comments: [this.data.payment.comments],
      keep_existing_image: [true]
    });
    
    this.existingImageUrl = this.data.payment.receipt_image_url || null;
  }

  ngOnInit(): void {
    this.loadFlatDetails(this.data.payment.flat_id);
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

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.paymentForm.get('keep_existing_image')?.setValue(false);
    }
  }

  removeExistingImage() {
    this.existingImageUrl = null;
    this.paymentForm.get('keep_existing_image')?.setValue(false);
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      this.isLoading = true;
      
      const formData = new FormData();
      
      // Add form values to FormData
      const formValue = { ...this.paymentForm.getRawValue() };
      Object.keys(formValue).forEach(key => {
        formData.append(key, formValue[key]);
      });
      
      // Add file if selected
      if (this.selectedFile) {
        formData.append('receipt_image', this.selectedFile, this.selectedFile.name);
      }
      
      this.paymentService.updatePayment(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error updating payment:', error);
          this.isLoading = false;
          this.snackBar.open('Failed to update payment', 'Close', { duration: 3000 });
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