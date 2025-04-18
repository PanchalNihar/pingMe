import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private currentRoom: string | null = null;

  constructor(private socket: Socket) {
    // Listen for connection events for debugging
    this.socket.on('connect', () => {
      console.log('Socket connected');
      // Rejoin room if there was one active
      if (this.currentRoom) {
        this.joinRoom(this.currentRoom);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  /**
   * Join a chat room
   * @param roomId The room identifier
   */
  joinRoom(roomId: string) {
    console.log('Joining room:', roomId);

    // Store current room for reconnection handling
    this.currentRoom = roomId;

    // Join the room
    this.socket.emit('join-room', roomId);
  }

  /**
   * Send a message to the current room
   * @param data Message data
   */
  sendMessage(data: any) {
    console.log('Sending message:', data);

    // Make sure we have the required fields
    if (!data.sender || !data.receiver || !data.content) {
      console.error('Invalid message data', data);
      return;
    }

    // Send the message through socket
    this.socket.emit('chat-message', data);
  }

  /**
   * Listen for incoming messages
   * @returns Observable for chat messages
   */
  onMessage(): Observable<any> {
    // Return an observable of messages from the socket
    return this.socket.fromEvent('chat-message');
  }

  /**
   * Get notification when a user joins a room
   * @returns Observable for join events
   */
  onUserJoined(): Observable<any> {
    return this.socket.fromEvent('user-joined');
  }

  /**
   * Get notification when a user leaves a room
   * @returns Observable for leave events
   */
  onUserLeft(): Observable<any> {
    return this.socket.fromEvent('user-left');
  }

  typing(roomId: string, sender: string) {
    this.socket.emit('typing', { roomId, sender });
  }

  stopTyping(roomId: String) {
    this.socket.emit('stop-typing', { roomId });
  }

  onTyping(): Observable<any> {
    return this.socket.fromEvent('typing');
  }

  onStopTyping(): Observable<any> {
    return this.socket.fromEvent('stop-typing');
  }
  /**
   * Disconnect the socket when service is destroyed
   */
  disconnect() {
    this.socket.disconnect();
  }
}
