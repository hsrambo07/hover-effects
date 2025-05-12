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
  private aspectRatio: number = 1;

  constructor(options: { radius?: number; scale?: number } = {}) {
    this.radius = options.radius ?? 70;
    this.scale = options.scale ?? 1.1;
  }

  private onMouseEnter = (e: MouseEvent): void => {
    if (!this.element || !this.canvas) return;
    this.isHovering = true;
    if (this.canvas) {
      this.canvas.style.opacity = '1';
    }
    this.render();
  };

  private onMouseLeave = (): void => {
    if (!this.element || !this.canvas) return;
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
    
    // Get accurate cursor position relative to the canvas
    const rect = this.canvas.getBoundingClientRect();
    
    // Calculate the scale factors between the canvas's display size and its internal size
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    // Convert the mouse position to canvas coordinates
    this.mousePos = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
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

    // Get the aspect ratio correction for the canvas
    const rect = this.canvas.getBoundingClientRect();
    const displayAspectRatio = rect.width / rect.height;
    const canvasAspectRatio = this.canvas.width / this.canvas.height;
    const aspectCorrection = displayAspectRatio / canvasAspectRatio;

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the original image
    this.ctx.drawImage(this.element, 0, 0, this.canvas.width, this.canvas.height);

    // Create a circular mask
    this.ctx.save();
    
    // Apply aspect ratio correction to make the circle appear circular on screen
    if (aspectCorrection !== 1) {
      this.ctx.setTransform(
        1, 0, 0,
        1, this.mousePos.x, this.mousePos.y
      );
      if (aspectCorrection > 1) {
        // Width is stretched relative to height, compress horizontally
        this.ctx.scale(1/aspectCorrection, 1);
      } else {
        // Height is stretched relative to width, compress vertically
        this.ctx.scale(1, aspectCorrection);
      }
      this.ctx.translate(-this.mousePos.x, -this.mousePos.y);
    }
    
    // Now draw a perfect circle that will appear circular despite aspect ratio distortion
    this.ctx.beginPath();
    this.ctx.arc(this.mousePos.x, this.mousePos.y, this.radius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.clip();
    
    // Restore the transform for further drawing
    if (aspectCorrection !== 1) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Clear the zoomed area
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate zoom transform
    const zoomX = this.mousePos.x - (this.mousePos.x * this.scale);
    const zoomY = this.mousePos.y - (this.mousePos.y * this.scale);

    // Draw zoomed image
    this.ctx.translate(zoomX, zoomY);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.element, 0, 0, this.canvas.width, this.canvas.height);

    // Restore context to draw border
    this.ctx.restore();

    // Apply the same aspect correction for the border
    this.ctx.save();
    if (aspectCorrection !== 1) {
      this.ctx.setTransform(
        1, 0, 0,
        1, this.mousePos.x, this.mousePos.y
      );
      if (aspectCorrection > 1) {
        this.ctx.scale(1/aspectCorrection, 1);
      } else {
        this.ctx.scale(1, aspectCorrection);
      }
      this.ctx.translate(-this.mousePos.x, -this.mousePos.y);
    }

    // Draw circle border
    this.ctx.beginPath();
    this.ctx.arc(this.mousePos.x, this.mousePos.y, this.radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    
    // Restore transform
    this.ctx.restore();
  }

  public attach(element: HTMLElement): void {
    if (!(element instanceof HTMLImageElement)) {
      return;
    }

    this.element = element;

    const setupEffect = () => {
      // Create canvas with the actual dimensions of the image
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
      
      // Get context with imageSmoothingEnabled for better quality
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      
      if (this.ctx) {
        // Enable high-quality image scaling
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
      }

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
  
  public setRadius(radius: number): void {
    this.radius = radius;
  }
  
  public setScale(scale: number): void {
    this.scale = scale;
  }
}
 