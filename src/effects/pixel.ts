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
    this.blockSize = options.blockSize ?? 6;
    this.radius = options.radius ?? 130;
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
        if (data[i + 3] < 120) continue; // Skip transparent pixels
        this.samples.push({
          x,
          y,
          color: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`
        });
      }
    }

    console.log(`Created ${this.samples.length} pixel samples`);
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
    }

    this.animationFrame = requestAnimationFrame(this.render);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.element || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    this.cursor.x = (e.clientX - rect.left) * scaleX;
    this.cursor.y = (e.clientY - rect.top) * scaleY;
    this.cursor.active = true;

    if (!this.canvas.style.opacity) {
      this.canvas.style.opacity = '1';
    }
  };

  private onMouseEnter = (): void => {
    if (this.canvas) {
      this.canvas.style.opacity = '1';
    }
  };

  private onMouseLeave = (): void => {
    if (this.canvas) {
      this.canvas.style.opacity = '0';
      this.cursor.active = false;
    }
  };

  public attach(element: HTMLElement): void {
    if (!(element instanceof HTMLImageElement)) {
      console.error('PixelHover effect can only be applied to img elements');
      return;
    }

    this.element = element;

    const setupEffect = () => {
      // Create canvas at the same size as the image
      const canvas = document.createElement('canvas');
      canvas.width = element.naturalWidth;
      canvas.height = element.naturalHeight;
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

      // Start animation
      this.animationFrame = requestAnimationFrame(this.render);

      // Add event listeners
      wrapper.addEventListener('mousemove', this.onMouseMove);
      wrapper.addEventListener('mouseenter', this.onMouseEnter);
      wrapper.addEventListener('mouseleave', this.onMouseLeave);

      console.log(`Pixel effect setup complete. Canvas size: ${canvas.width}x${canvas.height}`);
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
    this.blockSize = blockSize;
    if (this.isSetup) {
      this.sampleImage(); // Recreate samples with new block size
    }
  }
  
  public setRadius(radius: number): void {
    this.radius = radius;
  }
} 