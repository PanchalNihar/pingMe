import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.css']
})
export class ChatMessagesComponent {
  @Input() messages: any[] = [];
  @Input() currentGroup: any | null = null;
  @Input() activeReactionMessageId: string | null = null;
  @Input() quickReactions: string[] = [];

  // Function references from parent
  @Input() isCurrentUserFn!: (sender: any) => boolean;
  @Input() getUserNameFn!: (sender: any) => string;
  @Input() getReactionCountsFn!: (msg: any) => any[];
  @Input() getTimeFromMessageFn!: (msg: any) => string;
  @Input() getSafeAudioUrlFn!: (msg: any) => any;

  @Output() sendReaction = new EventEmitter<{ messageId: string; emoji: string }>();
  @Output() toggleReactionMenu = new EventEmitter<string>();
  @Output() editMessage = new EventEmitter<string>();
  @Output() deleteMessage = new EventEmitter<string>();
}
