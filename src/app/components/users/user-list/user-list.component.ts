import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'], // ✅ corrected `styleUrl` to `styleUrls`
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  userId: string | null = null;
  searchTerm: string = '';

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
      this.filteredUsers = [...this.users];

      this.users.forEach((user) => {
        this.profileService.getProfile(user._id).subscribe((profile) => {
          const userIndex = this.users.findIndex((u) => u._id === profile._id);
          if (userIndex !== -1) {
            this.users[userIndex] = {
              ...this.users[userIndex],
              avatar: profile.avatar,
              email: profile.email,
            };
            const filteredIndex = this.filteredUsers.findIndex((u) => u._id === profile._id);
            if (filteredIndex !== -1) {
              this.filteredUsers[filteredIndex] = {
                ...this.filteredUsers[filteredIndex],
                avatar: profile.avatar,
                email: profile.email,
              };
            }
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
    console.log("Navigating to chat with ID:", id);
    this.router.navigate(['/chat', id]);
  }

  filterUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }
  }

  getAvatarGradient(name: string): string {
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

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash) % 360;
    return `hsl(${color}, 70%, 60%)`;
  }
}
