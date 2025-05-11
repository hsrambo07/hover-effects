import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { applyHoverEffect } from '../src';

describe('applyHoverEffect', () => {
  beforeEach(() => {
    // Setup test DOM
    document.body.innerHTML = `
      <div id="test-element"></div>
      <div class="test-class"></div>
      <div class="test-class"></div>
    `;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  it('should return an object with a destroy method', () => {
    const element = document.getElementById('test-element');
    if (!element) throw new Error('Test element not found');
    
    const result = applyHoverEffect(element, { effect: 'blur' });
    
    expect(result).toHaveProperty('destroy');
    expect(typeof result.destroy).toBe('function');
  });
  
  it('should apply the effect to multiple elements when given a CSS selector', () => {
    const result = applyHoverEffect('.test-class', { effect: 'zoom' });
    
    expect(result).toHaveProperty('destroy');
    
    // Test that it was applied to both elements (checking for the position styling)
    const elements = document.querySelectorAll('.test-class');
    expect(elements.length).toBe(2);
    
    elements.forEach(el => {
      expect(window.getComputedStyle(el).position).toBe('relative');
    });
  });
  
  it('should clean up all effects when destroy is called', () => {
    const elements = document.querySelectorAll('.test-class');
    expect(elements.length).toBe(2);
    
    const removeEventListenerSpies = Array.from(elements).map(el => 
      vi.spyOn(el, 'removeEventListener')
    );
    
    const result = applyHoverEffect('.test-class', { effect: 'blur' });
    result.destroy();
    
    // Check that removeEventListener was called for each element
    removeEventListenerSpies.forEach(spy => {
      expect(spy).toHaveBeenCalledTimes(3); // mouseenter, mouseleave, mousemove
    });
  });
}); 