import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class AgentService {
  private apiUrl = "http://localhost:3000/api"

  constructor(private http: HttpClient) {}

  // Admin-side methods
  getAgents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/agents`)
  }

  getAgentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/agents/${id}`)
  }

  addAgent(agent: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/agents`, agent)
  }

  updateAgent(id: number, agent: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/agents/${id}`, agent)
  }

  updateAgentStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/agents/${id}/status`, { status })
  }

  assignAgent(assignmentData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/agent-assignments`, assignmentData)
  }

  // Agent-side methods
  getAgentDashboardData(agentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/agents/${agentId}/dashboard`)
  }

  getAssignedProperties(agentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/agent-assignments/agent/${agentId}`)
  }

  getAgentLeads(agentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/agents/${agentId}/leads`)
  }

  addLead(leadData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/leads`, leadData)
  }

  updateLeadStatus(leadId: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/leads/${leadId}/status`, { status })
  }

  // Shared methods
  getProperties(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/properties`)
  }

  getFlatsForProperty(propertyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/properties/${propertyId}/flats`)
  }
}
