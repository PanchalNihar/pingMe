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
import { ModalService } from '../../services/modal.service';
import {
  GoogleSigninButtonModule,
  SocialAuthService,
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    GoogleSigninButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private socialAuthService: SocialAuthService,
  ) {
    this.loginForm = this.fb.group({
      // Removed Validators.email because it might be a phone number now
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken) {
        this.handleGoogleLogin(user.idToken);
      }
    });
  }
  handleGoogleLogin(token: string) {
    this.authService.googleLogin(token).subscribe({
      next: (res: any) => {
        this.authService.savetoken(res.token);
        this.authService.saveUserId(res.user.id);
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.modalService.alert('Google Sign-In failed');
      },
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
            this.modalService
              .confirm(
                'Account Unverified',
                'Your email is not verified. Do you want to resend the verification link?',
                'Resend Email',
                'Cancel',
              )
              .subscribe((confirm) => {
                if (confirm) {
                  this.authService
                    .resendVerification(this.loginForm.get('email')?.value)
                    .subscribe(() =>
                      this.modalService.alert(
                        'Email sent! Check your inbox.',
                      ),
                    );
                }
              });
          } else {
            this.modalService.alert(
              err.error?.message ||
                'Login failed. Please check your credentials.',
            );
          }
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
