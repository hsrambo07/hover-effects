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
    // New properties for enhanced movement
    spin: number;
    spinSpeed: number;
    orbitRadius: number;
    orbitSpeed: number;
    orbitPhase: number;
  }> = [];
  private cursor = { x: 0, y: 0, active: false };
  private animationFrame: number | null = null;
  private isSetup = false;
  // Track the last cursor position for continuous movement
  private lastCursorPos = { x: 0, y: 0 };
  private cursorMoving = false;
  private cursorMoveTime = 0;

  // Configuration
  private spacing: number;
  private radius: number;
  private maxDrift: number;
  private readonly homeJitter: number;
  private softEdge: number;
  private readonly fadeExp: number;
  private readonly wobbleAmpMin: number;
  private readonly wobbleAmpMax: number;
  private readonly wobbleSpeedMin: number;
  private readonly wobbleSpeedMax: number;

  constructor(options: { spacing?: number; maxDrift?: number; radius?: number } = {}) {
    // Core configuration
    this.spacing = options.spacing ?? 4;
    this.radius = options.radius ?? 110;
    this.maxDrift = options.maxDrift ?? 28;
    
    // Fixed configuration
    this.homeJitter = this.spacing / 2;
    this.softEdge = Math.min(20, this.radius / 2);
    this.fadeExp = 1.5;
    this.wobbleAmpMin = 1.5; // Increased for more movement
    this.wobbleAmpMax = 3.0; // Increased for more movement
    this.wobbleSpeedMin = 0.5; // Slightly faster
    this.wobbleSpeedMax = 1.2; // Slightly faster
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

        // New parameters for enhanced movement
        const spin = Math.random() < 0.5 ? -1 : 1; // Direction of spin (clockwise or counter)
        const spinSpeed = 0.5 + Math.random() * 1.5; // How fast it spins
        const orbitRadius = this.spacing * (0.5 + Math.random() * 1.0); // Orbit radius
        const orbitSpeed = 0.3 + Math.random() * 0.7; // Orbit speed
        const orbitPhase = Math.random() * Math.PI * 2; // Starting position in orbit

        this.particles.push({ 
          homeX, homeY, dir, color, wobVec, wobAmp, wobSpeed, phase,
          spin, spinSpeed, orbitRadius, orbitSpeed, orbitPhase
        });
      }
    }
  }

  private render = (time: number): void => {
    if (!this.canvas || !this.ctx || !this.isSetup || !this.element) return;

    const t = time * 0.001; // ms->sec
    
    // Update cursor motion detection
    if (this.cursor.active) {
      const dx = this.cursor.x - this.lastCursorPos.x;
      const dy = this.cursor.y - this.lastCursorPos.y;
      const cursorSpeed = Math.hypot(dx, dy);
      
      if (cursorSpeed > 0.5) {
        this.cursorMoving = true;
        this.cursorMoveTime = t + 0.5; // Keep "moving" state for 0.5 sec after motion stops
      } else if (t > this.cursorMoveTime) {
        this.cursorMoving = false;
      }
      
      this.lastCursorPos.x = this.cursor.x;
      this.lastCursorPos.y = this.cursor.y;
    }
    
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw the original image first
    this.ctx.drawImage(this.element, 0, 0);

    if (this.cursor.active) {
      // Create a clipping region for the particle effect
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.cursor.x, this.cursor.y, this.radius + this.softEdge, 0, Math.PI * 2);
      this.ctx.clip();
      
      // Clear the area where particles will be drawn
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.particles.forEach(p => {
        const dist = Math.hypot(p.homeX - this.cursor.x, p.homeY - this.cursor.y);
        const effectRadius = this.radius;
        
        if (dist < effectRadius + this.softEdge) {
          // Eased 0..1 within influence
          const base = dist < effectRadius ? 1 : 1 - (dist - effectRadius) / this.softEdge;
          const eased = Math.pow(base, this.fadeExp);
          const drift = eased * this.maxDrift;

          // Base exploded position
          let px = p.homeX + p.dir.dx * drift;
          let py = p.homeY + p.dir.dy * drift;

          // Add basic wobble
          const wobble = Math.sin(t * p.wobSpeed + p.phase) * p.wobAmp * eased;
          px += p.wobVec.dx * wobble;
          py += p.wobVec.dy * wobble;

          // Add orbital motion - particles now orbit around their base position
          const orbitPhase = t * p.orbitSpeed + p.orbitPhase;
          px += Math.cos(orbitPhase) * p.orbitRadius * eased;
          py += Math.sin(orbitPhase) * p.orbitRadius * eased;
          
          // Add more dynamic movement when cursor is moving
          if (this.cursorMoving) {
            const agitationFactor = 1.5;
            // Additional directional movement based on cursor motion
            const dx = this.cursor.x - this.lastCursorPos.x;
            const dy = this.cursor.y - this.lastCursorPos.y;
            // Apply some of the cursor's movement to the particles
            px += dx * 0.2 * agitationFactor * eased;
            py += dy * 0.2 * agitationFactor * eased;
            
            // Add some extra jitter when moving
            px += (Math.random() * 2 - 1) * agitationFactor * eased;
            py += (Math.random() * 2 - 1) * agitationFactor * eased;
          }

          // Draw particle with possible rotation
          if (this.ctx) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.15 + 0.85 * eased;
            
            // Optionally rotate the particle
            if (eased > 0.3) { // Only apply rotation to particles with significant effect
              this.ctx.translate(px + this.spacing/2, py + this.spacing/2);
              this.ctx.rotate(t * p.spinSpeed * p.spin * eased);
              this.ctx.fillStyle = p.color;
              this.ctx.fillRect(-this.spacing/2, -this.spacing/2, this.spacing, this.spacing);
              this.ctx.restore();
            } else {
              // No rotation for distant particles
              this.ctx.fillStyle = p.color;
              this.ctx.fillRect(px, py, this.spacing, this.spacing);
            }
          }
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
    if (this.isSetup) {
      this.createParticles(); // Recreate particles with new spacing
    }
  }
  
  public setMaxDrift(maxDrift: number): void {
    this.maxDrift = maxDrift;
  }
  
  public setRadius(radius: number): void {
    this.radius = radius;
    this.softEdge = Math.min(20, this.radius / 2); // Update dependent parameter
  }
} 