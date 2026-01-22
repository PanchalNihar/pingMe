import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private friendUrl = `${environment.apiUrl}/api/friends`;
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { token });
  }
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  savetoken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  saveUserId(userId: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userId', userId);
    }
  }

  getUserId(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('userId');
    }
    return null;
  }

  getAllUsers(excludeId: string) {
    return this.http.get(`${this.apiUrl}/users?exclude=${excludeId}`);
  }
  searchUser(email: string): Observable<any> {
    return this.http.get(`${this.friendUrl}/search?email=${email}`);
  }

  sendFriendRequest(fromUserId: string, toUserId: string): Observable<any> {
    return this.http.post(`${this.friendUrl}/request`, {
      fromUserId,
      toUserId,
    });
  }

  getFriendRequests(userId: string): Observable<any> {
    return this.http.get(`${this.friendUrl}/requests?userId=${userId}`);
  }

  respondToRequest(
    userId: string,
    requesterId: string,
    action: 'accept' | 'reject',
  ): Observable<any> {
    return this.http.post(`${this.friendUrl}/respond`, {
      userId,
      requesterId,
      action,
    });
  }

  getMyFriends(userId: string): Observable<any> {
    return this.http.get(`${this.friendUrl}/list?userId=${userId}`);
  }
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear(); // Fixed: This should be a method call, not a property
    }
  }
}
