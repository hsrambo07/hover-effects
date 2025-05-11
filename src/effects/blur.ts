import { HoverEffect } from '../core/types';

interface BlurHoverOptions {
  radius?: number;
  strength?: number;
}

export class BlurHover implements HoverEffect {
  private element: HTMLElement | null = null;
  private isHovering = false;
  private mousePos = { x: 0, y: 0 };
  
  private radius: number;
  private strength: number;

  constructor(options: BlurHoverOptions = {}) {
    this.radius = options.radius ?? 80;
    this.strength = options.strength ?? 5;
  }

  private onMouseEnter = (): void => {
    this.isHovering = true;
    
    if (this.element) {
      this.element.style.transition = 'filter 0.3s ease';
      this.updateEffect();
    }
  };

  private onMouseLeave = (): void => {
    this.isHovering = false;
    
    if (this.element) {
      this.element.style.removeProperty('filter');
      this.element.style.removeProperty('clip-path');
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.element) return;
    
    const rect = this.element.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    if (this.isHovering) {
      this.updateEffect();
    }
  };

  private updateEffect(): void {
    if (!this.element) return;
    
    // Set custom properties for mouse position
    this.element.style.setProperty('--mx', `${this.mousePos.x}px`);
    this.element.style.setProperty('--my', `${this.mousePos.y}px`);
    
    // Apply blur filter and clip path
    this.element.style.filter = `blur(${this.strength}px)`;
    this.element.style.clipPath = `circle(${this.radius}px at var(--mx) var(--my))`;
  }

  public attach(element: HTMLElement): void {
    this.element = element;
    
    // Store original position value if needed
    const position = window.getComputedStyle(element).position;
    if (position === 'static') {
      element.style.position = 'relative';
    }
    
    // Add event listeners
    this.element.addEventListener('mouseenter', this.onMouseEnter);
    this.element.addEventListener('mouseleave', this.onMouseLeave);
    this.element.addEventListener('mousemove', this.onMouseMove);
  }

  public detach(): void {
    if (!this.element) return;
    
    // Remove event listeners
    this.element.removeEventListener('mouseenter', this.onMouseEnter);
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('mousemove', this.onMouseMove);
    
    // Reset styles
    this.element.style.removeProperty('filter');
    this.element.style.removeProperty('clip-path');
    this.element.style.removeProperty('--mx');
    this.element.style.removeProperty('--my');
  }

  public destroy(): void {
    this.detach();
    this.element = null;
  }
}
