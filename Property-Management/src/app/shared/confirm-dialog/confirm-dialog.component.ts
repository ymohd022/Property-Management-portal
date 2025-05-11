import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA,  MatDialogRef } from "@angular/material/dialog"

export interface ConfirmDialogData {
  title: string
  message: string
  confirmText: string
  cancelText: string
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false)
  }

  onConfirm(): void {
    this.dialogRef.close(true)
  }
}