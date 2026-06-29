import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.css']
})
export class ChatSidebarComponent {

  @Input() users: any[] = [];
  @Input() groups: any[] = [];
  @Input() onlineUsers: Set<string> = new Set();
  @Input() selectedGroupId: string | null = null;
  @Input() receiverId: string | null = null;
  @Input() unreadMap: Map<string, number> = new Map();
  @Input() filtertedUser: any[] = [];
  @Input() searchTerm: string = '';

  // Number of pending requests (Friend requests + future group invites)
  @Input() pendingRequestsCount = 0;

  @Output() searchTermChange = new EventEmitter<string>();

  @Output() openChat = new EventEmitter<{
    entity: any;
    isGroup: boolean;
  }>();

  @Output() openGroup = new EventEmitter<void>();

  @Output() openAddFriend = new EventEmitter<void>();

  // NEW
  @Output() openRequests = new EventEmitter<void>();


  selectUser(user: any): void {
    this.openChat.emit({
      entity: user,
      isGroup: false
    });
  }

  selectGroup(group: any): void {
    this.openChat.emit({
      entity: group,
      isGroup: true
    });
  }

  openGroupModalEmit(): void {
    this.openGroup.emit();
  }

  openAddFriendEmit(): void {
    this.openAddFriend.emit();
  }

  // NEW
  openRequestsEmit(): void {
    this.openRequests.emit();
  }
}