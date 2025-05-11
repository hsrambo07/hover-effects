// Import types and functions from debug.ts
import { HoverEffectOptions, HoverEffect, applyHoverEffect } from './debug';

// Export a function to initialize all effects
export function initializeEffects() {
  // Function to safely apply an effect
  function safelyApplyEffect(element: HTMLElement | null, options: HoverEffectOptions): HoverEffect | undefined {
    if (!element) {
      console.error('Element not found:', options.effect);
      return;
    }
    
    try {
      console.log(`Applying ${options.effect} effect to`, element);
      
      // Remove existing effect if any
      const existingWrapper = element.parentElement;
      if (existingWrapper && existingWrapper.classList.contains('effect-wrapper')) {
        console.log('Removing existing wrapper');
        const canvas = existingWrapper.querySelector('canvas');
        if (canvas) canvas.remove();
      }

      // Create and apply new effect
      const effect = applyHoverEffect(element, options);
      console.log(`Effect ${options.effect} applied successfully`);
      return effect;
    } catch (error) {
      console.error(`Failed to apply ${options.effect} effect:`, error);
      throw error;
    }
  }

  // Get all demo elements
  const asciiDemo = document.getElementById('asciiDemo') as HTMLElement;
  const zoomDemo = document.getElementById('zoomDemo') as HTMLElement;
  const particleDustDemo = document.getElementById('particleDustDemo') as HTMLElement;
  const pixelDemo = document.getElementById('pixelDemo') as HTMLElement;
  const minecraftDemo = document.getElementById('minecraftDemo') as HTMLElement;

  console.log('Found elements:', {
    ascii: !!asciiDemo,
    zoom: !!zoomDemo,
    particleDust: !!particleDustDemo,
    pixel: !!pixelDemo,
    minecraft: !!minecraftDemo
  });

  // Initialize effects
  const effects = {
    ascii: safelyApplyEffect(asciiDemo, { effect: 'ascii', size: 12, radius: 70 }),
    zoom: safelyApplyEffect(zoomDemo, { effect: 'zoom', scale: 1.2, radius: 100 }),
    particleDust: safelyApplyEffect(particleDustDemo, { effect: 'particle-dust', spacing: 4, maxDrift: 28, radius: 110 }),
    pixel: safelyApplyEffect(pixelDemo, { effect: 'pixel', blockSize: 6, radius: 130 }),
    minecraft: safelyApplyEffect(minecraftDemo, { effect: 'minecraft', blockSize: 6, radius: 130 })
  };

  // Setup controls
  setupControls(effects);

  return effects;
}

function setupControls(effects: Record<string, HoverEffect | undefined>) {
  // ASCII Effect Controls
  document.getElementById('asciiSize')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.ascii) {
      effects.ascii.destroy();
      effects.ascii = applyHoverEffect('#asciiDemo', {
        effect: 'ascii',
        size: parseInt(target.value),
        radius: parseInt((document.getElementById('asciiRadius') as HTMLInputElement).value)
      });
    }
  });

  document.getElementById('asciiRadius')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.ascii) {
      effects.ascii.destroy();
      effects.ascii = applyHoverEffect('#asciiDemo', {
        effect: 'ascii',
        size: parseInt((document.getElementById('asciiSize') as HTMLInputElement).value),
        radius: parseInt(target.value)
      });
    }
  });

  // Zoom Effect Controls
  document.getElementById('zoomScale')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.zoom) {
      effects.zoom.destroy();
      effects.zoom = applyHoverEffect('#zoomDemo', {
        effect: 'zoom',
        scale: parseFloat(target.value),
        radius: parseInt((document.getElementById('zoomRadius') as HTMLInputElement).value)
      });
    }
  });

  document.getElementById('zoomRadius')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.zoom) {
      effects.zoom.destroy();
      effects.zoom = applyHoverEffect('#zoomDemo', {
        effect: 'zoom',
        scale: parseFloat((document.getElementById('zoomScale') as HTMLInputElement).value),
        radius: parseInt(target.value)
      });
    }
  });

  // Particle Dust Controls
  document.getElementById('dustSpacing')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.particleDust) {
      effects.particleDust.destroy();
      effects.particleDust = applyHoverEffect('#particleDustDemo', {
        effect: 'particle-dust',
        spacing: parseInt(target.value),
        maxDrift: parseInt((document.getElementById('dustDrift') as HTMLInputElement).value),
        radius: parseInt((document.getElementById('dustRadius') as HTMLInputElement).value)
      });
    }
  });

  document.getElementById('dustDrift')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.particleDust) {
      effects.particleDust.destroy();
      effects.particleDust = applyHoverEffect('#particleDustDemo', {
        effect: 'particle-dust',
        spacing: parseInt((document.getElementById('dustSpacing') as HTMLInputElement).value),
        maxDrift: parseInt(target.value),
        radius: parseInt((document.getElementById('dustRadius') as HTMLInputElement).value)
      });
    }
  });

  document.getElementById('dustRadius')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.particleDust) {
      effects.particleDust.destroy();
      effects.particleDust = applyHoverEffect('#particleDustDemo', {
        effect: 'particle-dust',
        spacing: parseInt((document.getElementById('dustSpacing') as HTMLInputElement).value),
        maxDrift: parseInt((document.getElementById('dustDrift') as HTMLInputElement).value),
        radius: parseInt(target.value)
      });
    }
  });

  // Pixel Effect Controls
  document.getElementById('pixelSize')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.pixel) {
      effects.pixel.destroy();
      effects.pixel = applyHoverEffect('#pixelDemo', {
        effect: 'pixel',
        blockSize: parseInt(target.value),
        radius: parseInt((document.getElementById('pixelRadius') as HTMLInputElement).value)
      });
    }
  });

  document.getElementById('pixelRadius')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.pixel) {
      effects.pixel.destroy();
      effects.pixel = applyHoverEffect('#pixelDemo', {
        effect: 'pixel',
        blockSize: parseInt((document.getElementById('pixelSize') as HTMLInputElement).value),
        radius: parseInt(target.value)
      });
    }
  });

  // Minecraft Effect Controls
  document.getElementById('minecraftSize')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.minecraft) {
      effects.minecraft.destroy();
      effects.minecraft = applyHoverEffect('#minecraftDemo', {
        effect: 'minecraft',
        blockSize: parseInt(target.value),
        radius: parseInt((document.getElementById('minecraftRadius') as HTMLInputElement).value)
      });
    }
  });

  document.getElementById('minecraftRadius')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (effects.minecraft) {
      effects.minecraft.destroy();
      effects.minecraft = applyHoverEffect('#minecraftDemo', {
        effect: 'minecraft',
        blockSize: parseInt((document.getElementById('minecraftSize') as HTMLInputElement).value),
        radius: parseInt(target.value)
      });
    }
  });
} 