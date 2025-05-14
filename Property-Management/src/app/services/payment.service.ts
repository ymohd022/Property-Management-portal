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

  getPaymentsByPropertyId(propertyId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/property/${propertyId}`)
  }

  getPaymentsByFlatId(flatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/flat/${flatId}`)
  }

  getPaymentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`)
  }

  createPayment(paymentData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, paymentData)
  }

  updatePayment(id: number, paymentData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, paymentData)
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  // Flat details methods
  getFlatDetailByFlatId(flatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/flat-details/${flatId}`)
  }

  createOrUpdateFlatDetail(flatId: number, detailData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/flat-details/${flatId}`, detailData)
  }

  // Payment schedule methods
  getPaymentSchedulesByFlatId(flatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/schedules/flat/${flatId}`)
  }

  createPaymentSchedule(scheduleData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedules`, scheduleData)
  }

  updatePaymentSchedule(id: number, scheduleData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/schedules/${id}`, scheduleData)
  }

  deletePaymentSchedule(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/schedules/${id}`)
  }
}
