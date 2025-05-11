import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  private apiUrl = "http://localhost:3000/api/payments"

  constructor(private http: HttpClient) {}

  getAllPayments(): Observable<any> {
    return this.http.get(this.apiUrl)
  }

  getPaymentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`)
  }

  getPaymentsByFlatId(flatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/flat/${flatId}`)
  }

  getPaymentsByPropertyId(propertyId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/property/${propertyId}`)
  }

  getPaymentSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`)
  }

  getPaymentSummaryByPropertyId(propertyId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/property/${propertyId}/summary`)
  }

  getPaymentSummaryByFlatId(flatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/flat/${flatId}/summary`)
  }

  getFlatPricing(flatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/flat/${flatId}/pricing`)
  }

  createPayment(paymentData: any, receiptFile?: File): Observable<any> {
    const formData = new FormData()

    // Append payment data
    Object.keys(paymentData).forEach((key) => {
      formData.append(key, paymentData[key])
    })

    // Append receipt file if provided
    if (receiptFile) {
      formData.append("receipt", receiptFile)
    }

    return this.http.post(this.apiUrl, formData)
  }

  updatePayment(id: number, paymentData: any, receiptFile?: File): Observable<any> {
    const formData = new FormData()

    // Append payment data
    Object.keys(paymentData).forEach((key) => {
      formData.append(key, paymentData[key])
    })

    // Append receipt file if provided
    if (receiptFile) {
      formData.append("receipt", receiptFile)
    }

    return this.http.put(`${this.apiUrl}/${id}`, formData)
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  createOrUpdateFlatPricing(flatId: number, pricingData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/flat/${flatId}/pricing`, pricingData)
  }
}
