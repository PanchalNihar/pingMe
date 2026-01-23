import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  AfterViewChecked,
  viewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocketService } from '../../../services/socket.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ModalService } from '../../../services/modal.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
export interface Message {
  id?: string;
  _id?: string;
  sender: string | { _id: string; name: string; avatar?: string };
  receiver?: string;
  chatRoom?: string;
  content: string;
  isRead: boolean;
  timestamp?: Date;
  image?: {
    data: string;
    contentType: string;
  };
  reactions?: { sender: string; emoji: string }[];
  translatedContent?: string;
  isTranslating?: boolean;
  audio?: {
    data: string;
    contentType: string;
  };
}
interface ChatGroup {
  _id: string;
  name: string;
  admin: string;
  isGroup: boolean;
  avatar?: string;
  participants: any[];
}
interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  isVerified?: boolean;
}

@Component({
  selector: 'app-chat-room',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PickerComponent],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.css',
})
export class ChatRoomComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;
  private sentMessageIds = new Set<string>();
  message = '';
  messages: Message[] = [];
  users: User[] = [];
  userId: string | null = null;
  receiverId: string | null = null;
  currentReceiver: User | null = null;
  lastMessageTimestamp = 0;
  unreadMap = new Map<string, number>();
  isTyping = false;
  typingUser: string | null = null;
  typingTimeout: any;
  onlineUsers: Set<string> = new Set();
  selectedImage: File | null = null;
  edititngMessageId: string | null = null;
  searchTerm: string = '';
  showEmojiPicker = false;
  activeReactionMessageId: string | null = null;
  quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
  groups: ChatGroup[] = [];
  selectedGroupId: string | null = null;
  currentGroup: ChatGroup | null = null;
  isEmailVerified = true;
  showCreateGroupModal = false;
  newGroupName = '';
  selectedParticipants: Set<string> = new Set();

  showGroupInfoModal = false;
  isGroupAdmin = false;
  editGroupName = '';
  newMemberId = '';

  showAddFriendModal = false;
  searchName = '';
  foundUser: any = null;
  pendingRequests: any[] = [];
  activeTab: 'add' | 'requests' = 'add';

  suggestedReplies: string[] = [];
  isAiLoading = false;

  showSummaryModal = false;
  summaryContent = '';
  isGeneratingSummary = false;

  userLanguage = 'English';
  autoTranslate = false;
  supportedLanguages = [
    'English',
    'Hindi',
    'Spanish',
    'French',
    'German',
    'Japanese',
    'Russian',
    'Gujarati',
  ];
  selectedLanguage = this.userLanguage;
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: any[] = [];
  recordingDuration = 0;
  recordingTimer: any;
  constructor(
    private socketService: SocketService,
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private profileService: ProfileService,
    private modalService: ModalService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) return;
    this.profileService.getProfile(this.userId).subscribe((user: any) => {
       this.isEmailVerified = (user.isVerified === true); 
    });
    this.loadFriends();
    this.fetchGroups();

    this.socketService.onMessage().subscribe((msg: any) => {
      msg.id = msg.id || msg._id;
      if (msg.audioBase64 && !msg.audio) {
        msg.audio = {
          data: msg.audioBase64,
          contentType: msg.audioType || 'audio/webm'
        };
      }
      const senderId = this.getSenderId(msg.sender);

      // FIX: Check if the message belongs to the SPECIFIC Group currently open
      const isCurrentChat =
        (this.selectedGroupId && msg.chatRoom === this.selectedGroupId) ||
        (!this.selectedGroupId &&
          senderId === this.userId &&
          msg.receiver === this.receiverId) ||
        (!this.selectedGroupId &&
          senderId === this.receiverId &&
          msg.receiver === this.userId);

      const isIncoming = msg.receiver === this.userId;

      // Handle unread counts (for 1-on-1 only currently)
      if (!isCurrentChat && isIncoming) {
        const current = this.unreadMap.get(senderId) || 0;
        this.unreadMap.set(senderId, current + 1);
        return;
      }

      // ... (Rest of your duplicate check and push logic) ...
      const isDuplicate = this.messages.some((m) => {
        const mSenderId = this.getSenderId(m.sender);
        return (
          (m.id || m._id) === msg.id ||
          (mSenderId === senderId &&
            m.content === msg.content &&
            m.timestamp === msg.timestamp)
        );
      });

      if (!isDuplicate) {
        this.messages.push(msg);
        this.scrollToBottom();
        if (!this.isCurrentUser(msg.sender)) {
          const roomId = this.selectedGroupId;
          const user1 = this.userId;
          const user2 = this.receiverId;
        }
        if (this.autoTranslate && !this.isCurrentUser(msg.sender)) {
          this.translateMessage(msg);
        }
      }
    });

    this.socketService.registerUser(this.userId);
    this.socketService.onOnlineUsers().subscribe((onlineIds: string[]) => {
      this.onlineUsers = new Set(onlineIds);
    });

    this.socketService.onMessageDeleted().subscribe(({ messageId }) => {
      this.messages = this.messages.filter((msg) => msg.id !== messageId);
    });

    this.socketService.onMessageEdit().subscribe((updatedMsg) => {
      const updatedId = updatedMsg.id || updatedMsg._id;
      const index = this.messages.findIndex((m) => m.id === updatedId);
      if (index !== -1) {
        this.messages[index].content = updatedMsg.content;
      }
    });
    this.socketService.onMessageReaction().subscribe((data: any) => {
      const msgIndex = this.messages.findIndex(
        (m) => (m.id || m._id) === data.messageId,
      );
      if (msgIndex > -1) {
        this.messages[msgIndex].reactions = data.reactions;
      }
    });
  }
  getSenderId(sender: string | any): string {
    if (typeof sender === 'string') return sender;
    return sender._id || '';
  }
  isCurrentUser(sender: string | any): boolean {
    return this.getSenderId(sender) === this.userId;
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
  loadFriends() {
    this.authService.getMyFriends(this.userId!).subscribe((res: any) => {
      this.users = res;
      this.users.forEach((user) => {
        this.profileService.getProfile(user._id).subscribe((profile) => {
          const userIndex = this.users.findIndex((u) => u._id === profile._id);
          if (userIndex !== -1) {
            this.users[userIndex] = {
              ...this.users[userIndex],
              avatar: profile.avatar,
            };
          }
          if (this.receiverId === profile._id) {
            this.currentReceiver = {
              _id: profile._id,
              name: profile.name,
              avatar: profile.avatar,
            };
          }
        });
      });
      this.socketService.onTyping().subscribe((senderId: string) => {
        if (senderId !== this.userId) {
          this.typingUser = this.getUserName(senderId);
          this.isTyping = true;
        }
        this.socketService.onStopTyping().subscribe(() => {
          this.isTyping = false;
        });
      });
    });
  }
  send() {
    if (!this.userId) return;
    if (!this.receiverId && !this.selectedGroupId) return; // Must have destination

    // Prepare common payload
    const payload: any = {
      sender: this.userId,
      content: this.message.trim(),
    };

    if (this.selectedGroupId) {
      payload.chatRoomId = this.selectedGroupId;
    } else {
      payload.receiver = this.receiverId;
    }

    // Handle Image vs Text
    if (this.selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        payload.imageBase64 = (reader.result as string).split(',')[1];
        payload.imageType = this.selectedImage!.type;
        this.socketService.sendMessage(payload);
        this.clearImage();
        this.message = '';
      };
      reader.readAsDataURL(this.selectedImage);
    } else if (this.message.trim()) {
      this.socketService.sendMessage(payload);
      this.message = '';
    }
  }
  fetchGroups() {
    if (!this.userId) return;
    this.messageService.getGroups(this.userId).subscribe((groups) => {
      this.groups = groups;
      const groupIds = this.groups.map((g) => g._id);
      this.socketService.joinGroups(groupIds);
    });
  }
  startChat(entity: any, isGroup: boolean) {
    if (!this.userId) return;

    this.messages = [];
    this.message = '';
    this.selectedImage = null;
    this.suggestedReplies = [];

    if (isGroup) {
      // GROUP MODE
      this.selectedGroupId = entity._id;
      this.receiverId = null; // Clear 1-on-1 receiver
      this.currentGroup = entity;
      this.currentReceiver = null;
      // Join room (Room ID = Group ID)
      this.socketService.joinRoom(entity._id);

      this.messageService
        .getMessages(null, null, entity._id)
        .subscribe((msgs) => {
          this.messages = msgs.map((m: any) => ({ ...m, id: m._id || m.id }));
          this.scrollToBottom();
        });
    } else {
      // 1-on-1 MODE (Legacy logic)
      this.selectedGroupId = null;
      this.receiverId = entity._id;
      this.currentGroup = null;
      // ... find currentReceiver logic ...
      const receiver = this.users.find((u) => u._id === entity._id);
      if (receiver) this.currentReceiver = receiver;

      const roomId = [this.userId, this.receiverId].sort().join('-');
      this.socketService.joinRoom(roomId);

      this.messageService
        .getMessages(this.userId, this.receiverId!)
        .subscribe((msgs) => {
          this.messages = msgs.map((m: any) => ({ ...m, id: m._id || m.id }));
          this.scrollToBottom();
        });
    }
  }

  getUserName(sender: string | any): string {
    const senderId = this.getSenderId(sender);

    // Check if it's the current user
    if (senderId === this.userId) return 'You';

    // If sender is a populated object, use the name directly (More efficient)
    if (typeof sender === 'object' && sender?.name) {
      return sender.name;
    }

    // Fallback: Look up in the users list
    const user = this.users.find((u) => u._id === senderId);
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

  onInput() {
    const roomId = [this.userId, this.receiverId].sort().join('-');
    this.socketService.typing(roomId, this.userId!);
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.socketService.stopTyping(roomId);
    }, 1000);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.modalService.alert('File size exceeds 5MB limit.');
        return;
      }
      this.selectedImage = file;
    }
  }
  clearImage() {
    this.selectedImage = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  deleteMessage(messageId: string) {
    const roomId = [this.userId, this.receiverId].sort().join('-');
    if (!messageId) return;
    this.socketService.deleteMessage(messageId, roomId);
  }

  editMessage(messageId: string) {
    const msgToEdit = this.messages.find((m) => m.id === messageId);
    if (msgToEdit && msgToEdit.content) {
      this.message = msgToEdit.content;
      this.edititngMessageId = messageId;
    }
  }
  cancleEdit() {
    this.edititngMessageId = null;
    this.message = '';
  }
  get filtertedUser() {
    return this.users.filter((user) =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }
  viewProfile(id: string) {
    this.router.navigate(['/users', id]);
  }
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.message += event.emoji.native;
    // Keep picker open or close it? Let's keep it open for multiple emojis
  }

  // --- Message Reactions ---
  toggleReactionMenu(messageId: string) {
    if (this.activeReactionMessageId === messageId) {
      this.activeReactionMessageId = null;
    } else {
      this.activeReactionMessageId = messageId;
    }
  }

  sendReaction(messageId: string, emoji: string) {
    const roomId = [this.userId, this.receiverId].sort().join('-');
    this.socketService.sendReaction({
      messageId,
      emoji,
      userId: this.userId,
      roomId,
    });
    this.activeReactionMessageId = null; // Close menu
  }

  getReactionCounts(msg: Message) {
    if (!msg.reactions) return [];

    const counts: { [key: string]: number } = {};
    msg.reactions.forEach((r) => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    });

    return Object.keys(counts).map((emoji) => ({
      emoji,
      count: counts[emoji],
      hasReacted: msg.reactions?.some(
        (r) => r.emoji === emoji && r.sender === this.userId,
      ),
    }));
  }

  openGroupModal() {
    this.showCreateGroupModal = true;
    this.newGroupName = '';
    this.selectedParticipants.clear();
  }
  closeGroupModal() {
    this.showCreateGroupModal = false;
  }
  toggleParticipant(userId: string) {
    if (this.selectedParticipants.has(userId)) {
      this.selectedParticipants.delete(userId);
    } else {
      this.selectedParticipants.add(userId);
    }
  }
  createGroup() {
    if (!this.newGroupName.trim() || this.selectedParticipants.size === 0) {
      this.modalService.alert(
        'Group name and at least one participant are required.',
      );
      return;
    }
    this.messageService
      .createGroup(
        this.newGroupName,
        Array.from(this.selectedParticipants),
        this.userId!,
      )
      .subscribe((newGroup) => {
        this.groups.push(newGroup);
        this.socketService.joinGroups([newGroup._id]);
        this.closeGroupModal();
        this.startChat(newGroup, true);
      });
  }
  openGroupInfo() {
    if (!this.currentGroup) {
      return;
    }
    this.isGroupAdmin = this.currentGroup.admin === this.userId;
    this.editGroupName = this.currentGroup.name;
    this.showGroupInfoModal = true;
  }
  closeGroupInfo() {
    this.showGroupInfoModal = false;
  }
  updateGroupDetails() {
    if (!this.currentGroup || !this.userId) {
      return;
    }
    this.messageService
      .updateGroup(
        this.currentGroup._id,
        this.editGroupName,
        this.currentGroup.avatar || null,
        this.userId,
      )
      .subscribe((updatedGroup: any) => {
        this.updateLocalGroupData(updatedGroup);
        this.modalService.alert('Group updated successfully');
      });
  }
  updateLocalGroupData(updatedGroup: any) {
    // Update the main groups list
    const index = this.groups.findIndex((g) => g._id === updatedGroup._id);
    if (index !== -1) {
      this.groups[index] = updatedGroup;
    }
    // Update currently selected group
    if (this.currentGroup && this.currentGroup._id === updatedGroup._id) {
      this.currentGroup = updatedGroup;
    }
  }
  onGroupIconSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.currentGroup && this.userId) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string; // Full Data URL

        // Immediately upload
        this.messageService
          .updateGroup(
            this.currentGroup!._id,
            this.currentGroup!.name,
            base64,
            this.userId!,
          )
          .subscribe((updatedGroup: any) => {
            this.updateLocalGroupData(updatedGroup);
          });
      };
      reader.readAsDataURL(file);
    }
  }
  addMember() {
    if (!this.currentGroup || !this.userId || !this.newMemberId) return;

    this.messageService
      .addGroupParticipant(this.currentGroup._id, this.newMemberId, this.userId)
      .subscribe((updatedGroup: any) => {
        this.updateLocalGroupData(updatedGroup);
        this.newMemberId = ''; // Reset selection
      });
  }

  removeMember(participantId: string) {
    if (!this.currentGroup || !this.userId) return;

    this.modalService
      .confirm('Remove user', 'Are you sure you want to remove this user?')
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.removeMember(participantId);
        this.modalService.close();
      });

    this.messageService
      .removeGroupParticipant(this.currentGroup._id, participantId, this.userId)
      .subscribe((updatedGroup: any) => {
        this.updateLocalGroupData(updatedGroup);
      });
  }
  isMemberOfGroup(userId: string): boolean {
    if (!this.currentGroup || !this.currentGroup.participants) return false;
    return this.currentGroup.participants.some(
      (p: any) => (p._id || p) === userId,
    );
  }
  openAddFriendModal() {
    this.showAddFriendModal = true;
    this.searchName = '';
    this.foundUser = null;
    this.fetchPendingRequests();
  }

  closeAddFriendModal() {
    this.showAddFriendModal = false;
  }

  switchTab(tab: 'add' | 'requests') {
    this.activeTab = tab;
    if (tab === 'requests') {
      this.fetchPendingRequests();
    }
  }

  searchUser() {
    if (!this.searchName.trim()) return;
    this.authService.searchUser(this.searchName).subscribe({
      next: (user) => {
        // Don't show yourself
        if (user._id === this.userId) {
          this.modalService.alert('You cannot add yourself.');
          this.foundUser = null;
          return;
        }
        this.foundUser = user;
      },
      error: () => {
        this.foundUser = null;
        this.modalService.alert('User not found');
      },
    });
  }

  sendRequest() {
    if (!this.foundUser || !this.userId) return;
    this.authService
      .sendFriendRequest(this.userId, this.foundUser._id)
      .subscribe({
        next: () => {
          this.modalService.alert('Friend request sent!');
          this.foundUser = null;
          this.searchName = '';
        },
        error: (err) => {
          this.modalService.alert(err.error.msg || 'Failed to send request');
        },
      });
  }

  fetchPendingRequests() {
    if (!this.userId) return;
    this.authService.getFriendRequests(this.userId).subscribe((reqs: any) => {
      this.pendingRequests = reqs;
    });
  }

  respondToRequest(requesterId: string, action: 'accept' | 'reject') {
    if (!this.userId) return;
    this.authService
      .respondToRequest(this.userId, requesterId, action)
      .subscribe(() => {
        this.fetchPendingRequests(); // Refresh list
        if (action === 'accept') {
          this.loadFriends(); // Refresh main chat list
          this.modalService.alert('Friend added!');
        }
      });
  }

  //AI Smart Replies
  triggerSmartReplies() {
    const roomId = this.selectedGroupId;
    const user1 = this.userId;
    const user2 = this.receiverId;

    // Reuse your existing logic, just triggered manually now
    this.fetchSmartReplies(user1, user2, roomId);
  }

  // Keep fetchSmartReplies as is, but ensure it clears old replies first
  fetchSmartReplies(
    user1: string | null,
    user2: string | null,
    roomId: string | null,
  ) {
    this.suggestedReplies = []; // Clear previous suggestions immediately
    this.isAiLoading = true;

    if (roomId) {
      this.messageService.AIRepliesForGroup(roomId).subscribe({
        next: (res: any) => {
          this.suggestedReplies = res.replies || [];
          this.isAiLoading = false;
        },
        error: () => {
          this.isAiLoading = false;
        },
      });
    } else if (user1 && user2) {
      this.messageService.AIRepliesForChat(user1, user2).subscribe({
        next: (res: any) => {
          this.suggestedReplies = res.replies || [];
          this.isAiLoading = false;
        },
        error: () => {
          this.isAiLoading = false;
        },
      });
    } else {
      this.isAiLoading = false;
    }
  }
  useReply(reply: string) {
    this.message = reply;
    this.suggestedReplies = [];
  }
  generateSummary() {
    this.isGeneratingSummary = true;
    this.showSummaryModal = true;
    this.summaryContent = '';
    this.messageService
      .getChatSummary(this.userId, this.receiverId, this.selectedGroupId)
      .subscribe({
        next: (res) => {
          this.summaryContent = res.summary || 'No summary available.';
          this.isGeneratingSummary = false;
        },
        error: () => {
          this.isGeneratingSummary = false;
          this.summaryContent = 'Failed to generate summary.';
        },
      });
  }
  closeSummaryModal() {
    this.showSummaryModal = false;
    this.summaryContent = '';
  }
 toggleAutoTranslate() {
    this.autoTranslate = !this.autoTranslate;
  }

  translateMessage(msg: Message) {
    if (!msg.content || msg.translatedContent) return;

    msg.isTranslating = true;

    this.messageService.translateMessage(msg.content, this.selectedLanguage).subscribe({
      next: (res: any) => {
        msg.translatedContent = res.translatedText; 
        msg.isTranslating = false;
      },
      error: () => {
        msg.isTranslating = false;
      }
    });
  }

   async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;
      this.recordingDuration = 0;

      // Start Timer
      this.recordingTimer = setInterval(() => {
        this.recordingDuration++;
      }, 1000);

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.sendAudioMessage();
      };

      this.mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      this.modalService.alert('Could not access microphone.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop(); // Triggers onstop -> sendAudioMessage
      this.isRecording = false;
      clearInterval(this.recordingTimer);

      // Stop all tracks to release microphone
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  }

  cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      clearInterval(this.recordingTimer);
      this.audioChunks = []; // Clear chunks so we don't send
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      // Override onstop to do nothing
      this.mediaRecorder.onstop = null;
    }
  }

  sendAudioMessage() {
    if (this.audioChunks.length === 0) return;

    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    const reader = new FileReader();

    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = (reader.result as string).split(',')[1];

      // Prepare Payload
      const payload: any = {
        sender: this.userId,
        content: 'Voice message', // Empty content for voice notes
        audioBase64: base64Audio,
        audioType: 'audio/webm',
      };

      if (this.selectedGroupId) {
        payload.chatRoomId = this.selectedGroupId;
      } else {
        payload.receiver = this.receiverId;
      }

      // Send via Socket
      this.socketService.sendMessage(payload);
    };
  }

  // Helper for timer display (e.g. "0:12")
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  getSafeAudioUrl(msg: Message): SafeUrl {
    if (!msg.audio || !msg.audio.data) return '';

    // Construct the base64 string
    const base64String = `data:${msg.audio.contentType};base64,${msg.audio.data}`;

    // Bypass Angular security to allow playback
    return this.sanitizer.bypassSecurityTrustUrl(base64String);
  }
}
