import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocketService } from '../../../services/socket.service';
import { AuthService } from '../../../services/auth.service';
import { SocketModule } from '../../../shared/socket.module';
import { MessageService } from '../../../services/message.service';
import { Router } from '@angular/router';

export interface Message {
  sender: string;
  receiver: string;
  content: string;
  isRead:boolean;
  timestamp?: Date;
  id?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-chat-room',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.css',
})
export class ChatRoomComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private sentMessageIds = new Set<string>();
  message = '';
  messages: Message[] = [];
  users: User[] = [];
  userId: string | null = null;
  receiverId: string | null = null;
  isTyping = false;
  lastMessageTimestamp = 0; // Track the last message time

  constructor(
    private socketService: SocketService,
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      return;
    }

    // Listen for incoming messages from socket
    this.socketService.onMessage().subscribe((msg: Message) => {
      console.log('Received message:', msg);

      const isDuplicate = this.messages.some(
        (m) =>
          (m.id && m.id === msg.id) ||
          (m.sender === msg.sender &&
            m.content === msg.content &&
            m.receiver === msg.receiver)
      );
      // Add timestamp to messages if not exists
      if (!isDuplicate) {
        // Add timestamp if not present
        if (!msg.timestamp) {
          msg.timestamp = new Date();
        }

        // Add to messages array
        this.messages.push(msg);
        this.scrollToBottom();
      }
    });

    this.authService.getAllUsers(this.userId).subscribe((res: any) => {
      this.users = res;
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  send() {
    if (this.message.trim()) {
      if (!this.userId || !this.receiverId) {
        alert('Sender or receiver is missing!');
        return;
      }

      // Create a unique ID for this message
      const messageId = `${this.userId}-${Date.now()}`;

      // Create message object
      const newMessage = {
        id: messageId,
        sender: this.userId,
        receiver: this.receiverId,
        content: this.message,
        timestamp: new Date(),
      };

      console.log('Sending message:', newMessage);

      // Track this message as sent by the client
      this.sentMessageIds.add(messageId);

      // Send via socket service
      this.socketService.sendMessage(newMessage);

      // Clear input
      this.message = '';
    }
  }

  startChat(receiverId: string) {
    if (!this.userId) {
      console.warn('User ID is null. Cannot start chat.');
      return;
    }

    this.receiverId = receiverId;
    const roomId = [this.userId, this.receiverId].sort().join('-');
    console.log('Joining room:', roomId);
    this.socketService.joinRoom(roomId);

    // Clear old messages
    this.messages = [];

    // Fetch message history
    this.messageService
      .getMessages(this.userId, this.receiverId)
      .subscribe((messages) => {
        this.messages = messages;
        this.scrollToBottom();
      });

    this.messageService
      .markMessagesAsRead(this.receiverId!, this.userId!)
      .subscribe();
  }

  getUserName(userId: string): string {
    const user = this.users.find((u) => u._id === userId);
    return user ? user.name : 'Unknown User';
  }

  getUserInitial(userId: string): string {
    const name = this.getUserName(userId);
    return name.charAt(0).toUpperCase();
  }

  getTimeFromMessage(msg: Message): string {
    if (!msg.timestamp) return '';

    const timestamp = new Date(msg.timestamp);
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
