import { HoverEffect, HoverEffectOptions } from './types';
import { getTargets } from './utils';
import { AsciiHover } from '../effects/ascii';
import { ZoomHover } from '../effects/zoom';
import { ParticleDust } from '../effects/particleDust';
import { PixelHover } from '../effects/pixel';
import { MinecraftHover } from '../effects/minecraft';

export function createHoverEffect(options: HoverEffectOptions): HoverEffect {
  console.log(`Creating effect: ${options.effect}`);
  
  switch (options.effect) {
    case 'ascii':
      return new AsciiHover({
        radius: options.radius,
        size: options.size,
        chars: options.chars
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
