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
  logout() {
    localStorage.removeItem('token');
  }
}
