// Types
export type HoverEffectOptions =
  | ({ effect: "ascii"; size?: number; chars?: string[]; radius?: number; glitchIntensity?: number; glitchSpeed?: number })
  | ({ effect: "zoom"; scale?: number; radius?: number })
  | ({ effect: "particle-dust"; spacing?: number; maxDrift?: number; radius?: number })
  | ({ effect: "pixel"; blockSize?: number; radius?: number })
  | ({ effect: "minecraft"; blockSize?: number; radius?: number });

export interface HoverEffect {
  attach(element: HTMLElement): void;
  detach(): void;
  destroy(): void;
}

// Utilities
export function getTargets(
  target: string | HTMLElement | NodeListOf<HTMLElement>
): HTMLElement[] {
  if (typeof target === 'string') {
    const elements = document.querySelectorAll(target);
    console.log(`Query selector "${target}" found ${elements.length} elements`);
    return Array.from(elements) as HTMLElement[];
  } else if (target instanceof HTMLElement) {
    return [target];
  } else if (target instanceof NodeList) {
    return Array.from(target) as HTMLElement[];
  }
  
  return [];
}

// Zoom effect
class ZoomHover implements HoverEffect {
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

// ASCII effect
class AsciiHover implements HoverEffect {
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
  private glitchIntensity: number;
  private glitchSpeed: number;

  constructor(options: { radius?: number; size?: number; chars?: string[]; glitchIntensity?: number; glitchSpeed?: number } = {}) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.radius = options.radius ?? 70;
    this.size = options.size ?? 12;
    this.chars = options.chars ?? ['█', '@', '%', '#', '*', '+', '=', '-', ':', '.', ' '];
    this.scale = 0.2;
    this.glitchIntensity = options.glitchIntensity ?? 3;
    this.glitchSpeed = options.glitchSpeed ?? 0.5;
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

// ParticleDust effect
class ParticleDust implements HoverEffect {
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
  private readonly homeJitter: number;
  private readonly softEdge: number;
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
    
    console.log(`Cursor: ${this.cursor.x}, ${this.cursor.y}, Radius: ${this.radius}`);
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
      
      console.log(`Effect setup complete. Canvas size: ${canvas.width}x${canvas.height}`);
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
}

// PixelHover effect
class PixelHover implements HoverEffect {
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
}

// MinecraftHover effect
class MinecraftHover implements HoverEffect {
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

  private shadeColor(rgb: string, pct: number): string {
    const colors = rgb.match(/\d+/g)?.map(Number) || [0, 0, 0];
    return `rgb(${colors.map(v => 
      Math.min(255, Math.max(0, v * (1 + pct))) | 0
    ).join(',')})`;
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

    // Sample pixels at block intervals
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

    console.log(`Created ${this.samples.length} voxel samples`);
  }

  private drawVoxel(sample: { x: number; y: number; color: string }, elevation: number): void {
    if (!this.ctx) return;

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

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.cursor.active) {
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
      canvas.width = this.element!.width;
      canvas.height = this.element!.height;
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

      // Sample image
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
}

// Effect factory
export function createHoverEffect(options: HoverEffectOptions): HoverEffect {
  console.log(`Creating effect: ${options.effect}`);
  
  switch (options.effect) {
    case 'ascii':
      return new AsciiHover({
        radius: options.radius,
        size: options.size,
        chars: options.chars,
        glitchIntensity: options.glitchIntensity,
        glitchSpeed: options.glitchSpeed
      });
    case 'zoom':
      return new ZoomHover({
        radius: options.radius,
        scale: options.scale
      });
    case 'particle-dust':
      return new ParticleDust({
        spacing: options.spacing,
        maxDrift: options.maxDrift,
        radius: options.radius
      });
    case 'pixel':
      return new PixelHover({
        blockSize: options.blockSize,
        radius: options.radius
      });
    case 'minecraft':
      return new MinecraftHover({
        blockSize: options.blockSize,
        radius: options.radius
      });
    default:
      throw new Error(`Unsupported effect: ${(options as any).effect}`);
  }
}

/**
 * Apply a hover effect to one or more DOM elements
 * @param target - A CSS selector, HTMLElement, or NodeList of HTMLElements
 * @param options - Configuration options for the hover effect
 * @returns An object with a destroy method to remove the effect
 */
export function applyHoverEffect(
  target: string | HTMLElement | NodeListOf<HTMLElement>,
  options: HoverEffectOptions
): { destroy: () => void } {
  console.log(`Applying ${options.effect} effect to ${typeof target === 'string' ? target : 'element'}`);
  
  const targets = getTargets(target);
  console.log(`Found ${targets.length} target elements`);
  
  const effects: HoverEffect[] = [];

  // Create an effect for each target
  targets.forEach(element => {
    const effect = createHoverEffect(options);
    effect.attach(element);
    effects.push(effect);
  });

  // Return an object with a destroy method
  return {
    destroy: () => {
      effects.forEach(effect => effect.destroy());
    }
  };
} 