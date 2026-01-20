import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ModalState {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private initialState: ModalState = {
    isOpen: false,
    type: 'alert',
    title: '',
    message: ''
  };

  private modalStateSubject = new BehaviorSubject<ModalState>(this.initialState);
  modalState$ = this.modalStateSubject.asObservable();

  // Subject to handle the result of a confirmation dialog
  private confirmResultSubject: Subject<boolean> | null = null;

  constructor() {}

  /**
   * Opens a simple Alert modal (OK button only)
   */
  alert(message: string) {
    this.modalStateSubject.next({
      isOpen: true,
      type: 'alert',
      title: '',
      message
    });
  }

  /**
   * Opens a Confirm modal (Yes/No buttons)
   * Returns an Observable that emits true (confirmed) or false (cancelled)
   */
  confirm(title: string, message: string, confirmLabel = 'Yes', cancelLabel = 'No'): Observable<boolean> {
    this.confirmResultSubject = new Subject<boolean>();
    
    this.modalStateSubject.next({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      confirmLabel,
      cancelLabel
    });

    return this.confirmResultSubject.asObservable();
  }

  /**
   * Called by the Modal Component when buttons are clicked
   */
  close(result: boolean = false) {
    this.modalStateSubject.next(this.initialState); // Reset state
    
    if (this.confirmResultSubject) {
      this.confirmResultSubject.next(result);
      this.confirmResultSubject.complete();
      this.confirmResultSubject = null;
    }
  }
}