import { HttpClient } from '@angular/common/http';
import { Injectable, numberAttribute } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../components/chat/chat-room/chat-room.component';
import { count } from 'node:console';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = 'http://localhost:5000/chat';
  constructor(private http: HttpClient) {}
  getMessages(user1: string, user2: string): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/messages?user1=${user1}&user2=${user2}`
    );
  }
  markMessagesAsRead(sender: string, receiver: string) {
    return this.http.post(`${this.apiUrl}/mark-read`, { sender, receiver });
  }
  getUnreadCounts(userId: string) {
    return this.http.get<{ _id: string; count: number }[]>(
      `${this.apiUrl}/unread-count?userId=${userId}`
    );
  }
}
