import { HoverEffect, HoverEffectOptions } from './types';
import { ParticleDust } from '../effects/particleDust';
import { PixelHover } from '../effects/pixel';
import { MinecraftHover } from '../effects/minecraft';
import { AsciiHover } from '../effects/ascii';
import { ZoomHover } from '../effects/zoom';

export function applyHoverEffect(element: HTMLElement, options: HoverEffectOptions): HoverEffect {
  let effect: HoverEffect;

  switch (options.effect) {
    case 'ascii':
      effect = new AsciiHover({
        size: options.size,
        chars: options.chars,
        radius: options.radius
      });
      break;
    case 'zoom':
      effect = new ZoomHover({
        scale: options.scale,
        radius: options.radius
      });
      break;
    case 'particle-dust':
      effect = new ParticleDust({
        spacing: options.spacing,
        maxDrift: options.maxDrift,
        radius: options.radius
      });
      break;
    case 'pixel':
      effect = new PixelHover({
        blockSize: options.blockSize,
        radius: options.radius
      });
      break;
    case 'minecraft':
      effect = new MinecraftHover({
        blockSize: options.blockSize,
        radius: options.radius
      });
      break;
    default:
      throw new Error(`Unknown effect type: ${(options as any).effect}`);
  }

  effect.attach(element);
  return effect;
} 