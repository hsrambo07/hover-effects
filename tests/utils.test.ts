import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getTargets } from '../src/core/utils';

describe('getTargets', () => {
  // Setup test DOM
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test"></div>
      <div class="test-class"></div>
      <div class="test-class"></div>
    `;
  });

  // Clear test DOM
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return an array with a single element when given an HTMLElement', () => {
    const element = document.getElementById('test');
    if (!element) throw new Error('Test element not found');
    
    const result = getTargets(element);
    
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(element);
  });

  it('should return an array of elements when given a CSS selector', () => {
    const result = getTargets('.test-class');
    
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(HTMLElement);
    expect(result[1]).toBeInstanceOf(HTMLElement);
  });

  it('should return an array of elements when given a NodeList', () => {
    const nodeList = document.querySelectorAll('.test-class');
    const result = getTargets(nodeList);
    
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(HTMLElement);
    expect(result[1]).toBeInstanceOf(HTMLElement);
  });

  it('should return an empty array when given a selector that matches nothing', () => {
    const result = getTargets('.non-existent');
    
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(0);
  });
}); 