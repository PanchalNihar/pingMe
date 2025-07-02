import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: any = {
    name: '',
    email: '',
    avatar: '',
    createdAt: null,
  };
  selectedFile: File | null = null;
  memberSince: string = '';
  onlineUsers: Set<string> = new Set();
  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private socketService: SocketService
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
    this.socketService.onOnlineUsers().subscribe((onlineUsers: string[]) => {
      this.onlineUsers = new Set(onlineUsers);
      console.log('Online users:', this.onlineUsers);
    });
  }
 isUserOnline(): boolean {
  const userId = this.authService.getUserId();
  return userId ? this.onlineUsers.has(userId) : false;
}

  // Format the createdAt date to a readable format
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

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  updateProfile() {
    const formData = new FormData();
    formData.append('name', this.user.name);
    formData.append('email', this.user.email);
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.profileService.updateProfile(formData).subscribe(
      (res) => {
        this.user = res;
        console.log('Updated user info:', this.user);
        alert('Profile updated successfully');
      },
      (error) => {
        console.error('Profile update failed:', error);
        alert(
          'Failed to update profile: ' +
            (error.error?.message || 'Unknown error')
        );
      }
    );
  }
}
