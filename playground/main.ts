import { applyHoverEffect } from '../src/index.ts';

// Store effect instances
const effectInstances = {
  ascii: null,
  zoom: null,
  particle: null,
  pixel: null,
  minecraft: null,
  lego: null,
  dotmatrix: null
};

// EMERGENCY FIX FOR DRIFT SLIDER
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const driftSlider = document.getElementById('particle-drift');
    const particleDemo = document.getElementById('particle-demo');
    
    if (driftSlider && particleDemo) {
      console.log('EMERGENCY DRIFT FIX: Adding direct event listener to drift slider');
      
      driftSlider.addEventListener('input', () => {
        const driftValue = parseInt(driftSlider.value);
        console.log('EMERGENCY: Drift slider changed to', driftValue);
        
        // Update value display
        const valueDisplay = document.getElementById('particle-drift-value');
        if (valueDisplay) {
          valueDisplay.textContent = `${driftValue}px`;
        }
        
        // ALWAYS recreate the effect
        if (effectInstances.particle) {
          effectInstances.particle.destroy();
        }
        
        // Get other values
        const spacingValue = parseInt(document.getElementById('particle-spacing')?.value || '2');
        const radiusValue = parseInt(document.getElementById('particle-radius')?.value || '110');
        
        // Create new instance with updated drift
        effectInstances.particle = applyHoverEffect(particleDemo, {
          effect: 'particle-dust',
          spacing: spacingValue,
          maxDrift: driftValue,
          radius: radiusValue
        });
        
        console.log('EMERGENCY: Recreated particle effect with drift =', driftValue);
      });
    }
  }, 1000); // Wait for everything to initialize
});

// Tab switching logic
document.querySelectorAll('.nav-item').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.getAttribute('data-tab');
    
    // Update active tab
    document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
  });
});

// Initialize effects
async function initializeEffects() {
  // Helper function to ensure images are loaded
  const ensureImageLoaded = (img: HTMLImageElement): Promise<void> => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
      }
    });
  };

  // Initialize ASCII effect first
  const asciiDemo = document.getElementById('ascii-demo') as HTMLImageElement;
  if (asciiDemo) {
    await ensureImageLoaded(asciiDemo);
    
    effectInstances.ascii = applyHoverEffect(asciiDemo, {
      effect: 'ascii',
      size: 16,
      radius: 100,
      glitchIntensity: 3,
      glitchSpeed: 5
    });

    // Set up ASCII controls
    const sizeSlider = document.getElementById('ascii-size') as HTMLInputElement;
    const radiusSlider = document.getElementById('ascii-radius') as HTMLInputElement;
    const glitchIntensitySlider = document.getElementById('ascii-glitch-intensity') as HTMLInputElement;
    const glitchSpeedSlider = document.getElementById('ascii-glitch-speed') as HTMLInputElement;
    const activeToggle = document.getElementById('ascii-active') as HTMLInputElement;

    sizeSlider?.addEventListener('input', () => {
      const size = parseInt(sizeSlider.value);
      document.getElementById('ascii-size-value')!.textContent = `${size}px`;
      effectInstances.ascii?.setSize?.(size);
    });

    radiusSlider?.addEventListener('input', () => {
      const radius = parseInt(radiusSlider.value);
      document.getElementById('ascii-radius-value')!.textContent = `${radius}px`;
      effectInstances.ascii?.setRadius?.(radius);
    });

    glitchIntensitySlider?.addEventListener('input', () => {
      const intensity = parseInt(glitchIntensitySlider.value);
      document.getElementById('ascii-glitch-intensity-value')!.textContent = intensity.toString();
      effectInstances.ascii?.setGlitchIntensity?.(intensity);
    });

    glitchSpeedSlider?.addEventListener('input', () => {
      const speed = parseFloat(glitchSpeedSlider.value);
      document.getElementById('ascii-glitch-speed-value')!.textContent = speed.toFixed(1);
      effectInstances.ascii?.setGlitchSpeed?.(speed);
    });

    activeToggle?.addEventListener('change', () => {
      if (activeToggle.checked) {
        if (!effectInstances.ascii) {
          effectInstances.ascii = applyHoverEffect(asciiDemo, {
            effect: 'ascii',
            size: parseInt(sizeSlider?.value || '16'),
            radius: parseInt(radiusSlider?.value || '100'),
            glitchIntensity: parseInt(glitchIntensitySlider?.value || '3'),
            glitchSpeed: parseFloat(glitchSpeedSlider?.value || '5')
          });
        }
      } else if (effectInstances.ascii) {
        effectInstances.ascii.destroy();
        effectInstances.ascii = null;
      }
    });
  }

  // Define effects configuration
  const effects = [
    {
      id: 'zoom',
      options: { effect: 'zoom', scale: 1.2, radius: 100 },
      controls: {
        scale: { min: 11, max: 20, default: 12, transform: (v: number) => v / 10 },
        radius: { min: 50, max: 200, default: 100 }
      }
    },
    {
      id: 'particle',
      options: { effect: 'particle-dust', spacing: 2, maxDrift: 28, radius: 110 },
      controls: {
        spacing: { min: 2, max: 10, default: 2 },
        maxDrift: { min: 10, max: 50, default: 28 },
        radius: { min: 50, max: 200, default: 110 }
      }
    },
    {
      id: 'pixel',
      options: { effect: 'pixel', blockSize: 16, radius: 130 },
      controls: {
        blockSize: { min: 4, max: 32, default: 16 },
        radius: { min: 50, max: 200, default: 130 }
      }
    },
    {
      id: 'lego',
      options: { 
        effect: 'lego', 
        blockSize: 28, 
        radius: 140, 
        gap: 2, 
        studScale: 0.33, 
        depth: 0.25, 
        softEdge: 90, 
        fadeExp: 1.4 
      },
      controls: {
        blockSize: { min: 8, max: 40, default: 28 },
        gap: { min: 1, max: 5, default: 2 },
        studScale: { min: 20, max: 70, default: 33, transform: (v: number) => v / 100 },
        depth: { min: 10, max: 40, default: 25, transform: (v: number) => v / 100 },
        radius: { min: 80, max: 200, default: 140 },
        softEdge: { min: 30, max: 150, default: 90 },
        fadeExp: { min: 10, max: 30, default: 14, transform: (v: number) => v / 10 }
      }
    },
    {
      id: 'minecraft',
      options: { effect: 'minecraft', blockSize: 28, radius: 130 },
      controls: {
        blockSize: { min: 8, max: 64, default: 28 },
        radius: { min: 50, max: 200, default: 130 }
      }
    },
    {
      id: 'dotmatrix',
      options: { 
        effect: 'dot-matrix', 
        radius: 120, 
        ledSize: 4, 
        ledSpacing: 5, 
        softEdge: 20, 
        fadeExp: 2, 
        glow: true, 
        colorMode: 'mono',
        animationType: 'wave',
        animationSpeed: 1,
        animationIntensity: 3
      },
      controls: {
        radius: { min: 50, max: 300, default: 120 },
        ledSize: { min: 2, max: 15, default: 4 },
        ledSpacing: { min: 4, max: 25, default: 5 },
        softEdge: { min: 0, max: 50, default: 20 },
        fadeExp: { min: 5, max: 50, default: 20, transform: (v: number) => v / 10 },
        animationSpeed: { min: 1, max: 50, default: 10, transform: (v: number) => v / 10 },
        animationIntensity: { min: 1, max: 100, default: 30, transform: (v: number) => v / 10 }
      }
    }
  ];

  // Initialize Minecraft effect separately with more control
  const minecraftEffect = effects.find(e => e.id === 'minecraft');
  if (minecraftEffect) {
    const minecraftDemo = document.getElementById('minecraft-demo') as HTMLImageElement;
    if (minecraftDemo) {
      await ensureImageLoaded(minecraftDemo);
      
      // Get the actual value from the slider
      const sizeControl = document.getElementById('minecraft-size') as HTMLInputElement;
      const radiusControl = document.getElementById('minecraft-radius') as HTMLInputElement;
      
      const actualBlockSize = sizeControl ? parseInt(sizeControl.value) : 28;
      const actualRadius = radiusControl ? parseInt(radiusControl.value) : 130;
      
      // Force the correct values instead of using the defaults
      const minecraftOptions = {
        effect: 'minecraft',
        blockSize: actualBlockSize,
        radius: actualRadius
      };
      
      console.log('Initializing Minecraft effect with explicit values:', minecraftOptions);
      effectInstances.minecraft = applyHoverEffect(minecraftDemo, minecraftOptions);
      
      // Set up controls for minecraft effect
      const activeToggle = document.getElementById('minecraft-active') as HTMLInputElement;
      activeToggle?.addEventListener('change', () => {
        if (activeToggle.checked) {
          if (!effectInstances.minecraft) {
            effectInstances.minecraft = applyHoverEffect(minecraftDemo, minecraftOptions);
          }
        } else if (effectInstances.minecraft) {
          effectInstances.minecraft.destroy();
          effectInstances.minecraft = null;
        }
      });

      // Set up minecraft size control
      sizeControl?.addEventListener('input', () => {
        const blockSize = parseInt(sizeControl.value);
        document.getElementById('minecraft-size-value')!.textContent = `${blockSize}px`;
        if (effectInstances.minecraft?.setBlockSize) {
          effectInstances.minecraft.setBlockSize(blockSize);
        }
      });

      // Set up minecraft radius control
      radiusControl?.addEventListener('input', () => {
        const radius = parseInt(radiusControl.value);
        document.getElementById('minecraft-radius-value')!.textContent = `${radius}px`;
        if (effectInstances.minecraft?.setRadius) {
          effectInstances.minecraft.setRadius(radius);
        }
      });
    }
  }

  // Initialize Pixel effect separately with more control
  const pixelEffect = effects.find(e => e.id === 'pixel');
  if (pixelEffect) {
    const pixelDemo = document.getElementById('pixel-demo') as HTMLImageElement;
    if (pixelDemo) {
      await ensureImageLoaded(pixelDemo);
      
      // Get the actual value from the slider
      const sizeControl = document.getElementById('pixel-size') as HTMLInputElement;
      const radiusControl = document.getElementById('pixel-radius') as HTMLInputElement;
      
      const actualBlockSize = sizeControl ? parseInt(sizeControl.value) : 16;
      const actualRadius = radiusControl ? parseInt(radiusControl.value) : 130;
      
      // Force the correct values instead of using the defaults
      const pixelOptions = {
        effect: 'pixel',
        blockSize: actualBlockSize,
        radius: actualRadius
      };
      
      console.log('Initializing Pixel effect with explicit values:', pixelOptions);
      effectInstances.pixel = applyHoverEffect(pixelDemo, pixelOptions);
      
      // Set up controls for pixel effect
      const activeToggle = document.getElementById('pixel-active') as HTMLInputElement;
      activeToggle?.addEventListener('change', () => {
        if (activeToggle.checked) {
          if (!effectInstances.pixel) {
            effectInstances.pixel = applyHoverEffect(pixelDemo, pixelOptions);
          }
        } else if (effectInstances.pixel) {
          effectInstances.pixel.destroy();
          effectInstances.pixel = null;
        }
      });

      // Set up pixel size control
      sizeControl?.addEventListener('input', () => {
        const blockSize = parseInt(sizeControl.value);
        document.getElementById('pixel-size-value')!.textContent = `${blockSize}px`;
        if (effectInstances.pixel?.setBlockSize) {
          effectInstances.pixel.setBlockSize(blockSize);
        }
      });

      // Set up pixel radius control
      radiusControl?.addEventListener('input', () => {
        const radius = parseInt(radiusControl.value);
        document.getElementById('pixel-radius-value')!.textContent = `${radius}px`;
        if (effectInstances.pixel?.setRadius) {
          effectInstances.pixel.setRadius(radius);
        }
      });
    }
  }

  for (const effect of effects) {
    // Skip Minecraft and Pixel effects as we'll handle them separately
    if (effect.id === 'minecraft' || effect.id === 'pixel') continue;
    
    const demo = document.getElementById(`${effect.id}-demo`) as HTMLImageElement;
    if (demo) {
      await ensureImageLoaded(demo);
      effectInstances[effect.id] = applyHoverEffect(demo, effect.options);
      
      // Set up controls
      const activeToggle = document.getElementById(`${effect.id}-active`) as HTMLInputElement;
      activeToggle?.addEventListener('change', () => {
        if (activeToggle.checked) {
          if (!effectInstances[effect.id]) {
            effectInstances[effect.id] = applyHoverEffect(demo, effect.options);
          }
        } else if (effectInstances[effect.id]) {
          effectInstances[effect.id].destroy();
          effectInstances[effect.id] = null;
        }
      });

      // Special handling for DotMatrix effect
      if (effect.id === 'dotmatrix') {
        // Handle color mode select
        const colorModeSelect = document.getElementById('dotmatrix-color-mode') as HTMLSelectElement;
        const colorModeValue = document.getElementById('dotmatrix-color-mode-value');
        
        colorModeSelect?.addEventListener('change', () => {
          const colorMode = colorModeSelect.value;
          if (colorModeValue) {
            colorModeValue.textContent = colorMode === 'mono' ? 'Mono' : 'RGB';
          }
          if (effectInstances.dotmatrix?.setColorMode) {
            effectInstances.dotmatrix.setColorMode(colorMode);
          }
        });
        
        // Handle glow toggle
        const glowToggle = document.getElementById('dotmatrix-glow') as HTMLInputElement;
        glowToggle?.addEventListener('change', () => {
          if (effectInstances.dotmatrix?.setGlow) {
            effectInstances.dotmatrix.setGlow(glowToggle.checked);
          }
        });
        
        // Handle animation type select
        const animationTypeSelect = document.getElementById('dotmatrix-animation-type') as HTMLSelectElement;
        const animationTypeValue = document.getElementById('dotmatrix-animation-type-value');
        
        animationTypeSelect?.addEventListener('change', () => {
          const animationType = animationTypeSelect.value;
          if (animationTypeValue) {
            animationTypeValue.textContent = animationType.charAt(0).toUpperCase() + animationType.slice(1);
          }
          if (effectInstances.dotmatrix?.setAnimationType) {
            effectInstances.dotmatrix.setAnimationType(animationType);
          }
        });
        
        // Handle animation speed slider
        const animationSpeedSlider = document.getElementById('dotmatrix-animation-speed') as HTMLInputElement;
        const animationSpeedValue = document.getElementById('dotmatrix-animation-speed-value');
        
        animationSpeedSlider?.addEventListener('input', () => {
          const speed = parseInt(animationSpeedSlider.value) / 10;
          if (animationSpeedValue) {
            animationSpeedValue.textContent = speed.toFixed(1);
          }
          if (effectInstances.dotmatrix?.setAnimationSpeed) {
            effectInstances.dotmatrix.setAnimationSpeed(speed);
          }
        });
        
        // Handle animation intensity slider
        const animationIntensitySlider = document.getElementById('dotmatrix-animation-intensity') as HTMLInputElement;
        const animationIntensityValue = document.getElementById('dotmatrix-animation-intensity-value');
        
        animationIntensitySlider?.addEventListener('input', () => {
          const intensity = parseInt(animationIntensitySlider.value) / 10;
          if (animationIntensityValue) {
            animationIntensityValue.textContent = intensity.toFixed(1);
          }
          if (effectInstances.dotmatrix?.setAnimationIntensity) {
            effectInstances.dotmatrix.setAnimationIntensity(intensity);
          }
        });
      }

      // Set up sliders
      if (effect.controls) {
        for (const [param, config] of Object.entries(effect.controls)) {
          const control = document.getElementById(`${effect.id}-${param.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`) as HTMLInputElement;
          const valueDisplay = document.getElementById(`${effect.id}-${param.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}-value`);
          
          if (control && valueDisplay) {
            // Set initial value display
            if (param === 'scale') {
              valueDisplay.textContent = (config.default / 10).toFixed(1) + 'x';
            } else if (['studScale', 'depth', 'fadeExp'].includes(param)) {
              const displayValue = config.transform ? config.transform(config.default) : config.default;
              valueDisplay.textContent = displayValue.toFixed(2);
            } else {
              valueDisplay.textContent = `${config.default}px`;
            }
            
            control.addEventListener('input', () => {
              const rawValue = parseInt(control.value);
              const value = config.transform ? config.transform(rawValue) : rawValue;
              
              // Update display value
              if (param === 'scale') {
                valueDisplay.textContent = value.toFixed(1) + 'x';
              } else if (['studScale', 'depth', 'fadeExp'].includes(param)) {
                valueDisplay.textContent = value.toFixed(2);
              } else {
                valueDisplay.textContent = value + 'px';
              }
              
              // Call the appropriate setter method
              const setter = `set${param.charAt(0).toUpperCase() + param.slice(1)}`;
              
              // Special handling for Minecraft effect
              if (effect.id === 'minecraft' && param === 'blockSize') {
                console.log(`Setting Minecraft blockSize to: ${value}`);
              }
              
              if (effectInstances[effect.id]?.[setter]) {
                if (effect.id === 'minecraft') {
                  console.log(`Calling ${setter} with value:`, value);
                }
                effectInstances[effect.id][setter](value);
              } else {
                console.log(`Calling ${setter} with value:`, value);
                effectInstances[effect.id][setter](value);
              }
            });
          }
        }
      }
    }
  }
}

// Initialize effects when the page loads
initializeEffects(); 