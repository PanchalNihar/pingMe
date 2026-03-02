import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.css']
})
export class ChatHeaderComponent {
  @Input() currentReceiver: any | null = null;
  @Input() currentGroup: any | null = null;
  @Input() selectedLanguage: string | null = null;
  @Input() supportedLanguages: string[] = [];
  @Input() autoTranslate: boolean = false;
  @Input() onlineUsers: Set<string> = new Set();

  @Output() openProfile = new EventEmitter<string>();
  @Output() toggleAutoTranslate = new EventEmitter<void>();
  @Output() generateSummary = new EventEmitter<void>();
  @Output() openGroupInfo = new EventEmitter<void>();
  @Output() selectedLanguageChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  showMobileMenu = false;

  onBack() {
    this.back.emit();
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }
}
