import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Add CommonModule for *ngIf and ngClass
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{

  isOpen = false; // Track mobile sidebar state
  user:any={
    name: '',
  }
  constructor(
    private profileService :ProfileService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {  
      return;
    }
    this.profileService.getProfile(userId).subscribe((res) => {
      this.user = res;
      
      console.log('User profile loaded:', this.user);
    });
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Toggle sidebar visibility
  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  // Close sidebar when a link is clicked (UX improvement for mobile)
  closeSidebar() {
    this.isOpen = false;
  }
}