import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  };
  selectedFile: File | null = null;
  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      return;
    }
    this.profileService.getProfile(userId).subscribe((res) => {
      this.user = res;
    });
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
        alert('Failed to update profile: ' + (error.error?.message || 'Unknown error'));
      }
    );
  }
}
