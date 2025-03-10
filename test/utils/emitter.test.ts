import { describe, expect, it, vi } from 'vitest';
import { Emitter } from '../../src/utils/emitter';

describe('Emitter', () => {
  it('should create a new instance', () => {
    const emitter = new Emitter();
    expect(emitter).toBeInstanceOf(Emitter);
  });

  it('should have an empty event callbacks object', () => {
    const emitter = new Emitter();
    // @ts-ignore
    expect(emitter._eventCallbacks).toEqual({});
  });

  it('should have a null element property', () => {
    const emitter = new Emitter();
    expect(emitter.element).toBeNull();
  });

  it('should have a null allowedEvents property', () => {
    const emitter = new Emitter();
    expect(emitter.allowedEvents).toBeNull();
  });

  describe('emit', () => {
    it('should call all registered event handlers', () => {
      const emitter = new Emitter();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      emitter.addEventListener('test', listener1);
      emitter.addEventListener('test', listener2);
      emitter.emit('test', { foo: 'bar' });
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should dispatch a DOM event if dispatchDom is true', () => {
      const emitter = new Emitter(true);
      const element = document.createElement('div');
      emitter.element = element;
      const listener = vi.fn();
      element.addEventListener('test', listener);
      emitter.emit('test', { foo: 'bar' });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('addEventListener', () => {
    it('should add a new event listener', () => {
      const emitter = new Emitter();
      const listener = vi.fn();
      emitter.addEventListener('test', listener);
      // @ts-ignore
      expect(emitter._eventCallbacks['test']).toEqual([listener]);
    });

    it('should not add a non-function listener', () => {
      const emitter = new Emitter();
      const listener = 'not a function';
      // @ts-ignore
      emitter.addEventListener('test', listener);
      // @ts-ignore
      expect(emitter._eventCallbacks['test']).toBeUndefined();
    });

    it('should not add a listener for a disallowed event', () => {
      const emitter = new Emitter();
      emitter.allowedEvents = ['foo'];
      const listener = vi.fn();
      emitter.addEventListener('test', listener);
      // @ts-ignore
      expect(emitter._eventCallbacks['test']).toBeUndefined();
    });
  });

  describe('removeEventListener', () => {
    it('should remove all event listeners', () => {
      const emitter = new Emitter();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      emitter.addEventListener('test', listener1);
      emitter.addEventListener('test', listener2);
      emitter.removeEventListener();
      // @ts-ignore
      expect(emitter._eventCallbacks).toEqual({});
    });

    it('should remove a specific event listener', () => {
      const emitter = new Emitter();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      emitter.addEventListener('test', listener1);
      emitter.addEventListener('test', listener2);
      emitter.removeEventListener('test', listener1);
      // @ts-ignore
      expect(emitter._eventCallbacks['test']).toEqual([listener2]);
    });

    it('should remove all listeners for a specific event', () => {
      const emitter = new Emitter();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      emitter.addEventListener('test', listener1);
      emitter.addEventListener('test', listener2);
      emitter.removeEventListener('test');
      // @ts-ignore
      expect(emitter._eventCallbacks['test']).toBeUndefined();
    });
  });
});
