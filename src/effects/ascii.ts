import { HoverEffect } from '../core/types';

export class AsciiHover implements HoverEffect {
  private readonly id: string;
  private element: HTMLImageElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private tempCanvas: HTMLCanvasElement | null = null;
  private tempCtx: CanvasRenderingContext2D | null = null;
  private isHovering = false;
  private mousePos = { x: 0, y: 0 };
  private animationFrame: number | null = null;
  private imageData: ImageData | null = null;
  private lastRenderTime = 0;
  private readonly FPS = 30;
  private readonly frameInterval = 1000 / 30; // 30 FPS
  
  private radius: number;
  private size: number;
  private chars: string[];
  private scale: number;

  constructor(options: { radius?: number; size?: number; chars?: string[] } = {}) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.radius = options.radius ?? 70;
    this.size = options.size ?? 12;
    this.chars = options.chars ?? ['█', '@', '%', '#', '*', '+', '=', '-', ':', '.', ' '];
    this.scale = 0.2;
  }

  private onMouseEnter = (e: MouseEvent): void => {
    if (!this.element || !this.canvas) return;
    
    this.isHovering = true;
    
    const rect = this.element.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    this.canvas.style.opacity = '1';
    this.lastRenderTime = 0; // Reset last render time to force immediate render
    this.render();
  };

  private onMouseLeave = (): void => {
    if (!this.canvas || !this.ctx) return;
    
    this.isHovering = false;
    this.canvas.style.opacity = '0';
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    setTimeout(() => {
      if (!this.isHovering && this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }, 300);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.element) return;
    
    const rect = this.element.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  private updateImageData(): void {
    if (!this.element || !this.tempCanvas || !this.tempCtx) return;
    
    const sw = Math.floor(this.element.width * this.scale);
    const sh = Math.floor(this.element.height * this.scale);
    
    this.tempCanvas.width = sw;
    this.tempCanvas.height = sh;
    this.tempCtx.drawImage(this.element, 0, 0, sw, sh);
    this.imageData = this.tempCtx.getImageData(0, 0, sw, sh);
  }

  private render = (timestamp = 0): void => {
    if (!this.element || !this.canvas || !this.ctx || !this.imageData || !this.isHovering) return;
    
    // Check if enough time has passed since last render
    const elapsed = timestamp - this.lastRenderTime;
    if (elapsed < this.frameInterval) {
      this.animationFrame = requestAnimationFrame(this.render);
      return;
    }
    
    this.lastRenderTime = timestamp;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const sw = Math.floor(width * this.scale);
    const sh = Math.floor(height * this.scale);
    
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.font = `${this.size}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const data = this.imageData.data;
    
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const dx = (x / this.scale);
        const dy = (y / this.scale);
        
        const dist = Math.hypot(dx - this.mousePos.x, dy - this.mousePos.y);
        
        if (dist < this.radius) {
          const index = (y * sw + x) * 4;
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
          
          const time = Date.now() / 150;
          const glitch = Math.sin(time + (x * y) / 1000) * 5;
          const avg = 255 - brightness + glitch;
          
          const charIndex = Math.min(
            Math.max(
              Math.floor((avg / 255) * (this.chars.length - 1)), 
              0
            ), 
            this.chars.length - 1
          );
          
          const alpha = 1 - dist / this.radius;
          
          this.ctx.fillStyle = `rgba(0,0,0,${alpha * 0.8})`;
          this.ctx.fillRect(dx - this.size/2, dy - this.size/2, this.size, this.size);
          
          this.ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          this.ctx.fillText(this.chars[charIndex], dx, dy);
        }
      }
    }
    
    if (this.isHovering) {
      this.animationFrame = requestAnimationFrame(this.render);
    }
  };

  public attach(element: HTMLElement): void {
    if (!(element instanceof HTMLImageElement)) {
      console.error('ASCII effect can only be applied to img elements');
      return;
    }
    
    this.element = element;
    
    const setupEffect = () => {
      // Create main canvas
      const canvas = document.createElement('canvas');
      canvas.width = this.element!.width;
      canvas.height = this.element!.height;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.3s ease';
      canvas.style.pointerEvents = 'none';
      canvas.dataset.asciiId = this.id;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      
      // Create temp canvas
      this.tempCanvas = document.createElement('canvas');
      this.tempCtx = this.tempCanvas.getContext('2d');
      
      // Update image data
      this.updateImageData();
      
      // Create or find wrapper
      let wrapper = this.element!.parentElement;
      if (!wrapper || !wrapper.classList.contains('ascii-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'ascii-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        this.element!.replaceWith(wrapper);
        wrapper.appendChild(this.element!);
      }
      
      // Append canvas to wrapper
      wrapper.appendChild(canvas);
      
      // Add event listeners
      this.element!.addEventListener('mouseenter', this.onMouseEnter);
      this.element!.addEventListener('mouseleave', this.onMouseLeave);
      this.element!.addEventListener('mousemove', this.onMouseMove);
    };
    
    if (element.complete) {
      setupEffect();
    } else {
      element.onload = setupEffect;
    }
  }

  public detach(): void {
    if (!this.element) return;
    
    this.element.removeEventListener('mouseenter', this.onMouseEnter);
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('mousemove', this.onMouseMove);
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    this.canvas?.remove();
  }

  public destroy(): void {
    this.detach();
    this.element = null;
    this.canvas = null;
    this.ctx = null;
    this.tempCanvas = null;
    this.tempCtx = null;
    this.imageData = null;
  }
}
 