import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  loading: boolean = true;
  currentUserId: string | null = null;
  isOwnProfile: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (userId) {
      this.isOwnProfile = userId === this.currentUserId;
      this.profileService.getProfile(userId).subscribe({
        next: (res) => {
          this.user = res;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.loading = false;
        }
      });
    }
  }

  // Navigate to chat with this user
  startChat(): void {
    if (this.user) {
      this.router.navigate(['/chat', this.user._id]);
    }
  }

  // Navigate back to users list
  goBack(): void {
    this.router.navigate(['/users']);
  }

  // Edit profile (if own profile)
  editProfile(): void {
    if (this.isOwnProfile) {
      // Navigate to edit profile page or open edit modal
      console.log('Edit profile functionality');
    }
  }

  // Generate consistent gradient for user avatar placeholder
  getAvatarGradient(name: string): string {
    if (!name) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
    ];

    const gradientIndex = Math.abs(hash) % gradients.length;
    return gradients[gradientIndex];
  }

  // Format join date or any other date
  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}