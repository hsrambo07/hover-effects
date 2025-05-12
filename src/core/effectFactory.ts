import { HoverEffect, HoverEffectOptions } from './types';
import { getTargets } from './utils';
import { AsciiHover } from '../effects/ascii';
import { ZoomHover } from '../effects/zoom';
import { ParticleDust } from '../effects/particleDust';
import { PixelHover } from '../effects/pixel';
import { MinecraftHover } from '../effects/minecraft';
import { LegoHover } from '../effects/lego';

export function createHoverEffect(options: HoverEffectOptions): HoverEffect {
  switch (options.effect) {
    case 'ascii':
      return new AsciiHover({
        radius: options.radius,
        size: options.size,
        chars: options.chars,
        colored: options.colored,
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
    case 'lego':
      return new LegoHover({
        blockSize: options.blockSize,
        radius: options.radius,
        gap: options.gap,
        studScale: options.studScale,
        depth: options.depth,
        softEdge: options.softEdge,
        fadeExp: options.fadeExp
      });
    default:
      throw new Error(`Unsupported effect: ${(options as any).effect}`);
  }
}

/**
 * Apply a hover effect to one or more DOM elements
 * @param target - A CSS selector, HTMLElement, or NodeList of HTMLElements
 * @param options - Configuration options for the hover effect
 * @returns An array of HoverEffect instances, or a single HoverEffect if only one element was targeted
 */
export function applyHoverEffect(
  target: string | HTMLElement | NodeListOf<HTMLElement>,
  options: HoverEffectOptions
): HoverEffect | HoverEffect[] {
  const targets = getTargets(target);
  
  const effects: HoverEffect[] = [];

  // Create an effect for each target
  targets.forEach(element => {
    const effect = createHoverEffect(options);
    effect.attach(element);
    effects.push(effect);
  });

  // Return either the array of effects or just the first one
  return targets.length === 1 ? effects[0] : effects;
}
 