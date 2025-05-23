import { HoverEffect } from '../core/types';

export class ParticleDust implements HoverEffect {
  private element: HTMLImageElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Array<{
    homeX: number;
    homeY: number;
    dir: { dx: number; dy: number };
    color: string;
    wobVec: { dx: number; dy: number };
    wobAmp: number;
    wobSpeed: number;
    phase: number;
  }> = [];
  private cursor = { x: 0, y: 0, active: false };
  private animationFrame: number | null = null;
  private isSetup = false;

  // Configuration
  private spacing: number;
  private radius: number;
  private maxDrift: number;
  private homeJitter: number;
  private softEdge: number;
  private fadeExp: number;
  private wobbleAmpMin: number;
  private wobbleAmpMax: number;
  private wobbleSpeedMin: number;
  private wobbleSpeedMax: number;

  constructor(options: { spacing?: number; maxDrift?: number; radius?: number } = {}) {
    // Core configuration
    this.spacing = options.spacing ?? 2;
    this.radius = options.radius ?? 110;
    this.maxDrift = options.maxDrift ?? 28;
    
    // Fixed configuration
    this.homeJitter = this.spacing / 2;
    this.softEdge = Math.min(40, this.radius / 3);
    this.fadeExp = 1.2;
    this.wobbleAmpMin = 1;
    this.wobbleAmpMax = 2;
    this.wobbleSpeedMin = 0.4;
    this.wobbleSpeedMax = 0.8;
  }

  private createParticles(): void {
    if (!this.element || !this.canvas || !this.ctx) return;

    // Create offscreen canvas for image processing
    const off = document.createElement('canvas');
    off.width = this.canvas.width;
    off.height = this.canvas.height;
    const offCtx = off.getContext('2d');
    if (!offCtx) return;

    // Draw image to offscreen canvas
    offCtx.drawImage(this.element, 0, 0, off.width, off.height);
    const { data } = offCtx.getImageData(0, 0, off.width, off.height);

    // Clear existing particles
    this.particles = [];

    // Create particles
    for (let y = 0; y < off.height; y += this.spacing) {
      for (let x = 0; x < off.width; x += this.spacing) {
        const i = (y * off.width + x) * 4;
        if (data[i + 3] < 120) continue; // Skip transparent/very dark pixels

        const color = `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
        const homeX = x + (Math.random() * 2 - 1) * this.homeJitter;
        const homeY = y + (Math.random() * 2 - 1) * this.homeJitter;

        // Outward direction for explode drift
        const dirAng = Math.random() * Math.PI * 2;
        const dir = { dx: Math.cos(dirAng), dy: Math.sin(dirAng) };

        // Wobble parameters
        const wobAng = Math.random() * Math.PI * 2;
        const wobVec = { dx: Math.cos(wobAng), dy: Math.sin(wobAng) };
        const wobAmp = this.wobbleAmpMin + Math.random() * (this.wobbleAmpMax - this.wobbleAmpMin);
        const wobSpeed = this.wobbleSpeedMin + Math.random() * (this.wobbleSpeedMax - this.wobbleSpeedMin);
        const phase = Math.random() * Math.PI * 2;

        this.particles.push({ homeX, homeY, dir, color, wobVec, wobAmp, wobSpeed, phase });
      }
    }

    console.log(`Created ${this.particles.length} particles`);
  }

  private render = (time: number): void => {
    if (!this.canvas || !this.ctx || !this.isSetup || !this.element) return;

    const t = time * 0.001; // ms->sec
    
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw the original image first
    this.ctx.drawImage(this.element, 0, 0);

    if (this.cursor.active) {
      // Create a clipping region for the particle effect
      this.ctx.save();
      this.ctx.beginPath();
      
      // Use a slightly randomized edge for more natural look
      const edgeJitter = 3; // Small amount of edge randomness
      const segments = 40; // More segments = smoother but more expensive
      const radius = this.radius + this.softEdge;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const jitter = 1 + (Math.sin(t * 0.5 + angle * 5) * 0.5 + 0.5) * (edgeJitter / radius);
        const x = this.cursor.x + Math.cos(angle) * radius * jitter;
        const y = this.cursor.y + Math.sin(angle) * radius * jitter;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.closePath();
      this.ctx.clip();
      
      // Clear the area where particles will be drawn
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.particles.forEach(p => {
        const dist = Math.hypot(p.homeX - this.cursor.x, p.homeY - this.cursor.y);
        const effectRadius = this.radius;
        
        if (dist < effectRadius + this.softEdge) {
          // Eased 0..1 within influence - smoother transition function
          const base = dist < effectRadius 
            ? 1 
            : 1 - Math.pow((dist - effectRadius) / this.softEdge, 2); // Quadratic falloff
          
          const eased = Math.pow(base, this.fadeExp);
          const drift = eased * this.maxDrift;

          // Base exploded position
          let px = p.homeX + p.dir.dx * drift;
          let py = p.homeY + p.dir.dy * drift;

          // Add wobble
          const wobble = Math.sin(t * p.wobSpeed + p.phase) * p.wobAmp * eased;
          px += p.wobVec.dx * wobble;
          py += p.wobVec.dy * wobble;

          this.ctx!.globalAlpha = 0.15 + 0.85 * eased;
          this.ctx!.fillStyle = p.color;
          this.ctx!.fillRect(px, py, this.spacing, this.spacing);
        }
      });
      
      this.ctx.restore();
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
    
    // Log occasionally for debugging
    if (Math.random() < 0.01) { // Log only 1% of the time to avoid console spam
      console.log('Cursor active:', {
        x: this.cursor.x, 
        y: this.cursor.y, 
        maxDrift: this.maxDrift,
        radius: this.radius
      });
    }
  };

  private onMouseLeave = (): void => {
    this.cursor.active = false;
  };

  public attach(element: HTMLElement): void {
    if (!(element instanceof HTMLImageElement)) {
      console.error('ParticleDust effect can only be applied to img elements');
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
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      // Create wrapper if needed
      let wrapper = element.parentElement;
      if (!wrapper || !wrapper.classList.contains('particle-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'particle-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        element.replaceWith(wrapper);
        wrapper.appendChild(element);
      }

      // Add canvas to wrapper
      wrapper.appendChild(canvas);

      // Create particles
      this.createParticles();
      this.isSetup = true;

      // Start animation
      this.animationFrame = requestAnimationFrame(this.render);

      // Add event listeners
      wrapper.addEventListener('mousemove', this.onMouseMove);
      wrapper.addEventListener('mouseleave', this.onMouseLeave);
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
    this.particles = [];
    this.isSetup = false;
  }

  public destroy(): void {
    this.detach();
    this.element = null;
    this.canvas = null;
    this.ctx = null;
  }

  public setSpacing(spacing: number): void {
    this.spacing = spacing;
    this.homeJitter = spacing / 2;
    // Recreate particles with new spacing
    if (this.isSetup) {
      this.createParticles();
    }
  }
  
  public setMaxDrift(maxDrift: number): void {
    console.log(`[CRITICAL] ParticleDust.setMaxDrift: ${this.maxDrift} → ${maxDrift}`);
    this.maxDrift = maxDrift;
  }
  
  public setRadius(radius: number): void {
    this.radius = radius;
    this.softEdge = Math.min(40, this.radius / 3);
  }
} 