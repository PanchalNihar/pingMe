import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  constructor(private http: HttpClient) {}
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }
  savetoken(token: string) {
    localStorage.setItem('token', token);
  }
  getToken() {
    return localStorage.getItem('token');
  }
  saveUserId(userId: string) {
    localStorage.setItem('userId', userId);
  }
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }
  getAllUsers(excludeId:string){
    return this.http.get(`${this.apiUrl}/users?exclude=${excludeId}`);
  }
  logout() {
    localStorage.clear;
  }
}
