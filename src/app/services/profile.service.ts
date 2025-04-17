import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  constructor(private http: HttpClient) {}
  getProfile(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile?id=${userId}`);
  }

updateProfile(data: FormData): Observable<any> {
  const token = localStorage.getItem('token');
  return this.http.put(`${this.apiUrl}/profile`, data, {
    headers: {
      Authorization: `Bearer ${token || ''}`,
    }
  });
}
}
