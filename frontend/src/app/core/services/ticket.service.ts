import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TicketStatus = 'OPEN' | 'AI_RESPONDED' | 'ESCALATED' | 'HUMAN_RESPONDED' | 'CLOSED';
export type SenderType = 'CUSTOMER' | 'ADMIN' | 'AI';

export interface TicketResponse {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  id: number;
  senderType: SenderType;
  content: string;
  createdAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
}

export interface SendMessageRequest {
  content: string;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly base = `${environment.apiUrl}/api/tickets`;

  constructor(private http: HttpClient) {}

  createTicket(payload: CreateTicketRequest): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(this.base, payload);
  }

  getMyTickets(): Observable<TicketResponse[]> {
    return this.http.get<TicketResponse[]>(`${this.base}/my`);
  }

  getAllTickets(): Observable<TicketResponse[]> {
    return this.http.get<TicketResponse[]>(this.base);
  }

  getTicket(id: number): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(`${this.base}/${id}`);
  }

  escalateTicket(id: number): Observable<TicketResponse> {
    return this.http.patch<TicketResponse>(`${this.base}/${id}/escalate`, {});
  }

  closeTicket(id: number): Observable<TicketResponse> {
    return this.http.patch<TicketResponse>(`${this.base}/${id}/close`, {});
  }

  reopenTicket(id: number): Observable<TicketResponse> {
    return this.http.patch<TicketResponse>(`${this.base}/${id}/reopen`, {});
  }

  getMessages(ticketId: number): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(`${this.base}/${ticketId}/messages`);
  }

  sendMessage(ticketId: number, payload: SendMessageRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/${ticketId}/messages`, payload);
  }
}
