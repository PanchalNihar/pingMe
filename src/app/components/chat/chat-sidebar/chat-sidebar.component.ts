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

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() openChat = new EventEmitter<{ entity: any; isGroup: boolean }>();
  @Output() openGroup = new EventEmitter<void>();
  @Output() openAddFriend = new EventEmitter<void>();

  selectUser(u: any) { this.openChat.emit({ entity: u, isGroup: false }); }
  selectGroup(g: any) { this.openChat.emit({ entity: g, isGroup: true }); }
  openGroupModalEmit() { this.openGroup.emit(); }
  openAddFriendEmit() { this.openAddFriend.emit(); }
}
