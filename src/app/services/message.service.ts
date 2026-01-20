import { HttpClient } from '@angular/common/http';
import { Injectable, numberAttribute } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../components/chat/chat-room/chat-room.component';
import { count } from 'node:console';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/chat`;
  constructor(private http: HttpClient) {}
  getMessages(
    user1: string | null = null,
    user2: string | null = null,
    roomId: string | null = null,
  ): Observable<Message[]> {
    if (roomId) {
      return this.http.get<Message[]>(`${this.apiUrl}/messages?roomId=${roomId}`);
    }
    if (user1 && user2) {
      return this.http.get<Message[]>(
        `${this.apiUrl}/messages?user1=${user1}&user2=${user2}`,
      );
    }
    return new Observable((observer) => {
      observer.next([]);
      observer.complete();
    });
  }
  markMessagesAsRead(sender: string, receiver: string) {
    return this.http.post(`${this.apiUrl}/mark-read`, { sender, receiver });
  }
  // getUnreadCounts(userId: string) {
  //   return this.http.get<{ _id: string; count: number }[]>(
  //     `${this.apiUrl}/unread-count?userId=${userId}`,
  //   );
  // }
  createGroup(
    name: string,
    participants: string[],
    adminId: string,
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups`, {
      name,
      participants,
      adminId,
    });
  }
  getGroups(userId: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/groups?userId=${userId}`);
  }
}
