import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  private apiUrl = "http://localhost:3000/api/payments";

  constructor(private http: HttpClient) {}

  getPayments(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.propertyId) {
        params = params.set('propertyId', filters.propertyId);
      }
      if (filters.flatId) {
        params = params.set('flatId', filters.flatId);
      }
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate);
      }
      if (filters.paymentType) {
        params = params.set('paymentType', filters.paymentType);
      }
      if (filters.paymentCategory) {
        params = params.set('paymentCategory', filters.paymentCategory);
      }
    }
    
    return this.http.get<any[]>(`${this.apiUrl}`, { params });
  }

  getPaymentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createPayment(paymentData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, paymentData);
  }

  updatePayment(paymentData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${paymentData.get('id')}`, paymentData);
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getPaymentSummary(filters?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.propertyId) {
        params = params.set('propertyId', filters.propertyId);
      }
      if (filters.flatId) {
        params = params.set('flatId', filters.flatId);
      }
    }
    
    return this.http.get<any>(`${this.apiUrl}/summary`, { params });
  }

  getPaymentsByFlatId(flatId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/flat/${flatId}`);
  }

  getPaymentsByPropertyId(propertyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/property/${propertyId}`);
  }
}