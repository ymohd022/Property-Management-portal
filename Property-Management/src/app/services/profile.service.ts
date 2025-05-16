import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private apiUrl = "http://localhost:3000/api/profile"

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl)
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, profileData)
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, passwordData)
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData()
    formData.append("profilePicture", file)
    return this.http.post<any>(`${this.apiUrl}/upload-picture`, formData)
  }
}
