import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message = 'Verifying your email...';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status = 'error';
      this.message = 'Invalid verification link.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res: any) => {
        this.status = 'success';
        this.message = res.message || 'Email verified successfully!';
        
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.status = 'error';
        this.message = err.error.message || 'Verification failed or link expired.';
      }
    });
  }
}