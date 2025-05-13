import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class PropertyService {
  private apiUrl = "http://localhost:3000/api/properties"

  constructor(private http: HttpClient) {}

  getAllProperties(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getPropertyById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getFlatsByPropertyId(propertyId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${propertyId}/flats`);
  }

  getFlatDetails(flatId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/flats/${flatId}`);
  }

  createProperty(propertyData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, propertyData);
  }

  updateProperty(id: number | string, propertyData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, propertyData);
  }

  deleteProperty(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Added missing methods for property image management
  uploadPropertyImage(propertyId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${propertyId}/images`, formData);
  }

  deletePropertyImage(propertyId: number, imageId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${propertyId}/images/${imageId}`);
  }

  setPropertyImageAsPrimary(propertyId: number, imageId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${propertyId}/images/${imageId}/primary`, {});
  }
}