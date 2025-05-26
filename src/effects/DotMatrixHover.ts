import { HoverEffect } from '../types';

export default class DotMatrixHover implements HoverEffect {
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
  private frameCount = 0; // Add frame counter for animations
  
  // Pre-built circle path for performance
  private ledPath: Path2D | null = null;
  
  // Configuration options
  private radius: number;
  private softEdge: number;
  private ledSize: number;
  private ledSpacing: number;
  private scale: number;
  private glow: boolean;
  private fadeExp: number;
  private colorMode: 'mono' | 'rgb';
  
  // Animation properties
  private animationType: 'none' | 'wave' | 'pulse' | 'drift' | 'ripple' | 'rotation';
  private animationSpeed: number;
  private animationIntensity: number;
  private driftOffsets: Array<{x: number, y: number, vx: number, vy: number}> = [];

  constructor(options: { 
    radius?: number; 
    softEdge?: number;
    ledSize?: number; 
    ledSpacing?: number;
    scale?: number;
    glow?: boolean;
    fadeExp?: number;
    colorMode?: 'mono' | 'rgb';
    animationType?: 'none' | 'wave' | 'pulse' | 'drift' | 'ripple' | 'rotation';
    animationSpeed?: number;
    animationIntensity?: number;
  } = {}) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.radius = options.radius ?? 120;
    this.softEdge = options.softEdge ?? 20;
    this.ledSize = options.ledSize ?? 8;
    this.ledSpacing = options.ledSpacing ?? (this.ledSize + 1);
    this.scale = options.scale ?? 0.12;
    this.glow = options.glow ?? true;
    this.fadeExp = options.fadeExp ?? 2;
    this.colorMode = options.colorMode ?? 'mono';
    this.animationType = options.animationType ?? 'wave';
    this.animationSpeed = options.animationSpeed ?? 1.0;
    this.animationIntensity = options.animationIntensity ?? 3.0;
    
    this.buildLedPath();
  }

  private buildLedPath(): void {
    this.ledPath = new Path2D();
    this.ledPath.arc(0, 0, this.ledSize / 2, 0, Math.PI * 2);
  }

  private initDriftOffsets(gridWidth: number, gridHeight: number): void {
    this.driftOffsets = [];
    for (let gridY = 0; gridY < gridHeight; gridY++) {
      for (let gridX = 0; gridX < gridWidth; gridX++) {
        this.driftOffsets.push({
          x: 0,
          y: 0,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
        });
      }
    }
  }

  private updateDriftOffsets(): void {
    this.driftOffsets.forEach(offset => {
      // Update position
      offset.x += offset.vx * this.animationSpeed;
      offset.y += offset.vy * this.animationSpeed;
      
      // Add some randomness to velocity
      if (Math.random() < 0.02) {
        offset.vx += (Math.random() - 0.5) * 0.1;
        offset.vy += (Math.random() - 0.5) * 0.1;
      }
      
      // Limit velocity
      const maxVel = 0.8;
      offset.vx = Math.max(-maxVel, Math.min(maxVel, offset.vx));
      offset.vy = Math.max(-maxVel, Math.min(maxVel, offset.vy));
      
      // Limit position offset
      const maxOffset = this.animationIntensity;
      offset.x = Math.max(-maxOffset, Math.min(maxOffset, offset.x));
      offset.y = Math.max(-maxOffset, Math.min(maxOffset, offset.y));
    });
  }

  private getAnimationOffset(gridX: number, gridY: number, gridWidth: number, gridHeight: number): {x: number, y: number, scale: number, rotation: number} {
    const time = this.frameCount * 0.1 * this.animationSpeed;
    const intensity = this.animationIntensity;
    
    switch (this.animationType) {
      case 'wave':
        return {
          x: Math.sin(time + gridX * 0.3) * intensity,
          y: Math.cos(time + gridY * 0.3) * intensity,
          scale: 1 + Math.sin(time + (gridX + gridY) * 0.2) * 0.3,
          rotation: 0
        };
        
      case 'pulse':
        const pulsePhase = time + (gridX + gridY) * 0.1;
        const pulse = Math.sin(pulsePhase) * 0.5 + 0.5;
        return {
          x: 0,
          y: 0,
          scale: 1 + pulse * 0.8,
          rotation: 0
        };
        
      case 'drift':
        const index = gridY * gridWidth + gridX;
        const drift = this.driftOffsets[index] || { x: 0, y: 0, vx: 0, vy: 0 };
        return {
          x: drift.x,
          y: drift.y,
          scale: 1,
          rotation: 0
        };
        
      case 'ripple':
        const centerX = this.mousePos.x / this.ledSpacing;
        const centerY = this.mousePos.y / this.ledSpacing;
        const dist = Math.hypot(gridX - centerX, gridY - centerY);
        const ripple = Math.sin(time * 2 - dist * 0.5) * intensity;
        return {
          x: 0,
          y: 0,
          scale: 1 + ripple * 0.3,
          rotation: 0
        };
        
      case 'rotation':
        const rotationSpeed = time * 0.5;
        const rotationRadius = intensity * 0.5;
        return {
          x: Math.cos(rotationSpeed + gridX * 0.1) * rotationRadius,
          y: Math.sin(rotationSpeed + gridY * 0.1) * rotationRadius,
          scale: 1,
          rotation: rotationSpeed + (gridX + gridY) * 0.1
        };
        
      default:
        return { x: 0, y: 0, scale: 1, rotation: 0 };
    }
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
    if (!this.element || !this.canvas) return;
    
    // Get accurate cursor position relative to the canvas
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    this.mousePos = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  private updateImageData(): void {
    if (!this.element || !this.tempCanvas || !this.tempCtx || !this.canvas) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Validate canvas dimensions
    if (width <= 0 || height <= 0) {
      console.warn('Canvas dimensions are invalid, skipping image data update');
      return;
    }
    
    // Calculate grid dimensions based on LED spacing
    const gridWidth = Math.floor(width / this.ledSpacing);
    const gridHeight = Math.floor(height / this.ledSpacing);
    
    // Ensure grid dimensions are valid
    if (gridWidth <= 0 || gridHeight <= 0) {
      console.warn('Grid dimensions are invalid, skipping image data update');
      return;
    }
    
    // Set temp canvas size for sampling
    this.tempCanvas.width = gridWidth;
    this.tempCanvas.height = gridHeight;
    
    // Draw the image to the temporary canvas at grid resolution
    this.tempCtx.drawImage(this.element, 0, 0, gridWidth, gridHeight);
    
    // Get image data for processing
    this.imageData = this.tempCtx.getImageData(0, 0, gridWidth, gridHeight);
  }

  private render = (timestamp = 0): void => {
    if (!this.element || !this.canvas || !this.ctx || !this.imageData || !this.isHovering || !this.ledPath) return;
    
    // Additional safety check for imageData
    if (!this.imageData.data || this.imageData.width <= 0 || this.imageData.height <= 0) {
      console.warn('Invalid image data, skipping render');
      return;
    }
    
    // Check if enough time has passed since last render
    const elapsed = timestamp - this.lastRenderTime;
    if (elapsed < this.frameInterval) {
      this.animationFrame = requestAnimationFrame(this.render);
      return;
    }
    
    this.lastRenderTime = timestamp;
    this.frameCount++; // Increment frame counter for animations
    
    // Use displayed dimensions
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Calculate grid dimensions
    const gridWidth = Math.floor(width / this.ledSpacing);
    const gridHeight = Math.floor(height / this.ledSpacing);
    
    // Ensure grid dimensions match imageData
    if (gridWidth !== this.imageData.width || gridHeight !== this.imageData.height) {
      console.warn('Grid dimensions mismatch with imageData, updating...');
      this.updateImageData();
      return;
    }
    
    // Initialize drift offsets if needed
    if (this.animationType === 'drift' && this.driftOffsets.length !== gridWidth * gridHeight) {
      this.initDriftOffsets(gridWidth, gridHeight);
    }
    
    // Update drift offsets if using drift animation
    if (this.animationType === 'drift') {
      this.updateDriftOffsets();
    }
    
    // Clear the canvas with black background (LED matrix background)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, width, height);
    
    // Set composite operation
    this.ctx.globalCompositeOperation = 'source-over';
    
    const data = this.imageData.data;
    const effectiveRadius = this.radius;
    
    // Iterate through the LED grid
    for (let gridY = 0; gridY < gridHeight; gridY++) {
      for (let gridX = 0; gridX < gridWidth; gridX++) {
        // Calculate base LED position on canvas
        const baseLedX = (gridX + 0.5) * this.ledSpacing;
        const baseLedY = (gridY + 0.5) * this.ledSpacing;
        
        // Get animation offset
        const animOffset = this.getAnimationOffset(gridX, gridY, gridWidth, gridHeight);
        
        // Apply animation offset to LED position
        const ledX = baseLedX + animOffset.x;
        const ledY = baseLedY + animOffset.y;
        
        // Calculate distance from mouse (using base position for radius calculation)
        const dist = Math.hypot(baseLedX - this.mousePos.x, baseLedY - this.mousePos.y);
        
        // Only render LEDs within the hover radius
        if (dist < effectiveRadius) {
          const index = (gridY * gridWidth + gridX) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          // Calculate brightness (0-1)
          const brightness = (r + g + b) / (3 * 255);
          
          // Calculate radial falloff with soft edge
          let radialFalloff = 1;
          if (dist > effectiveRadius - this.softEdge) {
            const edgeDistance = dist - (effectiveRadius - this.softEdge);
            radialFalloff = 1 - Math.pow(edgeDistance / this.softEdge, this.fadeExp);
            radialFalloff = Math.max(0, radialFalloff);
          }
          
          // Calculate final alpha
          const alpha = brightness * radialFalloff;
          
          // Skip if alpha is too low
          if (alpha < 0.05) continue;
          
          // Determine LED color based on color mode
          let fillColor: string;
          if (this.colorMode === 'rgb') {
            fillColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          } else {
            // Mono mode - cyan
            fillColor = `rgba(0, 255, 255, ${alpha})`;
          }
          
          // Configure glow effect if enabled
          if (this.glow) {
            this.ctx.shadowBlur = 4 * animOffset.scale;
            this.ctx.shadowColor = fillColor;
          } else {
            this.ctx.shadowBlur = 0;
          }
          
          // Set fill color
          this.ctx.fillStyle = fillColor;
          
          // Save context for transformation
          this.ctx.save();
          
          // Translate to LED position
          this.ctx.translate(ledX, ledY);
          
          // Apply rotation if needed
          if (animOffset.rotation !== 0) {
            this.ctx.rotate(animOffset.rotation);
          }
          
          // Apply scale if needed
          if (animOffset.scale !== 1) {
            this.ctx.scale(animOffset.scale, animOffset.scale);
          }
          
          // Draw the LED circle using the pre-built path
          this.ctx.fill(this.ledPath);
          
          // Restore context
          this.ctx.restore();
        }
      }
    }
    
    // Reset shadow settings
    this.ctx.shadowBlur = 0;
    
    if (this.isHovering) {
      this.animationFrame = requestAnimationFrame(this.render);
    }
  };

  public attach(element: HTMLElement): void {
    if (!(element instanceof HTMLImageElement)) {
      console.error('DotMatrix effect can only be applied to img elements');
      return;
    }
    
    this.element = element;
    
    const setupEffect = () => {
      // Create canvas without DPR scaling
      const canvas = document.createElement('canvas');
      
      // Get the displayed dimensions of the image
      const rect = element.getBoundingClientRect();
      let width = rect.width;
      let height = rect.height;
      
      // Fallback to natural dimensions if displayed dimensions are 0
      if (width <= 0 || height <= 0) {
        width = element.naturalWidth || 300; // Default fallback
        height = element.naturalHeight || 200; // Default fallback
        console.warn('Using fallback dimensions for canvas:', width, height);
      }
      
      // Set canvas size to match the displayed image size exactly (no retina scaling)
      canvas.width = width;
      canvas.height = height;
      
      // Position canvas directly over the image
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.3s ease';
      canvas.style.pointerEvents = 'none';
      canvas.style.backgroundColor = 'transparent';
      canvas.dataset.dotMatrixId = this.id;
      this.canvas = canvas;
      
      // Get context without scaling
      this.ctx = canvas.getContext('2d', { 
        alpha: true,
        willReadFrequently: false
      });
      
      if (this.ctx) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.imageSmoothingEnabled = false;
      }
      
      // Create temp canvas for sampling
      this.tempCanvas = document.createElement('canvas');
      this.tempCtx = this.tempCanvas.getContext('2d', { alpha: true });
      
      // Only update image data if we have valid dimensions
      if (width > 0 && height > 0) {
        this.updateImageData();
      }
      
      // Create wrapper
      let wrapper = this.element!.parentElement;
      if (!wrapper || !wrapper.classList.contains('dot-matrix-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'dot-matrix-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        this.element!.replaceWith(wrapper);
        wrapper.appendChild(this.element!);
      }
      
      wrapper.appendChild(canvas);
      
      // Add event listeners
      wrapper.addEventListener('mouseenter', this.onMouseEnter);
      wrapper.addEventListener('mouseleave', this.onMouseLeave);
      wrapper.addEventListener('mousemove', this.onMouseMove);
      
      // Handle resize to re-sample
      const resizeObserver = new ResizeObserver(() => {
        if (this.canvas && this.element) {
          const newRect = this.element.getBoundingClientRect();
          let newWidth = newRect.width;
          let newHeight = newRect.height;
          
          // Fallback to natural dimensions if needed
          if (newWidth <= 0 || newHeight <= 0) {
            newWidth = this.element.naturalWidth || 300;
            newHeight = this.element.naturalHeight || 200;
          }
          
          this.canvas.width = newWidth;
          this.canvas.height = newHeight;
          
          // Only update if dimensions are valid
          if (newWidth > 0 && newHeight > 0) {
            this.updateImageData();
          }
        }
      });
      if (this.element) {
        resizeObserver.observe(this.element);
      }
    };
    
    if (element.complete) {
      setupEffect();
    } else {
      element.onload = setupEffect;
    }
  }

  public detach(): void {
    if (!this.element) return;
    
    const wrapper = this.element.parentElement;
    if (wrapper) {
      wrapper.removeEventListener('mouseenter', this.onMouseEnter);
      wrapper.removeEventListener('mouseleave', this.onMouseLeave);
      wrapper.removeEventListener('mousemove', this.onMouseMove);
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
      this.ctx = null;
    }
    
    this.tempCanvas = null;
    this.tempCtx = null;
    this.imageData = null;
    this.element = null;
  }

  public destroy(): void {
    this.detach();
  }

  // Public setters
  public setRadius(radius: number): void {
    this.radius = Math.max(10, Math.min(500, radius));
  }

  public setLedSize(ledSize: number): void {
    this.ledSize = Math.max(2, Math.min(20, ledSize));
    this.buildLedPath(); // Rebuild the path with new size
  }

  public setLedSpacing(ledSpacing: number): void {
    this.ledSpacing = Math.max(this.ledSize + 1, Math.min(50, ledSpacing));
    this.updateImageData(); // Re-sample with new spacing
  }

  public setGlow(glow: boolean): void {
    this.glow = glow;
  }

  public setSoftEdge(softEdge: number): void {
    this.softEdge = Math.max(0, Math.min(100, softEdge));
  }

  public setScale(scale: number): void {
    this.scale = Math.max(0.05, Math.min(0.3, scale));
    this.updateImageData(); // Re-sample with new scale
  }

  public setFadeExp(fadeExp: number): void {
    this.fadeExp = Math.max(0.5, Math.min(5, fadeExp));
  }

  public setColorMode(colorMode: 'mono' | 'rgb'): void {
    this.colorMode = colorMode;
  }

  // Animation methods
  public setAnimationType(animationType: 'none' | 'wave' | 'pulse' | 'drift' | 'ripple' | 'rotation'): void {
    this.animationType = animationType;
  }

  public setAnimationSpeed(animationSpeed: number): void {
    this.animationSpeed = Math.max(0.1, Math.min(5.0, animationSpeed));
  }

  public setAnimationIntensity(animationIntensity: number): void {
    this.animationIntensity = Math.max(0.1, Math.min(10.0, animationIntensity));
  }

  public addDriftOffset(x: number, y: number, vx: number, vy: number): void {
    this.driftOffsets.push({ x, y, vx, vy });
  }
} 