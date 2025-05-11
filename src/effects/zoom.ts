import { HoverEffect } from '../core/types';

export class ZoomHover implements HoverEffect {
  private element: HTMLImageElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isHovering = false;
  private mousePos = { x: 0, y: 0 };
  private animationFrame: number | null = null;
  
  private radius: number;
  private scale: number;

  constructor(options: { radius?: number; scale?: number } = {}) {
    this.radius = options.radius ?? 100;
    this.scale = options.scale ?? 1.2;
    console.log(`ZoomHover created with radius=${this.radius}, scale=${this.scale}`);
  }

  private onMouseEnter = (): void => {
    console.log("ZoomHover: mouse entered");
    this.isHovering = true;
    if (this.canvas) {
      this.canvas.style.opacity = '1';
    }
    this.render();
  };

  private onMouseLeave = (): void => {
    console.log("ZoomHover: mouse left");
    this.isHovering = false;
    
    if (this.canvas) {
      this.canvas.style.opacity = '0';
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.element || !this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    if (this.isHovering && !this.animationFrame) {
      this.animationFrame = requestAnimationFrame(() => {
        this.render();
        this.animationFrame = null;
      });
    }
  };

  private render(): void {
    if (!this.element || !this.canvas || !this.ctx) return;

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the original image
    this.ctx.drawImage(this.element, 0, 0, this.canvas.width, this.canvas.height);

    // Create a circular mask
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.mousePos.x, this.mousePos.y, this.radius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.clip();

    // Clear the zoomed area
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate zoom transform
    const zoomX = this.mousePos.x - (this.mousePos.x * this.scale);
    const zoomY = this.mousePos.y - (this.mousePos.y * this.scale);

    // Draw zoomed image
    this.ctx.translate(zoomX, zoomY);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.element, 0, 0, this.canvas.width, this.canvas.height);

    // Restore context
    this.ctx.restore();

    // Draw circle border
    this.ctx.beginPath();
    this.ctx.arc(this.mousePos.x, this.mousePos.y, this.radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  public attach(element: HTMLElement): void {
    if (!(element instanceof HTMLImageElement)) {
      console.error('ZoomHover effect can only be applied to img elements');
      return;
    }

    console.log(`Attaching zoom effect to element: ${element.tagName}${element.id ? '#'+element.id : ''}`);
    this.element = element;

    const setupEffect = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = this.element!.width;
      canvas.height = this.element!.height;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.3s ease';
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      // Create wrapper if needed
      let wrapper = this.element!.parentElement;
      if (!wrapper || !wrapper.classList.contains('zoom-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'zoom-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        this.element!.replaceWith(wrapper);
        wrapper.appendChild(this.element!);
      }

      // Add canvas to wrapper
      wrapper.appendChild(canvas);

      // Add event listeners
      wrapper.addEventListener('mouseenter', this.onMouseEnter);
      wrapper.addEventListener('mouseleave', this.onMouseLeave);
      wrapper.addEventListener('mousemove', this.onMouseMove);

      console.log('Zoom effect setup complete');
    };

    if (element.complete) {
      setupEffect();
    } else {
      element.onload = setupEffect;
    }
  }

  public detach(): void {
    if (!this.element) return;
    
    // Remove event listeners
    const wrapper = this.element.parentElement;
    if (wrapper) {
      wrapper.removeEventListener('mouseenter', this.onMouseEnter);
      wrapper.removeEventListener('mouseleave', this.onMouseLeave);
      wrapper.removeEventListener('mousemove', this.onMouseMove);

      // Unwrap the element
      if (wrapper.classList.contains('zoom-wrapper')) {
        wrapper.replaceWith(this.element);
      }
    }
    
    // Remove canvas
    this.canvas?.remove();
    
    // Reset state
    this.canvas = null;
    this.ctx = null;
  }

  public destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.detach();
    this.element = null;
  }
}
 