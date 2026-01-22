import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
  ) {
    this.loginForm = this.fb.group({
      // Removed Validators.email because it might be a phone number now
      email: ['', Validators.required], 
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          this.authService.savetoken(res.token);
          this.authService.saveUserId(res.user.id);
          this.router.navigate(['/chat']);
        },
        error: (err) => {
          console.error('Login failed', err);
          
          // FIX: Handle Unverified Account specifically
          if (err.status === 401 && err.error?.message?.includes('verify')) {
            this.modalService.alert('Account not verified. Please check your email inbox.');
          } else {
            this.modalService.alert(
              err.error?.message || 'Login failed. Please check your credentials.',
            );
          }
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}