import { HoverEffect, HoverEffectOptions } from './types';
import { AsciiHover } from '../effects/ascii';
import { BlurHover } from '../effects/blur';
import { ZoomHover } from '../effects/zoom';

export function createHoverEffect(options: HoverEffectOptions): HoverEffect {
  switch (options.effect) {
    case 'ascii':
      return new AsciiHover({
        radius: options.radius,
        size: options.size,
        chars: options.chars
      });
    case 'blur':
      return new BlurHover({
        radius: options.radius,
        strength: options.strength
      });
    case 'zoom':
      return new ZoomHover({
        radius: options.radius,
        scale: options.scale
      });
    default:
      throw new Error(`Unsupported effect: ${(options as any).effect}`);
  }
}
