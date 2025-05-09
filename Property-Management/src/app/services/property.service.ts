import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class PropertyService {
  private apiUrl = "http://localhost:3000/api/properties"

  constructor(private http: HttpClient) {}

  getAllProperties(): Observable<any> {
    return this.http.get(this.apiUrl)
  }

  getPropertyById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`)
  }

  createProperty(propertyData: any): Observable<any> {
    return this.http.post(this.apiUrl, propertyData)
  }

  updateProperty(id: string, propertyData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, propertyData)
  }

  deleteProperty(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  uploadPropertyImage(propertyId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${propertyId}/images`, formData)
  }

  setPropertyImageAsPrimary(propertyId: number, imageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${propertyId}/images/${imageId}/primary`, {})
  }

  deletePropertyImage(propertyId: number, imageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${propertyId}/images/${imageId}`)
  }
}
