import { HoverEffect } from '../core/types';

export class MinecraftHover implements HoverEffect {
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
    console.log('Initializing MinecraftHover with explicit options:', options);
    // Use the provided blockSize or 28 as default (not 6)
    this.blockSize = options.blockSize !== undefined ? options.blockSize : 28;
    this.radius = options.radius !== undefined ? options.radius : 130;
    console.log(`Constructor set blockSize=${this.blockSize}, radius=${this.radius}`);
    this.softEdge = Math.min(70, this.radius / 2);
    this.fadeExp = 1.4;
  }

  private shadeColor(color: string, percent: number): string {
    // Parse RGB components from the color string
    const rgbValues = color.slice(4, color.length - 1).split(',');
    const r = parseInt(rgbValues[0], 10);
    const g = parseInt(rgbValues[1], 10);
    const b = parseInt(rgbValues[2], 10);
    
    // Apply shading to each component individually
    const t = percent < 0 ? 0 : 255;
    const p = percent < 0 ? percent * -1 : percent;
    
    const R = r + Math.round((t - r) * p);
    const G = g + Math.round((t - g) * p);
    const B = b + Math.round((t - b) * p);
    
    return `rgb(${R}, ${G}, ${B})`;
  }

  private sampleImage(): void {
    if (!this.element || !this.canvas || !this.ctx) return;

    // Create offscreen canvas for sampling
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

    console.log(`Sampling image with block size: ${this.blockSize}, canvas size: ${off.width}x${off.height}`);
    
    // Sample pixels at block intervals
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

    console.log(`Created ${this.samples.length} voxel samples`);
  }

  private drawVoxel(sample: { x: number; y: number; color: string }, elevation: number): void {
    if (!this.ctx) return;

    // Use current block size for drawing
    const size = this.blockSize;
    const half = size / 2;
    const elev = elevation * size * 0.7;

    // Draw front face
    this.ctx.fillStyle = sample.color;
    this.ctx.globalAlpha = elevation;
    this.ctx.fillRect(sample.x, sample.y - elev, size, size);

    // Draw top face (lighter)
    this.ctx.fillStyle = this.shadeColor(sample.color, 0.25);
    this.ctx.beginPath();
    this.ctx.moveTo(sample.x, sample.y - elev);
    this.ctx.lineTo(sample.x + half, sample.y - half - elev);
    this.ctx.lineTo(sample.x + size + half, sample.y - half - elev);
    this.ctx.lineTo(sample.x + size, sample.y - elev);
    this.ctx.closePath();
    this.ctx.fill();

    // Draw side face (darker)
    this.ctx.fillStyle = this.shadeColor(sample.color, -0.25);
    this.ctx.beginPath();
    this.ctx.moveTo(sample.x + size, sample.y - elev);
    this.ctx.lineTo(sample.x + size + half, sample.y - half - elev);
    this.ctx.lineTo(sample.x + size + half, sample.y + size - half - elev);
    this.ctx.lineTo(sample.x + size, sample.y + size - elev);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private render = (): void => {
    if (!this.canvas || !this.ctx || !this.isSetup) return;

    // Clear the canvas for a fresh frame
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.cursor.active) {
      // Use current block size for drawing
      const currentBlockSize = this.blockSize;
      
      // Draw samples that are within the effect radius
      this.samples.forEach(sample => {
        const dist = Math.hypot(sample.x - this.cursor.x, sample.y - this.cursor.y);
        if (dist < this.radius + this.softEdge) {
          const base = dist < this.radius ? 1 : 1 - (dist - this.radius) / this.softEdge;
          const eased = Math.pow(base, this.fadeExp);
          this.drawVoxel(sample, eased);
        }
      });
    }

    this.animationFrame = requestAnimationFrame(this.render);
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

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.element || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    this.cursor.x = (e.clientX - rect.left) * scaleX;
    this.cursor.y = (e.clientY - rect.top) * scaleY;
    this.cursor.active = true;
  };

  public attach(element: HTMLElement): void {
    if (!(element instanceof HTMLImageElement)) {
      console.error('Minecraft effect can only be applied to img elements');
      return;
    }

    this.element = element;

    const setupEffect = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = this.element!.naturalWidth || this.element!.width;
      canvas.height = this.element!.naturalHeight || this.element!.height;
      
      console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
      console.log(`Using block size: ${this.blockSize}`);
      
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
      let wrapper = this.element!.parentElement;
      if (!wrapper || !wrapper.classList.contains('minecraft-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'minecraft-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        this.element!.replaceWith(wrapper);
        wrapper.appendChild(this.element!);
      }

      // Add canvas to wrapper
      wrapper.appendChild(canvas);

      // Sample image with current block size
      this.sampleImage();
      this.isSetup = true;

      // Start animation
      this.animationFrame = requestAnimationFrame(this.render);

      // Add event listeners
      wrapper.addEventListener('mouseenter', this.onMouseEnter);
      wrapper.addEventListener('mouseleave', this.onMouseLeave);
      wrapper.addEventListener('mousemove', this.onMouseMove);

      console.log('Minecraft effect setup complete');
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
    console.log(`Setting block size from ${this.blockSize} to: ${blockSize}`);
    
    // Only update if the value actually changed
    if (this.blockSize !== blockSize) {
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
        
        console.log(`Block size updated to ${blockSize}, created ${this.samples.length} samples`);
      } else {
        console.log('Block size updated but effect not yet set up, will apply on setup');
      }
    } else {
      console.log('Block size unchanged, skipping update');
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