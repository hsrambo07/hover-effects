export interface HoverEffectOptions {
  effect: 'ascii' | 'zoom' | 'particle-dust' | 'pixel' | 'minecraft' | 'lego';
  radius?: number;
  size?: number;
  colored?: boolean;
  glitchIntensity?: number;
  glitchSpeed?: number;
  chars?: string[];
  scale?: number;
  spacing?: number;
  maxDrift?: number;
  blockSize?: number;
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
  setColored?(colored: boolean): void;
  setGlitchIntensity?(intensity: number): void;
  setGlitchSpeed?(speed: number): void;
  setRadius?(radius: number): void;
  setSize?(size: number): void;
}
 