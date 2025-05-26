/**
 * Configuration options for different hover effects
 */
export type HoverEffectOptions =
  | ({ 
      effect: "ascii"; 
      size?: number; 
      chars?: string[]; 
      radius?: number; 
      colored?: boolean; 
      glitchIntensity?: number; 
      glitchSpeed?: number;
    })
  | ({ 
      effect: "zoom"; 
      scale?: number; 
      radius?: number 
    })
  | ({ 
      effect: "particle-dust"; 
      spacing?: number; 
      maxDrift?: number; 
      radius?: number 
    })
  | ({ 
      effect: "pixel"; 
      blockSize?: number; 
      radius?: number 
    })
  | ({ 
      effect: "minecraft"; 
      blockSize?: number; 
      radius?: number 
    })
  | ({ 
      effect: "lego"; 
      blockSize?: number; 
      radius?: number; 
      depth?: number; 
      studScale?: number; 
      gap?: number; 
      softEdge?: number; 
      fadeExp?: number 
    })
  | ({ 
      effect: "dot-matrix"; 
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
    });

/**
 * Interface that all hover effects must implement
 */
export interface HoverEffect {
  /**
   * Attach the effect to a DOM element
   * @param element The element to attach the effect to
   */
  attach(element: HTMLElement): void;

  /**
   * Detach the effect from its current element
   */
  detach(): void;

  /**
   * Clean up all resources used by the effect
   */
  destroy(): void;
  
  /**
   * Optional setter methods that may be implemented by specific effects
   */
  // Common setters
  setRadius?(radius: number): void;
  
  // ASCII effect setters
  setSize?(size: number): void;
  setColored?(colored: boolean): void;
  setGlitchIntensity?(intensity: number): void;
  setGlitchSpeed?(speed: number): void;
  setChars?(chars: string[]): void;
  
  // Zoom effect setters
  setScale?(scale: number): void;
  
  // Particle effect setters
  setSpacing?(spacing: number): void;
  setMaxDrift?(maxDrift: number): void;
  
  // Pixel and Minecraft effect setters
  setBlockSize?(size: number): void;
  
  // LEGO effect setters
  setGap?(gap: number): void;
  setStudScale?(scale: number): void;
  setDepth?(depth: number): void;
  setSoftEdge?(edge: number): void;
  setFadeExp?(exp: number): void;
  
  // Dot Matrix effect setters
  setLedSize?(ledSize: number): void;
  setLedSpacing?(ledSpacing: number): void;
  setGlow?(glow: boolean): void;
  setColorMode?(colorMode: 'mono' | 'rgb'): void;
  setAnimationType?(animationType: 'none' | 'wave' | 'pulse' | 'drift' | 'ripple' | 'rotation'): void;
  setAnimationSpeed?(animationSpeed: number): void;
  setAnimationIntensity?(animationIntensity: number): void;
}

/**
 * Valid effect types that can be applied
 */
export type EffectType = 'ascii' | 'zoom' | 'particle-dust' | 'pixel' | 'minecraft' | 'lego' | 'dot-matrix'; 