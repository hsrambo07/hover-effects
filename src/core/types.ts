export interface HoverEffectOptions {
  effect: 'ascii' | 'zoom' | 'particle-dust' | 'pixel' | 'minecraft' | 'lego';
  // Common options
  radius?: number;
  
  // ASCII effect options
  size?: number;
  chars?: string[];
  colored?: boolean;
  glitchIntensity?: number;
  glitchSpeed?: number;
  
  // Zoom effect options
  scale?: number;
  
  // Particle effect options
  spacing?: number;
  maxDrift?: number;
  
  // Pixel and Minecraft effect options
  blockSize?: number;
  
  // LEGO effect options
  gap?: number;
  studScale?: number;
  depth?: number;
  softEdge?: number;
  fadeExp?: number;
}

export interface HoverEffect {
  attach(element: HTMLElement): void;
  detach(): void;
  destroy(): void;
  
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
  
  // Debug getters
  getRadius?(): number;
  getBlockSize?(): number;
  getSize?(): number;
  getScale?(): number;
  getSpacing?(): number;
  getMaxDrift?(): number;
  getSamplesCount?(): number;
  getDebugInfo?(): object;
}
 