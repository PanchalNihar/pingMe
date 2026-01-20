import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalState } from '../../../services/modal.service';


@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  state: ModalState | null = null;

  constructor(public modalService: ModalService) {}

  ngOnInit() {
    this.modalService.modalState$.subscribe(state => {
      this.state = state;
    });
  }

  confirm() {
    this.modalService.close(true);
  }

  close() {
    this.modalService.close(false);
  }
}