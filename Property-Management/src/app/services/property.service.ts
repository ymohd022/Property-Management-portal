import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class PropertyService {
  private apiUrl = "http://localhost:3000/api/properties"

  constructor(private http: HttpClient) {}

  getAllProperties(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl)
  }

  getPropertyById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
  }

  createProperty(propertyData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, propertyData)
  }

  updateProperty(id: number, propertyData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, propertyData)
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
  }

  // Image upload
  uploadPropertyImage(propertyId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${propertyId}/images`, formData)
  }

  // For blocks
  getPropertyBlocks(propertyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${propertyId}/blocks`)
  }

  // For flats
  getPropertyFlats(propertyId: number, blockId?: number): Observable<any[]> {
    let url = `${this.apiUrl}/${propertyId}/flats`
    if (blockId) {
      url += `?blockId=${blockId}`
    }
    return this.http.get<any[]>(url)
  }
}
