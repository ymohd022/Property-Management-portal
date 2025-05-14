import { Component,  OnInit } from "@angular/core"
import  { ActivatedRoute, Router } from "@angular/router"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { MatDialog } from "@angular/material/dialog"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { PaymentService } from "../../services/payment.service"
import  { PropertyService } from "../../services/property.service"
import  { AgentService } from "../../services/agent.service"
import { AddPaymentDialogComponent } from "../add-payment-dialog/add-payment-dialog.component"

@Component({
  selector: 'app-flat-details',
  standalone: false,
  templateUrl: './flat-details.component.html',
  styleUrl: './flat-details.component.css'
})
export class FlatDetailsComponent implements OnInit {
  flatId = 0
  propertyId = 0
  blockId: number | null = null
  flat: any = null
  flatDetails: any = null
  payments: any[] = []
  schedules: any[] = []
  agents: any[] = []
  isLoading = true
  loadingPayments = true
  loadingSchedules = true
  loadingAgents = true
  savingDetails = false
  detailsForm: FormGroup
  displayedColumns: string[] = ["date", "type", "method", "amount", "reference", "actions"]
  scheduleColumns: string[] = ["name", "amount", "dueDate", "status", "actions"]

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private propertyService: PropertyService,
    private agentService: AgentService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.detailsForm = this.fb.group({
      ownerType: ["Builder", Validators.required],
      ownerName: [""],
      bhkType: [""],
      uds: [""],
      parking: [""],
      area: [""],
      unitPrice: [""],
      semiFinishedPrice: [""],
      workOrderEstimate: [""],
      registrationGst: [""],
      miscellaneousAmount: [""],
      totalFlatAmount: [""],
      soldBy: [""],
    })
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.flatId = +params["id"]
      this.loadFlatDetails()
    })
  }

 loadFlatDetails() {
  this.isLoading = true;

  // Get flat basic details
  this.propertyService.getFlatDetails(this.flatId).subscribe({
    next: (data) => {
      this.flat = data;
      this.propertyId = data.property_id;
      this.blockId = data.block_id;

      // Load additional data
      this.loadFlatAdditionalDetails();
      this.loadPayments();
      this.loadPaymentSchedules();
      this.loadAgents();

      this.isLoading = false;
    },
    error: (error) => {
      console.error("Error loading flat details:", error);
      this.snackBar.open("Error loading flat details", "Close", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
      this.isLoading = false;
      this.router.navigate(["/properties"]);
    },
  });
}

  loadFlatAdditionalDetails() {
    this.paymentService.getFlatDetailByFlatId(this.flatId).subscribe({
      next: (data) => {
        this.flatDetails = data

        if (data) {
          this.detailsForm.patchValue({
            ownerType: data.owner_type,
            ownerName: data.owner_name,
            bhkType: data.bhk_type,
            uds: data.uds,
            parking: data.parking,
            area: data.area,
            unitPrice: data.unit_price,
            semiFinishedPrice: data.semi_finished_price,
            workOrderEstimate: data.work_order_estimate,
            registrationGst: data.registration_gst,
            miscellaneousAmount: data.miscellaneous_amount,
            totalFlatAmount: data.total_flat_amount,
            soldBy: data.sold_by,
          })
        }
      },
      error: (error) => {
        console.error("Error loading flat additional details:", error)
      },
    })
  }

  loadPayments() {
    this.loadingPayments = true
    this.paymentService.getPaymentsByFlatId(this.flatId).subscribe({
      next: (data) => {
        this.payments = data
        this.loadingPayments = false
      },
      error: (error) => {
        console.error("Error loading payments:", error)
        this.loadingPayments = false
      },
    })
  }

  loadPaymentSchedules() {
    this.loadingSchedules = true
    this.paymentService.getPaymentSchedulesByFlatId(this.flatId).subscribe({
      next: (data) => {
        this.schedules = data
        this.loadingSchedules = false
      },
      error: (error) => {
        console.error("Error loading payment schedules:", error)
        this.loadingSchedules = false
      },
    })
  }

  loadAgents() {
  this.loadingAgents = true;
  this.agentService.getAgents().subscribe({
    next: (data) => {
      this.agents = data;
      this.loadingAgents = false;
    },
    error: (error) => {
      console.error("Error loading agents:", error);
      this.loadingAgents = false;
    },
  });
}

  calculateTotalAmount() {
    const unitPrice = Number.parseFloat(this.detailsForm.get("unitPrice")?.value) || 0
    const area = Number.parseFloat(this.detailsForm.get("area")?.value) || 0
    const semiFinishedPrice = Number.parseFloat(this.detailsForm.get("semiFinishedPrice")?.value) || 0
    const workOrderEstimate = Number.parseFloat(this.detailsForm.get("workOrderEstimate")?.value) || 0
    const registrationGst = Number.parseFloat(this.detailsForm.get("registrationGst")?.value) || 0
    const miscellaneousAmount = Number.parseFloat(this.detailsForm.get("miscellaneousAmount")?.value) || 0

    const baseAmount = unitPrice * area
    const totalAmount = baseAmount + semiFinishedPrice + workOrderEstimate + registrationGst + miscellaneousAmount

    this.detailsForm.get("totalFlatAmount")?.setValue(totalAmount)
  }

  saveDetails() {
    if (this.detailsForm.valid) {
      this.savingDetails = true

      this.paymentService.createOrUpdateFlatDetail(this.flatId, this.detailsForm.value).subscribe({
        next: () => {
          this.savingDetails = false
          this.snackBar.open("Flat details saved successfully", "Close", {
            duration: 3000,
          })
          this.loadFlatAdditionalDetails()
        },
        error: (error) => {
          console.error("Error saving flat details:", error)
          this.savingDetails = false
          this.snackBar.open("Error saving flat details", "Close", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          })
        },
      })
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.detailsForm.controls).forEach((key) => {
        this.detailsForm.get(key)?.markAsTouched()
      })
    }
  }

  addPayment() {
    const dialogRef = this.dialog.open(AddPaymentDialogComponent, {
      width: "800px",
      data: {
        propertyId: this.propertyId,
        blockId: this.blockId,
        flatId: this.flatId,
      },
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

  viewPaymentDetails(paymentId: number) {
    this.router.navigate(["/payments", paymentId])
  }

  deletePayment(paymentId: number) {
    // Implementation similar to other delete methods
  }

  goBack() {
    this.router.navigate(["/properties"])
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
