import { HoverEffect } from '../core/types';

interface ZoomHoverOptions {
  radius?: number;
  scale?: number;
}

export class ZoomHover implements HoverEffect {
  private element: HTMLElement | null = null;
  private isHovering = false;
  private mousePos = { x: 0, y: 0 };
  
  private radius: number;
  private scale: number;

  constructor(options: ZoomHoverOptions = {}) {
    this.radius = options.radius ?? 100;
    this.scale = options.scale ?? 1.2;
  }

  private onMouseEnter = (): void => {
    this.isHovering = true;
    
    if (this.element) {
      this.element.style.transition = 'transform 0.3s ease';
      this.updateEffect();
    }
  };

  private onMouseLeave = (): void => {
    this.isHovering = false;
    
    if (this.element) {
      this.element.style.transform = 'scale(1)';
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
    
    // Apply zoom transform and clip path
    this.element.style.transform = `scale(${this.scale})`;
    this.element.style.clipPath = `circle(${this.radius}px at var(--mx) var(--my))`;
  }

  public attach(element: HTMLElement): void {
    this.element = element;
    
    // Store original position value if needed
    const position = window.getComputedStyle(element).position;
    if (position === 'static') {
      element.style.position = 'relative';
    }
    
    // Set transform origin center
    element.style.transformOrigin = 'center';
    
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
    this.element.style.removeProperty('transform');
    this.element.style.removeProperty('clip-path');
    this.element.style.removeProperty('--mx');
    this.element.style.removeProperty('--my');
    this.element.style.removeProperty('transform-origin');
  }

  public destroy(): void {
    this.detach();
    this.element = null;
  }
}
