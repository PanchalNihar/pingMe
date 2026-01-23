import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private currentRoom: string | null = null;

  constructor() {
    // 1. Get the URL from environment (Production vs Local)
    const url = environment.apiUrl; 

    // 2. Initialize the connection directly
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      path: '/socket.io/' // Standard path
    });

    // 3. Setup Connection Listeners
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully via:', this.socket.io.engine.transport.name);
      
      // Rejoin room if we reconnected
      if (this.currentRoom) {
        this.joinRoom(this.currentRoom);
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket Connection Error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket disconnected:', reason);
    });
  }

  /**
   * Join a chat room
   */
  joinRoom(roomId: string) {
    this.currentRoom = roomId;
    this.socket.emit('join-room', roomId);
  }

  joinGroups(groupIds: string[]) {
    this.socket.emit('join-group-rooms', groupIds);
  }

  /**
   * Send a message
   */
  sendMessage(data: any) {
    if (!data.sender || (!data.receiver && !data.chatRoomId)) {
      console.error('Missing sender or destination', data);
      return;
    }
    this.socket.emit('chat-message', data);
  }

  /**
   * Listen for incoming messages
   * Wraps standard socket.on() in an Observable for Angular
   */
  onMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('chat-message', (data) => observer.next(data));
    });
  }

  onUserJoined(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('user-joined', (data) => observer.next(data));
    });
  }

  onUserLeft(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('user-left', (data) => observer.next(data));
    });
  }

  // --- TYPING ---
  typing(roomId: string, sender: string) {
    this.socket.emit('typing', { roomId, sender });
  }

  stopTyping(roomId: string) {
    this.socket.emit('stop-typing', { roomId });
  }

  onTyping(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('typing', (data) => observer.next(data));
    });
  }

  onStopTyping(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('stop-typing', (data) => observer.next(data));
    });
  }

  // --- USER STATUS ---
  registerUser(userId: string) {
    this.socket.emit('register-users', userId);
  }

  onOnlineUsers(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('online-users', (data) => observer.next(data));
    });
  }

  // --- MESSAGE ACTIONS ---
  deleteMessage(messageId: string, roomId: string) {
    this.socket.emit('delete-message', { messageId, roomId });
  }

  onMessageDeleted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message-deleted', (data) => observer.next(data));
    });
  }

  editMessage(messageId: string, newContent: string, roomId: string) {
    this.socket.emit('edit-message', { messageId, newContent, roomId });
  }

  onMessageEdit(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message-edited', (data) => observer.next(data));
    });
  }

  // --- REACTIONS ---
  sendReaction(data: any) {
    this.socket.emit('add-reaction', data);
  }

  onMessageReaction(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message-reaction-updated', (data) => observer.next(data));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}