import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  userId: string | null = null;

  constructor(
    private authService: AuthService, 
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      return;
    }

    this.authService.getAllUsers(this.userId).subscribe((res: any) => {
      this.users = res;

      // Fetch profile information for each user
      this.users.forEach((user) => {
        this.profileService.getProfile(user._id).subscribe((profile) => {
          // Find and update the user with their profile information
          const userIndex = this.users.findIndex((u) => u._id === profile._id);
          if (userIndex !== -1) {
            this.users[userIndex] = {
              ...this.users[userIndex],
              avatar: profile.avatar,
              email: profile.email,
            };
          }
        });
      });
    });
  }

  viewProfile(event: MouseEvent, id: string) {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['/users', id]);
  }
  viewChat(id: string) {
    console.log("ID:",id)
    this.router.navigate(['/chat', id]);
  }
  // Generate consistent color for user avatar placeholder
  getAvatarColor(name: string): string {
    // Simple hash function to get a consistent color for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color
    const color = Math.abs(hash) % 360;
    return `hsl(${color}, 70%, 60%)`;
  }
}
