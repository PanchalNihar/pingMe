import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent {
  @Input() message: string = '';
  @Input() selectedImage: File | null = null;
  @Input() isRecording: boolean = false;
  @Input() recordingDuration: number = 0;
  @Input() isAiLoading: boolean = false;
  @Input() showEmojiPicker: boolean = false;
  @Input() edititngMessageId: string | null = null;

  @Output() messageChange = new EventEmitter<string>();
  @Output() send = new EventEmitter<void>();
  @Output() startRecording = new EventEmitter<void>();
  @Output() stopRecording = new EventEmitter<void>();
  @Output() cancelRecording = new EventEmitter<void>();
  @Output() triggerSmartReplies = new EventEmitter<void>();
  @Output() toggleEmojiPicker = new EventEmitter<void>();
  @Output() onInput = new EventEmitter<void>();
  @Output() openFilePicker = new EventEmitter<void>();
  @Output() addEmoji = new EventEmitter<any>();

  onSendClick() { this.send.emit(); }
  handleInput(v: string) { this.messageChange.emit(v); this.onInput.emit(); }
  emojiClicked(event: any) { this.addEmoji.emit(event); }
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
