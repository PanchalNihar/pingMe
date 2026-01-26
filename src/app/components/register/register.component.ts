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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.maxLength(10),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          // FIX: Do not login immediately. Show verification message.
          this.modalService.alert(
            res.message ||
              'Registration successful! Please check your email to verify your account.',
          );
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.modalService.alert(err.error?.message || 'Registration failed');
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
