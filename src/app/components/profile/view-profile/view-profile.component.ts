import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-profile',
  imports: [CommonModule],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.css',
})
export class ViewProfileComponent implements OnInit {
  user: any = null;
  memberSince: string = '';
  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) {}
  
  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      return;
    }
    this.profileService.getProfile(userId).subscribe((res) => {
      this.user = res;
      this.memberSince = this.formatMemberSince(res.createdAt);
      console.log('User profile loaded:', this.user);
    });
  }
  formatMemberSince(createdAt: string): string {
    if (!createdAt) return 'Unknown';

    const date = new Date(createdAt);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
    };

    return date.toLocaleDateString('en-US', options);
  }

  // Alternative format - you can choose which one you prefer
  formatMemberSinceDetailed(createdAt: string): string {
    if (!createdAt) return 'Unknown';

    const date = new Date(createdAt);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return date.toLocaleDateString('en-US', options);
  }
  // Helper method to generate random profile views for demo
  getRandomViews(): number {
    return Math.floor(Math.random() * 100) + 10;
  }
}