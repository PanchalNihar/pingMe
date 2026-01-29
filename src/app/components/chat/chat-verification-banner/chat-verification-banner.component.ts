import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-verification-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-verification-banner.component.html',
  styleUrls: ['./chat-verification-banner.component.css']
})
export class ChatVerificationBannerComponent {
  @Input() isEmailVerified: boolean | null = null;
}
