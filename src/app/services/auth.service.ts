import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { from, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private auth = getAuth();
  private googleProvider = new GoogleAuthProvider();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }
  signInWithGoogle(): Observable<any> {
    return from(
      signInWithPopup(this.auth, this.googleProvider).then(async (result) => {
        const user = result.user;
        const idToken = await user.getIdToken();
        const response = await this.http
          .post(`${this.apiUrl}/google-login`, {
            idToken: idToken,
            email: user.email,
            name: user.displayName,
            photoUrl: user.photoURL,
          })
          .toPromise();
        return response;
      })
    );
  }
  signOutFromFirebase(): Observable<any> {
    return from(signOut(this.auth));
  }
  getCurrentUser(): Observable<User | null> {
    return new Observable((observer) => {
      onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
    });
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
    this.signOutFromFirebase().subscribe();
  }
}
