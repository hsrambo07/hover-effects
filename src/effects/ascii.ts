import { HoverEffect } from '../core/types';

interface AsciiHoverOptions {
  radius?: number;
  size?: number;
  chars?: string[];
}

export class AsciiHover implements HoverEffect {
  private element: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private mousePos = { x: 0, y: 0 };
  private isHovering = false;
  
  // Default options
  private radius: number;
  private size: number;
  private chars: string[];

  constructor(options: AsciiHoverOptions = {}) {
    this.radius = options.radius ?? 100;
    this.size = options.size ?? 10;
    this.chars = options.chars ?? [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
  }

  private onMouseEnter = (): void => {
    this.isHovering = true;
    this.startRendering();
  };

  private onMouseLeave = (): void => {
    this.isHovering = false;
    if (this.canvas) {
      this.canvas.style.opacity = '0';
      setTimeout(() => {
        if (this.canvas) this.canvas.style.display = 'none';
      }, 300);
    }
    this.stopRendering();
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.element) return;
    
    const rect = this.element.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  private setupCanvas(): void {
    if (!this.element) return;
    
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    
    if (!this.context) return;
    
    const rect = this.element.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Style canvas
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.opacity = '0';
    this.canvas.style.transition = 'opacity 0.3s ease';
    this.canvas.style.zIndex = '1';
    this.canvas.style.display = 'none';
    
    // Add canvas to element
    this.element.style.position = 'relative';
    this.element.appendChild(this.canvas);
  }

  private startRendering(): void {
    if (!this.canvas || !this.context || !this.element) return;
    
    this.canvas.style.display = 'block';
    setTimeout(() => {
      if (this.canvas) this.canvas.style.opacity = '1';
    }, 0);

    this.renderFrame();
  }

  private stopRendering(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private renderFrame = (): void => {
    if (!this.context || !this.canvas || !this.element || !this.isHovering) return;

    // Get the image data from the element
    const img = this.element as HTMLImageElement;
    
    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // If the element is an image and loaded, render the ASCII effect
    if (img.tagName === 'IMG' && img.complete) {
      // Create a temporary canvas to get the image data
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      
      if (tempContext) {
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        
        // Draw the image on the temporary canvas
        tempContext.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Get the image data
        const imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Calculate the distance from mouse position for radius effect
        for (let y = 0; y < tempCanvas.height; y += this.size) {
          for (let x = 0; x < tempCanvas.width; x += this.size) {
            // Check if this pixel is within the hover radius
            const distance = Math.sqrt(
              Math.pow(x - this.mousePos.x, 2) + 
              Math.pow(y - this.mousePos.y, 2)
            );
            
            if (distance <= this.radius) {
              const posX = Math.floor(x / this.size) * this.size;
              const posY = Math.floor(y / this.size) * this.size;
              
              // Get the brightness of the pixel at this position
              const pixelIndex = (posY * tempCanvas.width + posX) * 4;
              const r = imageData.data[pixelIndex];
              const g = imageData.data[pixelIndex + 1];
              const b = imageData.data[pixelIndex + 2];
              
              // Calculate brightness (0-255)
              const brightness = Math.round((r + g + b) / 3);
              
              // Map brightness to a character
              const charIndex = Math.floor(brightness / 256 * this.chars.length);
              const character = this.chars[charIndex];
              
              // Set the font and draw the character
              this.context.font = `${this.size}px monospace`;
              this.context.fillStyle = 'black';
              this.context.fillText(character, posX, posY + this.size);
            }
          }
        }
      }
    }
    
    // Request the next frame
    this.animationFrameId = requestAnimationFrame(this.renderFrame);
  };

  public attach(element: HTMLElement): void {
    this.element = element;
    this.setupCanvas();
    
    // Add event listeners
    this.element.addEventListener('mouseenter', this.onMouseEnter);
    this.element.addEventListener('mouseleave', this.onMouseLeave);
    this.element.addEventListener('mousemove', this.onMouseMove);
  }

  public detach(): void {
    if (!this.element) return;
    
    // Remove event listeners
    this.element.removeEventListener('mouseenter', this.onMouseEnter);
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('mousemove', this.onMouseMove);
    
    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    this.stopRendering();
  }

  public destroy(): void {
    this.detach();
    this.element = null;
    this.canvas = null;
    this.context = null;
  }
}
