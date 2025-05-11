import { applyHoverEffect } from '../src';

// Helper function to update value displays
function updateValue(id: string, value: number, suffix = 'px'): void {
  const element = document.getElementById(`${id}-value`);
  if (element) {
    element.textContent = `${value}${suffix}`;
  }
}

// Helper function to ensure image is loaded
function ensureImageLoaded(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    if (img.complete) {
      resolve();
    } else {
      img.onload = () => resolve();
    }
  });
}

// Initialize all effects
async function initializeEffects(): Promise<void> {
  // ASCII Effect
  const asciiDemo = document.getElementById('ascii-demo') as HTMLImageElement;
  if (asciiDemo) {
    await ensureImageLoaded(asciiDemo);
    let effect = applyHoverEffect(asciiDemo, {
      effect: 'ascii',
      size: 12,
      radius: 70
    });

    // Set up controls
    const sizeControl = document.getElementById('ascii-size') as HTMLInputElement;
    const radiusControl = document.getElementById('ascii-radius') as HTMLInputElement;

    if (sizeControl && radiusControl) {
      sizeControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(asciiDemo, {
          effect: 'ascii',
          size: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('ascii-size', parseInt(sizeControl.value));
      });

      radiusControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(asciiDemo, {
          effect: 'ascii',
          size: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('ascii-radius', parseInt(radiusControl.value));
      });
    }
  }

  // Zoom Effect
  const zoomDemo = document.getElementById('zoom-demo') as HTMLImageElement;
  if (zoomDemo) {
    await ensureImageLoaded(zoomDemo);
    let effect = applyHoverEffect(zoomDemo, {
      effect: 'zoom',
      scale: 1.2,
      radius: 100
    });

    // Set up controls
    const scaleControl = document.getElementById('zoom-scale') as HTMLInputElement;
    const radiusControl = document.getElementById('zoom-radius') as HTMLInputElement;

    if (scaleControl && radiusControl) {
      scaleControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(zoomDemo, {
          effect: 'zoom',
          scale: parseInt(scaleControl.value) / 10,
          radius: parseInt(radiusControl.value)
        });
        updateValue('zoom-scale', parseInt(scaleControl.value) / 10, 'x');
      });

      radiusControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(zoomDemo, {
          effect: 'zoom',
          scale: parseInt(scaleControl.value) / 10,
          radius: parseInt(radiusControl.value)
        });
        updateValue('zoom-radius', parseInt(radiusControl.value));
      });
    }
  }

  // Particle Dust Effect
  const particleDemo = document.getElementById('particle-demo') as HTMLImageElement;
  if (particleDemo) {
    await ensureImageLoaded(particleDemo);
    let effect = applyHoverEffect(particleDemo, {
      effect: 'particle-dust',
      spacing: 4,
      maxDrift: 28,
      radius: 110
    });

    // Set up controls
    const spacingControl = document.getElementById('particle-spacing') as HTMLInputElement;
    const driftControl = document.getElementById('particle-drift') as HTMLInputElement;

    if (spacingControl && driftControl) {
      spacingControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(particleDemo, {
          effect: 'particle-dust',
          spacing: parseInt(spacingControl.value),
          maxDrift: parseInt(driftControl.value),
          radius: 110
        });
        updateValue('particle-spacing', parseInt(spacingControl.value));
      });

      driftControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(particleDemo, {
          effect: 'particle-dust',
          spacing: parseInt(spacingControl.value),
          maxDrift: parseInt(driftControl.value),
          radius: 110
        });
        updateValue('particle-drift', parseInt(driftControl.value));
      });
    }
  }

  // Pixel Effect
  const pixelDemo = document.getElementById('pixel-demo') as HTMLImageElement;
  if (pixelDemo) {
    await ensureImageLoaded(pixelDemo);
    let effect = applyHoverEffect(pixelDemo, {
      effect: 'pixel',
      blockSize: 6,
      radius: 130
    });

    // Set up controls
    const sizeControl = document.getElementById('pixel-size') as HTMLInputElement;
    const radiusControl = document.getElementById('pixel-radius') as HTMLInputElement;

    if (sizeControl && radiusControl) {
      sizeControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(pixelDemo, {
          effect: 'pixel',
          blockSize: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('pixel-size', parseInt(sizeControl.value));
      });

      radiusControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(pixelDemo, {
          effect: 'pixel',
          blockSize: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('pixel-radius', parseInt(radiusControl.value));
      });
    }
  }

  // Minecraft Effect
  const minecraftDemo = document.getElementById('minecraft-demo') as HTMLImageElement;
  if (minecraftDemo) {
    await ensureImageLoaded(minecraftDemo);
    let effect = applyHoverEffect(minecraftDemo, {
      effect: 'minecraft',
      blockSize: 6,
      radius: 130
    });

    // Set up controls
    const sizeControl = document.getElementById('minecraft-size') as HTMLInputElement;
    const radiusControl = document.getElementById('minecraft-radius') as HTMLInputElement;

    if (sizeControl && radiusControl) {
      sizeControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(minecraftDemo, {
          effect: 'minecraft',
          blockSize: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('minecraft-size', parseInt(sizeControl.value));
      });

      radiusControl.addEventListener('input', () => {
        effect.destroy();
        effect = applyHoverEffect(minecraftDemo, {
          effect: 'minecraft',
          blockSize: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('minecraft-radius', parseInt(radiusControl.value));
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing hover effects demo...');
  initializeEffects().catch(error => {
    console.error('Failed to initialize effects:', error);
  });
}); 