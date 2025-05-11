import { HoverEffectOptions, HoverEffect } from "./core/types";
import { getTargets } from "./core/utils";
import { createHoverEffect } from "./core/effectFactory";

// Re-export types
export { HoverEffectOptions, HoverEffect };

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
  const targets = getTargets(target);
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
