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
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
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
  
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear(); // Fixed: This should be a method call, not a property
    }
  }
}