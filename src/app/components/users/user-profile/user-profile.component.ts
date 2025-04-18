import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
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
  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}
  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.profileService.getProfile(userId).subscribe((res) => {
        this.user = res;
        this.loading = false;
      });
    }
  }
}
