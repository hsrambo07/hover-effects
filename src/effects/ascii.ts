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
  private frameCount = 0;
  private glitchOffsets: Array<{x: number, y: number}> = [];
  
  // Fixed color palette - blues and greens with some highlights
  private colorPalette = [
    '#033F63', // dark blue
    '#28666E', // teal
    '#7C9885', // sage green
    '#B5B682', // light olive
    '#FEDC97', // light yellow
    '#00A9A5', // turquoise
    '#4A6D7C', // slate blue
    '#90C2E7', // light blue
    '#CDE7B0', // light green
    '#BCD39C'  // pale green
  ];
  
  // Character sets for different modes
  private coloredChars: string[] = ['@', 'r', 'A', '8', '*'];
  private nonColoredChars: string[] = ['█', '@', '%', '#', '*', '+', '=', '^', ' '];
  
  private radius: number;
  private size: number;
  private chars: string[];
  private scale: number;
  private colored: boolean;
  private glitchIntensity: number;
  private glitchSpeed: number;

  // Character metrics cache
  private charMetrics = { width: 14, height: 16.8 }; // Default values for 14px size
  
  // Cell calculations using metrics
  private get cellW() { return this.charMetrics.width; }
  private get cellH() { return this.charMetrics.height; }

  // Auto-size detection
  private autoSize = false; // Disable by default to use UI values
  private baseImageSize = 0;

  constructor(options: { 
    radius?: number; 
    size?: number; 
    colored?: boolean;
    glitchIntensity?: number;
    glitchSpeed?: number;
    chars?: string[];
  } = {}) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.radius = options.radius ?? 100; // Match UI default
    this.size = options.size ?? 16;      // Match UI default
    
    // Use fixed scale that doesn't depend on size
    this.scale = 0.15; // Consistent scale
    
    // Default to non-colored chars initially
    this.chars = this.nonColoredChars;
    
    this.colored = options.colored ?? false;
    this.glitchIntensity = options.glitchIntensity ?? 3;
    this.glitchSpeed = options.glitchSpeed ?? 0.5;
    
    // Update character set based on mode or custom chars
    if (options.chars) {
      this.chars = options.chars;
    } else if (this.colored) {
      this.chars = this.coloredChars;
    } else {
      this.chars = this.nonColoredChars;
    }
  }

  // Helper to convert hex colors to rgba
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // Helper to convert RGB to HSL
  private rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h, s, l };
  }
  
  // Helper to convert HSL to CSS color string
  private hslToCss({ h, s, l }: { h: number; s: number; l: number }) {
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  private initGlitchOffsets(width: number, height: number, stepX: number, stepY: number): void {
    this.glitchOffsets = [];
    
    for (let y = 0; y < height; y += stepY) {
      for (let x = 0; x < width; x += stepX) {
        this.glitchOffsets.push({
          x: 0,
          y: 0
        });
      }
    }
  }

  private updateGlitchOffsets(): void {
    const intensity = this.glitchIntensity;
    this.glitchOffsets.forEach(offset => {
      if (Math.random() < 0.1) { // Only update some offsets each frame
        offset.x = (Math.random() * 2 - 1) * intensity;
        offset.y = (Math.random() * 2 - 1) * intensity;
      }
    });
  }

  private onMouseEnter = (e: MouseEvent): void => {
    if (!this.element || !this.canvas) return;
    
    this.isHovering = true;
    
    // Get accurate cursor position relative to the image
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
    
    // Get accurate cursor position relative to the image
    const rect = this.element.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  private updateImageData(): void {
    if (!this.element || !this.tempCanvas || !this.tempCtx) return;
    
    // Use display dimensions instead of intrinsic dimensions
    const rect = this.element.getBoundingClientRect();
    const sw = Math.floor(rect.width * this.scale);
    const sh = Math.floor(rect.height * this.scale);
    
    this.tempCanvas.width = sw;
    this.tempCanvas.height = sh;
    this.tempCtx.drawImage(this.element, 0, 0, sw, sh);
    this.imageData = this.tempCtx.getImageData(0, 0, sw, sh);
  }

  private render = (timestamp = 0): void => {
    if (!this.element || !this.canvas || !this.ctx || !this.imageData || !this.isHovering) return;
    
    // Auto-adjust size if enabled
    if (this.autoSize) {
      const prevSize = this.size;
      this.calculateAutoSize();
      if (Math.abs(this.size - prevSize) > 1) {
        this.measureChars();
        this.updateImageData();
      }
    }
    
    // Check if enough time has passed since last render
    const elapsed = timestamp - this.lastRenderTime;
    if (elapsed < this.frameInterval) {
      this.animationFrame = requestAnimationFrame(this.render);
      return;
    }
    
    this.lastRenderTime = timestamp;
    this.frameCount++;
    
    // Use displayed dimensions for everything to ensure proper synchronization
    const width = this.canvas.width;
    const height = this.canvas.height;
    const sw = Math.floor(width * this.scale);
    const sh = Math.floor(height * this.scale);
    
    // Clear the canvas with each frame
    this.ctx.clearRect(0, 0, width, height);
    
    // Set composite operation to ensure transparency works correctly
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Set font with monospace for consistent character width
    this.ctx.font = `bold ${this.size}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const data = this.imageData.data;
    
    let effectiveRadius = this.radius;
    if (this.size <= 12) {
      // Use a larger effective radius for smaller characters to smooth the effect
      effectiveRadius = this.radius * 1.2;
    }
    const fullRadius = effectiveRadius * 3.0;
    
    if (this.colored) {
      // Original grid calculations that are known to work
      const stepX = Math.round(this.cellW * this.scale);
      const stepY = Math.round(this.cellH * this.scale);

      // First pass: Draw blurred background for depth
      this.ctx.save();
      this.ctx.filter = 'blur(3px) brightness(0.6) contrast(1.2)';
      for (let y = 0, py = 0; y < sh; y += stepY, py += this.cellH) {
        for (let x = 0, px = 0; x < sw; x += stepX, px += this.cellW) {
          const displayX = x / this.scale;
          const displayY = y / this.scale;
          const dist = Math.hypot(displayX - this.mousePos.x, displayY - this.mousePos.y);
          
          if (dist > fullRadius) continue;
          
          const falloff = Math.max(0, 1 - (dist / fullRadius));
          let alpha = falloff * falloff * falloff * (falloff * (falloff * 6 - 15) + 10);
          
          if (alpha < 0.005) continue;

          const time = Date.now() / (250 / this.glitchSpeed);
          const glitchX = Math.sin(time / 500 + y / 40) * (this.glitchIntensity / 2);
          const glitchY = Math.cos(time / 500 + x / 40) * (this.glitchIntensity / 2);
          
          const glitchedX = displayX + Math.round(glitchX);
          const glitchedY = displayY + Math.round(glitchY);
          
          const cx = Math.min(sw - 1, x + (stepX >> 1));
          const cy = Math.min(sh - 1, y + (stepY >> 1));
          const idx = (cy * sw + cx) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];

          // Draw dark base layer for more contrast
          this.ctx.globalAlpha = alpha * 0.7;
          this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
          this.ctx.fillRect(glitchedX - this.cellW/2 - 1, glitchedY - this.cellH/2 - 1, this.cellW + 2, this.cellH + 2);

          // Draw background with enhanced depth
          this.ctx.globalAlpha = alpha * 0.6;
          this.ctx.fillStyle = `rgb(${Math.floor(r*0.7)},${Math.floor(g*0.7)},${Math.floor(b*0.7)})`;
          this.ctx.fillRect(glitchedX - this.cellW/2, glitchedY - this.cellH/2, this.cellW, this.cellH);
        }
      }
      this.ctx.restore();

      // Second pass: Draw ASCII characters with enhanced shadows and depth
      for (let y = 0, py = 0; y < sh; y += stepY, py += this.cellH) {
        for (let x = 0, px = 0; x < sw; x += stepX, px += this.cellW) {
          const displayX = x / this.scale;
          const displayY = y / this.scale;
          const dist = Math.hypot(displayX - this.mousePos.x, displayY - this.mousePos.y);
          
          if (dist > fullRadius) continue;
          
          const falloff = Math.max(0, 1 - (dist / fullRadius));
          let alpha = falloff * falloff * falloff * (falloff * (falloff * 6 - 15) + 10);
          
          if (alpha < 0.005) continue;

          const time = Date.now() / (250 / this.glitchSpeed);
          const glitchX = Math.sin(time / 500 + y / 40) * (this.glitchIntensity / 2);
          const glitchY = Math.cos(time / 500 + x / 40) * (this.glitchIntensity / 2);
          
          const glitchedX = displayX + Math.round(glitchX);
          const glitchedY = displayY + Math.round(glitchY);
          
          const cx = Math.min(sw - 1, x + (stepX >> 1));
          const cy = Math.min(sh - 1, y + (stepY >> 1));
          const idx = (cy * sw + cx) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];

          const glitchEffect = Math.sin(time + (x * y) / 800) * (this.glitchIntensity * 1.5);
          const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          const adjustedBrightness = Math.max(0, Math.min(1, brightness + (glitchEffect / 255)));
          
          const charIndex = Math.floor((1 - adjustedBrightness) * (this.chars.length - 1));
          const char = this.chars[charIndex];

          // Draw multiple shadow layers for enhanced depth
          this.ctx.save();
          
          // First shadow layer (distant)
          this.ctx.shadowColor = 'rgba(0,0,0,0.6)';
          this.ctx.shadowBlur = 8;
          this.ctx.shadowOffsetX = 3;
          this.ctx.shadowOffsetY = 3;
          this.ctx.globalAlpha = alpha * 0.7;
          this.ctx.fillStyle = `rgb(${r},${g},${b})`;
          this.ctx.fillText(char, glitchedX, glitchedY);
          
          // Second shadow layer (closer)
          this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
          this.ctx.shadowBlur = 4;
          this.ctx.shadowOffsetX = 2;
          this.ctx.shadowOffsetY = 2;
          this.ctx.globalAlpha = alpha * 0.9;
          this.ctx.fillText(char, glitchedX, glitchedY);
          
          this.ctx.restore();

          // Draw character with highlight
          this.ctx.save();
          this.ctx.globalAlpha = alpha;
          // Add a stronger highlight for better contrast
          this.ctx.fillStyle = `rgba(255,255,255,0.2)`;
          this.ctx.fillText(char, glitchedX - 1, glitchedY - 1);
          // Draw main character with enhanced brightness
          this.ctx.fillStyle = `rgb(${Math.min(255, Math.floor(r*1.2))},${Math.min(255, Math.floor(g*1.2))},${Math.min(255, Math.floor(b*1.2))})`;
          this.ctx.fillText(char, glitchedX, glitchedY);
          this.ctx.restore();
        }
      }
    } else {
      // Original non-colored approach with natural animation
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const dx = (x / this.scale);
          const dy = (y / this.scale);
          
          const dist = Math.hypot(dx - this.mousePos.x, dy - this.mousePos.y);
          
          if (dist < this.radius) {
            const index = (y * sw + x) * 4;
            const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
            
            const time = Date.now() / (300 / this.glitchSpeed);
            const glitch = Math.sin(time + (x * y) / 1000) * this.glitchIntensity;
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
      // Create canvas without DPR scaling to avoid coordinate confusion
      const canvas = document.createElement('canvas');
      const rect = element.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.3s ease';
      canvas.style.pointerEvents = 'none';
      canvas.style.backgroundColor = 'transparent';
      canvas.dataset.asciiId = this.id;
      this.canvas = canvas;
      
      // Get context without scaling
      this.ctx = canvas.getContext('2d', { 
        alpha: true,
        willReadFrequently: true
      });
      
      if (this.ctx) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.imageSmoothingEnabled = false;
      }
      
      // Apply UI values
      const sizeSlider = document.getElementById('ascii-size') as HTMLInputElement;
      const radiusSlider = document.getElementById('ascii-radius') as HTMLInputElement;
      const glitchIntensitySlider = document.getElementById('ascii-glitch-intensity') as HTMLInputElement;
      const glitchSpeedSlider = document.getElementById('ascii-glitch-speed') as HTMLInputElement;
      
      this.autoSize = false;
      this.size = sizeSlider ? parseFloat(sizeSlider.value) : 16;
      this.radius = radiusSlider ? parseFloat(radiusSlider.value) : 100;
      this.glitchIntensity = glitchIntensitySlider ? parseFloat(glitchIntensitySlider.value) : 3;
      this.glitchSpeed = glitchSpeedSlider ? parseFloat(glitchSpeedSlider.value) / 10 : 0.5;
      
      // Use fixed scale based on size range
      if (this.size <= 8) this.scale = 0.12;
      else if (this.size <= 12) this.scale = 0.14;
      else if (this.size <= 16) this.scale = 0.15;
      else if (this.size <= 20) this.scale = 0.12;
      else this.scale = 0.1;
      
      this.measureChars();
      
      // Create temp canvas
      this.tempCanvas = document.createElement('canvas');
      this.tempCtx = this.tempCanvas.getContext('2d', { alpha: true });
      
      // Update image data
      this.updateImageData();
      
      // Create wrapper
      let wrapper = this.element!.parentElement;
      if (!wrapper || !wrapper.classList.contains('ascii-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'ascii-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        this.element!.replaceWith(wrapper);
        wrapper.appendChild(this.element!);
      }
      
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
    this.glitchOffsets = [];
  }
  
  public setColored(colored: boolean): void {
    this.colored = colored;
    
    // If we have custom chars, don't change them when toggling colored mode
    if (this.chars !== this.coloredChars && this.chars !== this.nonColoredChars) {
      return;
    }
    
    // Update the character set based on colored mode
    if (this.colored) {
      this.chars = this.coloredChars;
    } else {
      this.chars = this.nonColoredChars;
    }
  }
  
  public setGlitchIntensity(intensity: number): void {
    this.glitchIntensity = intensity;
  }
  
  public setGlitchSpeed(speed: number): void {
    this.glitchSpeed = speed;
  }
  
  public setRadius(radius: number): void {
    this.radius = radius;
  }
  
  public setSize(size: number): void {
    this.autoSize = false;
    this.size = size;
    
    // Fine-tune the scale for different size ranges
    // Smaller sizes need relatively smaller scale to prevent distortion
    if (size <= 8) this.scale = 0.12;      // Was 0.22 - too large for small characters
    else if (size <= 12) this.scale = 0.14; // Was 0.18 - still too large
    else if (size <= 16) this.scale = 0.15; // Keep this one as it works well
    else if (size <= 20) this.scale = 0.12;
    else this.scale = 0.1;
    
    this.measureChars();
    if (this.element) {
      this.updateImageData();
      if (this.isHovering) this.render();
    }
  }
  
  public setChars(chars: string[]): void {
    if (chars && chars.length > 0) {
      this.chars = chars;
    }
  }

  // Add method to calculate auto-size based on image dimensions
  private calculateAutoSize() {
    if (!this.element) return;
    
    // Get displayed image dimensions
    const rect = this.element.getBoundingClientRect();
    this.baseImageSize = Math.sqrt(rect.width * rect.height);
    
    // Calculate size based on image area (empirically determined ratio)
    const baseSize = Math.max(8, Math.min(24, this.baseImageSize / 150));
    this.size = baseSize;
    
    // Use fixed scale based on size range
    if (this.size <= 8) this.scale = 0.12;
    else if (this.size <= 12) this.scale = 0.14;
    else if (this.size <= 16) this.scale = 0.15;
    else if (this.size <= 20) this.scale = 0.12;
    else this.scale = 0.1;
  }

  // Add method to toggle auto-size
  public setAutoSize(enabled: boolean): void {
    this.autoSize = enabled;
    if (enabled && this.element) {
      this.calculateAutoSize();
      this.measureChars();
      this.updateImageData();
      if (this.isHovering) this.render();
    }
  }

  // Simplified character measurement for stability
  private measureChars() {
    const size = this.size;
    
    // Adjust metrics ratio based on size ranges
    // Smaller characters need different width/height ratio
    let widthRatio = 0.6;
    let heightRatio = 1.2;
    
    if (size <= 8) {
      widthRatio = 0.5;  // Narrower for smallest sizes
      heightRatio = 1.0; // Less height for better density
    } else if (size <= 12) {
      widthRatio = 0.55; // Slightly wider
      heightRatio = 1.1; // Slightly less height
    }
    
    this.charMetrics = {
      width: size * widthRatio,
      height: size * heightRatio
    };
  }
}

// Add at the end of the file, after the class definition
(window as any).AsciiHover = AsciiHover;
 