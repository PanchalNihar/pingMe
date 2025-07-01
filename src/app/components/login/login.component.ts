import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', Validators.required],
    });
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.authService.savetoken(res.token);
          this.authService.saveUserId(res.user.id);
          this.router.navigate(['/chat']);
        },
        error: (err) => {
          alert(err.error.message);
        },
      });
    }
  }
  onGoogleSignIn() {
    this.isLoading = true;
    this.authService.signInWithGoogle().subscribe({
      next: (res: any) => {
        this.authService.savetoken(res.token);
        this.authService.saveUserId(res.user.id);
        this.router.navigate(['/chat']);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Google sign-in error:', err);
        alert('Google sign-in failed. Please try again.');
        this.isLoading = false;
      },
    });
  }
}
