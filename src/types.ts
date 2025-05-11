/**
 * Configuration options for different hover effects
 */
export type HoverEffectOptions =
  | ({ effect: "ascii"; size?: number; chars?: string[]; radius?: number })
  | ({ effect: "zoom"; scale?: number; radius?: number })
  | ({ effect: "particle-dust"; spacing?: number; maxDrift?: number; radius?: number })
  | ({ effect: "pixel"; blockSize?: number; radius?: number })
  | ({ effect: "minecraft"; blockSize?: number; radius?: number });

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
}

export interface ParticleDustOptions {
  particleCount?: number;
  particleSize?: number;
  particleSpeed?: number;
  colors?: string[];
}

export interface PixelOptions {
  pixelSize?: number;
  radius?: number;
}

export interface MinecraftOptions {
  breakSpeed?: number;
  blockSize?: number;
  crackStages?: number;
}

export type EffectType = 'particleDust' | 'pixel' | 'minecraft'; 