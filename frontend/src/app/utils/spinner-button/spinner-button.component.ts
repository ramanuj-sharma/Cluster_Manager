import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';

@Component({
  selector: 'spinner-button',
  templateUrl: './spinner-button.component.html',
  styleUrls: ['./spinner-button.component.scss']
})
export class SpinnerButtonComponent {

  @Output() action: EventEmitter<any> = new EventEmitter();

  pending = false

  constructor() { }

  /**
   * Activates the spinner, disables the button, calls the action function, and releases the button afterwards.
   * @see after()
   */
  handle() {
    this.pending = true
    this.action.emit(this.after)
  }

  /**
   * Releases the button.
   */
  after() {
    this.pending = false
  }

}
