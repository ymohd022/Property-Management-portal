import { Component,  OnInit, Inject } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA,  MatDialogRef } from "@angular/material/dialog"
@Component({
  selector: 'app-add-user-dialog',
  standalone: false,
  templateUrl: './add-user-dialog.component.html',
  styleUrl: './add-user-dialog.component.css'
})
export class AddUserDialogComponent implements OnInit {
  userForm: FormGroup
  roles = [
    { value: "admin", viewValue: "Admin" },
    { value: "agent", viewValue: "Agent" },
    { value: "manager", viewValue: "Manager" },
  ]
  hidePassword = true
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userForm = this.fb.group({
      name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      role: ["agent", [Validators.required]],
      status: ["Active", [Validators.required]],
    })

    if (data && data.user) {
      this.isEditMode = data.isEdit || false
      this.userForm.patchValue({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
      })

      if (this.isEditMode) {
        // Make password optional in edit mode
        this.userForm.get("password")?.clearValidators()
        this.userForm.get("password")?.updateValueAndValidity()
      }
    }
  }

  ngOnInit() {}

  onSubmit() {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value)
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}