import { HoverEffect } from '../core/types';

export class LegoHover implements HoverEffect {
  private element: HTMLImageElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isHovering = false;
  private mousePos = { x: 0, y: 0 };
  private animationFrame: number | null = null;
  private bricks: Array<{ x: number; y: number; rgb: number[] }> = [];
  
  private blockSize: number;
  private gap: number;
  private studScale: number;
  private depth: number;
  private radius: number;
  private softEdge: number;
  private fadeExp: number;

  constructor(options: { 
    blockSize?: number;
    gap?: number;
    studScale?: number;
    depth?: number;
    radius?: number;
    softEdge?: number;
    fadeExp?: number;
  } = {}) {
    // Initialize with defaults or provided options
    this.blockSize = options.blockSize ?? 20;
    this.gap = options.gap ?? 2;
    this.studScale = options.studScale ?? 0.4;
    this.depth = options.depth ?? 0.3;
    this.radius = options.radius ?? 140;
    this.softEdge = options.softEdge ?? 90;
    this.fadeExp = options.fadeExp ?? 1.4;
  }

  // Helper function to shade colors
  private shade(rgb: number[], k: number): string {
    return `rgb(${rgb.map(v => Math.max(0, Math.min(255, v * (1 + k))) | 0).join(',')})`;
  }

  // Sample colors from the source image
  private sample(): void {
    if (!this.element || !this.canvas) return;
    
    this.canvas.width = this.element.naturalWidth;
    this.canvas.height = this.element.naturalHeight;
    this.bricks = [];

    // Create an offscreen canvas for sampling
    const offCanvas = document.createElement('canvas');
    offCanvas.width = this.element.naturalWidth;
    offCanvas.height = this.element.naturalHeight;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;
    
    offCtx.drawImage(this.element, 0, 0);
    const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imageData.data;

    for (let y = 0; y < offCanvas.height; y += this.blockSize) {
      for (let x = 0; x < offCanvas.width; x += this.blockSize) {
        const i = (y * offCanvas.width + x) * 4;
        if (data[i + 3] < 50) continue; // Skip transparent pixels
        this.bricks.push({ 
          x, 
          y, 
          rgb: [data[i], data[i + 1], data[i + 2]] 
        });
      }
    }
  }

  // Draw a single LEGO brick
  private drawBrick(brick: { x: number; y: number; rgb: number[] }, alpha: number): void {
    if (!this.ctx) return;
    
    const s = this.blockSize;
    const { x, y, rgb } = brick;
    const studR = this.studScale * s * 0.5;
    
    // Enhanced depth effects - more dramatic shading
    const depthEffect = this.depth * 1.5; // Amplify depth effect by 50%
    const topClr = this.shade(rgb, depthEffect);        // stronger lighten
    const rightClr = this.shade(rgb, -depthEffect);     // stronger darken
    const bottomClr = this.shade(rgb, -depthEffect * 1.5); // even darker
    
    const gx = this.gap;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    
    // Calculate corner radius based on softEdge parameter (normalized to brick size)
    // Using a non-linear scale to prevent extreme rounding
    // softEdge values: 30-150 -> cornerRadius values: 0-s/4
    const normalizedSoftEdge = (this.softEdge - 30) / (150 - 30); // 0 to 1
    const maxCornerRadius = s/4;
    // Use a square root curve for more natural progression
    const cornerRadius = Math.sqrt(normalizedSoftEdge) * maxCornerRadius;
    
    // Brick top face with rounded corners
    this.ctx.fillStyle = topClr;
    this.ctx.beginPath();
    
    // Draw rounded rectangle using arc commands
    // Top-left corner
    this.ctx.moveTo(x + gx + cornerRadius, y + gx);
    // Top edge
    this.ctx.lineTo(x + s - gx - cornerRadius, y + gx);
    // Top-right corner
    this.ctx.arcTo(x + s - gx, y + gx, x + s - gx, y + gx + cornerRadius, cornerRadius);
    // Right edge
    this.ctx.lineTo(x + s - gx, y + s - gx - cornerRadius);
    // Bottom-right corner
    this.ctx.arcTo(x + s - gx, y + s - gx, x + s - gx - cornerRadius, y + s - gx, cornerRadius);
    // Bottom edge
    this.ctx.lineTo(x + gx + cornerRadius, y + s - gx);
    // Bottom-left corner
    this.ctx.arcTo(x + gx, y + s - gx, x + gx, y + s - gx - cornerRadius, cornerRadius);
    // Left edge
    this.ctx.lineTo(x + gx, y + gx + cornerRadius);
    // Top-left corner
    this.ctx.arcTo(x + gx, y + gx, x + gx + cornerRadius, y + gx, cornerRadius);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Right bevel - simplified with transparency gradient
    this.ctx.fillStyle = rightClr;
    this.ctx.beginPath();
    this.ctx.moveTo(x + s - gx, y + gx + cornerRadius);
    this.ctx.lineTo(x + s, y + gx + cornerRadius);
    this.ctx.lineTo(x + s, y + s - gx);
    this.ctx.lineTo(x + s - gx, y + s - gx - cornerRadius);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Bottom bevel - simplified with transparency gradient
    this.ctx.fillStyle = bottomClr;
    this.ctx.beginPath();
    this.ctx.moveTo(x + gx + cornerRadius, y + s - gx);
    this.ctx.lineTo(x + s - gx - cornerRadius, y + s - gx);
    this.ctx.lineTo(x + s - gx, y + s);
    this.ctx.lineTo(x + gx, y + s);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Mortar gap - simplified
    this.ctx.fillStyle = 'rgb(35,35,35)';
    this.ctx.fillRect(x, y, cornerRadius, s);     // left seam
    this.ctx.fillRect(x, y, s, cornerRadius);     // top seam
    
    // Draw enhanced stud - ALWAYS in the exact center regardless of corner radius
    const midX = x + s / 2;
    const midY = y + s / 2;
    
    // Enhanced 3D stud with better circles and lighting
    
    // Stud base shadow for depth
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, studR + 1, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
    this.ctx.fill();
    
    // Stud base
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, studR, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fillStyle = this.shade(rgb, -this.depth * 0.3);
    this.ctx.fill();
    
    // Improve circle rendering with stroke
    this.ctx.lineWidth = Math.max(1, s / 24);
    this.ctx.strokeStyle = this.shade(rgb, -this.depth * 0.4);
    this.ctx.stroke();
    
    // Stud top highlight (slightly smaller)
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, studR * 0.8, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fillStyle = this.shade(rgb, this.depth * 0.5);
    this.ctx.fill();
    
    // Stud highlight dot for 3D appearance - adjusted position for better consistency
    const highlightOffsetRatio = 0.2; // Consistent ratio regardless of stud size
    this.ctx.beginPath();
    this.ctx.arc(
      midX - studR * highlightOffsetRatio, 
      midY - studR * highlightOffsetRatio, 
      studR * 0.25, 
      0, Math.PI * 2
    );
    this.ctx.closePath();
    this.ctx.fillStyle = this.shade(rgb, this.depth * 2.0);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  // Main render function
  private render = (): void => {
    if (!this.element || !this.canvas || !this.ctx || !this.isHovering) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.isHovering) {
      this.bricks.forEach(brick => {
        const distance = Math.hypot(brick.x - this.mousePos.x, brick.y - this.mousePos.y);
        if (distance < this.radius + this.softEdge) {
          // Enhanced edge calculation for more dramatic softness effect
          let base;
          if (distance < this.radius) {
            base = 1; 
          } else {
            // Enhanced soft edge calculation - more dramatic transition
            const edgePct = (distance - this.radius) / this.softEdge;
            base = 1 - Math.pow(edgePct, 0.8); // More visible edge transition
          }
          
          // Enhanced fade exponent effect
          const alpha = Math.pow(base, this.fadeExp);
          this.drawBrick(brick, alpha);
        }
      });
    }
    
    this.animationFrame = requestAnimationFrame(this.render);
  };
  
  private onMouseEnter = (e: MouseEvent): void => {
    if (!this.element || !this.canvas) return;
    
    this.isHovering = true;
    this.canvas.style.opacity = '1';
    
    // Get initial mouse position
    const rect = this.element.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    this.mousePos = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
    
    if (!this.animationFrame) {
      this.render();
    }
  };
  
  private onMouseLeave = (): void => {
    if (!this.canvas) return;
    
    this.isHovering = false;
    this.canvas.style.opacity = '0';
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  };
  
  private onMouseMove = (e: MouseEvent): void => {
    if (!this.element || !this.canvas) return;
    
    const rect = this.element.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    this.mousePos = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };
  
  // Implement HoverEffect interface methods
  public attach(element: HTMLElement): void {
    if (!(element instanceof HTMLImageElement)) {
      console.error('LegoHover effect can only be applied to img elements');
      return;
    }
    
    this.element = element;
    
    const setupEffect = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
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
      if (!wrapper || !wrapper.classList.contains('lego-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'lego-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        
        this.element!.replaceWith(wrapper);
        wrapper.appendChild(this.element!);
      }
      
      // Add canvas to wrapper
      wrapper.appendChild(canvas);
      
      // Sample the image to create brick data
      this.sample();
      
      // Add event listeners
      wrapper.addEventListener('mouseenter', this.onMouseEnter);
      wrapper.addEventListener('mouseleave', this.onMouseLeave);
      wrapper.addEventListener('mousemove', this.onMouseMove);
      
      // Add resize listener for responsive behavior
      window.addEventListener('resize', () => {
        this.sample();
      });
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
      
      // Unwrap element if needed
      if (wrapper.classList.contains('lego-wrapper')) {
        wrapper.replaceWith(this.element);
      }
    }
    
    // Remove resize listener
    window.removeEventListener('resize', this.sample);
    
    // Remove canvas
    this.canvas?.remove();
    
    // Clean up
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
    this.bricks = [];
  }
  
  // Setters for runtime configuration
  public setBlockSize(size: number): void {
    this.blockSize = size;
    this.sample();
  }
  
  public setRadius(radius: number): void {
    this.radius = radius;
  }
  
  public setGap(gap: number): void {
    this.gap = gap;
    this.sample();
  }
  
  public setStudScale(scale: number): void {
    this.studScale = scale;
  }
  
  public setDepth(depth: number): void {
    this.depth = depth;
  }
  
  public setSoftEdge(edge: number): void {
    this.softEdge = edge;
  }
  
  public setFadeExp(exp: number): void {
    this.fadeExp = exp;
  }
} 