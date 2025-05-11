import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AsciiHover } from '../src/effects/ascii';

describe('AsciiHover', () => {
  let element: HTMLImageElement;
  let asciiHover: AsciiHover;
  
  beforeEach(() => {
    // Create test image element
    element = document.createElement('img');
    element.width = 100;
    element.height = 100;
    document.body.appendChild(element);
    
    // Create AsciiHover instance
    asciiHover = new AsciiHover({
      radius: 50,
      size: 10,
      chars: [' ', '.', '#', '@']
    });
  });
  
  afterEach(() => {
    // Clean up
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    asciiHover.destroy();
    vi.restoreAllMocks();
  });
  
  it('should create an instance with default options', () => {
    const defaultAscii = new AsciiHover();
    expect(defaultAscii).toBeInstanceOf(AsciiHover);
  });
  
  it('should attach to an element and add a canvas', () => {
    asciiHover.attach(element);
    
    // Should have added a canvas as a child
    expect(element.querySelector('canvas')).not.toBeNull();
  });
  
  it('should add event listeners on attach', () => {
    const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
    
    asciiHover.attach(element);
    
    // Should add three event listeners
    expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });
  
  it('should remove event listeners on detach', () => {
    asciiHover.attach(element);
    
    const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
    
    asciiHover.detach();
    
    // Should remove three event listeners
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(3);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });
  
  it('should remove canvas on detach', () => {
    asciiHover.attach(element);
    const canvas = element.querySelector('canvas');
    expect(canvas).not.toBeNull();
    
    asciiHover.detach();
    expect(element.querySelector('canvas')).toBeNull();
  });
}); 