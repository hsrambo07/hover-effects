import { HoverEffect } from '../core/types';

export class PixelHover implements HoverEffect {
  private element: HTMLImageElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private samples: Array<{ x: number; y: number; color: string }> = [];
  private cursor = { x: 0, y: 0, active: false };
  private animationFrame: number | null = null;
  private isSetup = false;

  // Configuration
  private blockSize: number;
  private radius: number;
  private readonly softEdge: number;
  private readonly fadeExp: number;

  constructor(options: { blockSize?: number; radius?: number } = {}) {
    // Initialize properties first with defaults
    this.blockSize = 16; // Default
    this.radius = 130; // Default

    // Override with options if provided
    if (options.blockSize !== undefined) this.blockSize = options.blockSize;
    if (options.radius !== undefined) this.radius = options.radius;

    // Now calculate dependent properties
    this.softEdge = Math.min(70, this.radius / 2);
    this.fadeExp = 1.4;
  }

  private sampleImage(): void {
    if (!this.element || !this.canvas || !this.ctx) return;

    // Create offscreen canvas
    const off = document.createElement('canvas');
    off.width = this.canvas.width;
    off.height = this.canvas.height;
    const offCtx = off.getContext('2d');
    if (!offCtx) return;

    // Draw image to offscreen canvas
    offCtx.drawImage(this.element, 0, 0, off.width, off.height);
    const { data } = offCtx.getImageData(0, 0, off.width, off.height);

    // Clear existing samples
    this.samples = [];
    
    // Sample pixels
    for (let y = 0; y < off.height; y += this.blockSize) {
      for (let x = 0; x < off.width; x += this.blockSize) {
        const i = (y * off.width + x) * 4;
        if (i >= data.length || data[i + 3] < 120) continue; // Skip transparent pixels or out of bounds
        this.samples.push({
          x,
          y,
          color: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`
        });
      }
    }
  }

  private render = (): void => {
    if (!this.canvas || !this.ctx || !this.isSetup) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.cursor.active) {
      this.samples.forEach(s => {
        const dist = Math.hypot(s.x - this.cursor.x, s.y - this.cursor.y);
        if (dist < this.radius + this.softEdge) {
          const base = dist < this.radius ? 1 : 1 - (dist - this.radius) / this.softEdge;
          const eased = Math.pow(base, this.fadeExp);

          this.ctx!.fillStyle = s.color;
          this.ctx!.globalAlpha = eased;
          this.ctx!.fillRect(s.x, s.y, this.blockSize, this.blockSize);
        }
      });
      
      // Only continue animation if cursor is active
      this.animationFrame = requestAnimationFrame(this.render);
    } else {
      // Stop animation when cursor is not active
      this.animationFrame = null;
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.element || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    this.cursor.x = (e.clientX - rect.left) * scaleX;
    this.cursor.y = (e.clientY - rect.top) * scaleY;
    this.cursor.active = true;

    if (!this.canvas.style.opacity || this.canvas.style.opacity === '0') {
      this.canvas.style.opacity = '1';
    }
    
    // Start animation if not already running
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(this.render);
    }
  };

  private onMouseEnter = (): void => {
    if (this.canvas) {
      this.canvas.style.opacity = '1';
    }
    this.cursor.active = true;
    
    // Start animation
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(this.render);
    }
  };

  private onMouseLeave = (): void => {
    if (this.canvas) {
      this.canvas.style.opacity = '0';
    }
    this.cursor.active = false;
    
    // Animation will stop automatically in render loop when cursor.active is false
  };

  public attach(element: HTMLElement): void {
    if (!(element instanceof HTMLImageElement)) {
      return;
    }

    this.element = element;

    const setupEffect = () => {
      // Create canvas using displayed dimensions instead of natural dimensions
      const canvas = document.createElement('canvas');
      
      // Get the displayed dimensions of the image
      const rect = element.getBoundingClientRect();
      let width = rect.width;
      let height = rect.height;
      
      // Fallback to natural dimensions if displayed dimensions are 0
      if (width <= 0 || height <= 0) {
        width = element.naturalWidth || 300; // Default fallback
        height = element.naturalHeight || 200; // Default fallback
        console.warn('Using fallback dimensions for pixel canvas:', width, height);
      }
      
      canvas.width = width;
      canvas.height = height;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.25s ease';
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      // Create wrapper if needed
      let wrapper = element.parentElement;
      if (!wrapper || !wrapper.classList.contains('pixel-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'pixel-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        element.replaceWith(wrapper);
        wrapper.appendChild(element);
      }

      // Add canvas to wrapper
      wrapper.appendChild(canvas);

      // Sample image and create pixels
      this.sampleImage();
      this.isSetup = true;

      // Add event listeners
      wrapper.addEventListener('mousemove', this.onMouseMove);
      wrapper.addEventListener('mouseenter', this.onMouseEnter);
      wrapper.addEventListener('mouseleave', this.onMouseLeave);
      
      console.log(`Pixel effect setup complete. Canvas size: ${canvas.width}x${canvas.height}, Samples: ${this.samples.length}`);
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
      wrapper.removeEventListener('mousemove', this.onMouseMove);
      wrapper.removeEventListener('mouseenter', this.onMouseEnter);
      wrapper.removeEventListener('mouseleave', this.onMouseLeave);
    }

    // Stop animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Remove canvas
    this.canvas?.remove();

    // Reset state
    this.samples = [];
    this.isSetup = false;
  }

  public destroy(): void {
    this.detach();
    this.element = null;
    this.canvas = null;
    this.ctx = null;
  }

  public setBlockSize(blockSize: number): void {
    if (blockSize === this.blockSize) {
      return;
    }
    this.blockSize = blockSize;
    if (this.isSetup) {
      // Force canvas clear
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      
      // Store cursor state
      const cursorWasActive = this.cursor.active;
      
      // Temporarily deactivate cursor to prevent rendering during sampling
      this.cursor.active = false;
      
      // Recreate samples with new block size
      this.sampleImage();
      
      // Restore cursor state
      this.cursor.active = cursorWasActive;
      
      // Force immediate render with new samples
      if (this.cursor.active) {
        this.render();
      }
    } else {
    }
  }
  
  public setRadius(radius: number): void {
    this.radius = radius;
  }

  // Getter methods for debugging
  public getBlockSize(): number {
    return this.blockSize;
  }

  public getRadius(): number {
    return this.radius;
  }

  public getSamplesCount(): number {
    return this.samples.length;
  }

  public getDebugInfo(): object {
    return {
      blockSize: this.blockSize,
      radius: this.radius,
      samplesCount: this.samples.length,
      isSetup: this.isSetup,
      cursorActive: this.cursor.active,
      canvasSize: this.canvas ? { 
        width: this.canvas.width, 
        height: this.canvas.height
      } : null
    };
  }
} 