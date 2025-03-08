/**
 * The Emitter class
 */
export class Emitter {
  /**
   * class constructor
   */
  private _eventCallbacks: {
    [eventName: string]: ((event: CustomEvent) => void)[];
  };
  private _dispatchDom: boolean;
  element: HTMLElement | null;
  allowedEvents: Array<string> | null;

  constructor(dispatchDom: boolean = false) {
    this._eventCallbacks = {};
    this.element = null;
    this.allowedEvents = null;
    this._dispatchDom = dispatchDom;
  }

  /**
   * Method to emit specific events
   *
   * @param {string} eventName the name of the event to be triggered
   * @param {Object} detail additional event data
   */
  emit(eventName: string, detail: any): void {
    const eventCallbacks = this._eventCallbacks[eventName];
    const eventData = { bubbles: false, cancelable: false, detail };
    const ce = new CustomEvent(eventName, eventData);

    // call all registered event handler
    if (eventCallbacks) {
      eventCallbacks.forEach((cb) => cb.call(this, ce));
    }

    // trigger DOM event
    if (this._dispatchDom && this.element) {
      this.element.dispatchEvent(ce);
    }
  }

  /**
   * Register an event handler
   *
   * @param {string} eventName the name of the eventlistener
   * @param {function} listener the handler function to be called if the event triggers
   * @returns {Emitter} this instance for chaining
   */
  addEventListener(
    eventName: string,
    listener: (event: CustomEvent) => void
  ): Emitter {
    if (
      (this.allowedEvents && this.allowedEvents.indexOf(eventName) < 0) ||
      typeof listener !== 'function'
    ) {
      return this;
    }

    if (!this._eventCallbacks[eventName]) {
      this._eventCallbacks[eventName] = [];
    }
    this._eventCallbacks[eventName].push(listener);

    return this;
  }

  /**
   * Remove previously register event handler
   *
   * @param {string} [eventName] the name of the eventlistener
   * @param {(event: CustomEvent) => void} [listener] the handler function
   * @returns {Emitter} this instance for chaining
   */
  removeEventListener(
    eventName: string,
    listener?: (event: CustomEvent) => void
  ): Emitter {
    // clear all
    if (!this._eventCallbacks || (!eventName && !listener)) {
      this._eventCallbacks = {};
      return this;
    }

    // early exit, eventName not found
    const eventCallbacks = this._eventCallbacks[eventName];
    if (!eventCallbacks) {
      return this;
    }

    // remove handlers for a specific event
    if (!listener) {
      delete this._eventCallbacks[eventName];
      return this;
    }

    // remove specific handler form array
    this._eventCallbacks[eventName] = eventCallbacks.filter(
      (cb) => cb !== listener
    );

    return this;
  }
}
