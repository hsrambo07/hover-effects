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

// Store effect instances to enable toggling
const effectInstances: Record<string, any> = {};

// Initialize all effects
async function initializeEffects(): Promise<void> {
  // ASCII Effect
  const asciiDemo = document.getElementById('ascii-demo') as HTMLImageElement;
  if (asciiDemo) {
    await ensureImageLoaded(asciiDemo);

    // Get all control elements
    const sizeControl = document.getElementById('ascii-size') as HTMLInputElement;
    const radiusControl = document.getElementById('ascii-radius') as HTMLInputElement;
    const activeToggle = document.getElementById('ascii-active') as HTMLInputElement;
    const spacingControl = document.getElementById('ascii-spacing') as HTMLInputElement;
    const colorToggle = document.getElementById('ascii-color') as HTMLInputElement;
    const glitchIntensityControl = document.getElementById('ascii-glitch-intensity') as HTMLInputElement;
    const glitchSpeedControl = document.getElementById('ascii-glitch-speed') as HTMLInputElement;
    
    // Get values (using let instead of const to allow updates)
    let size = parseInt(sizeControl?.value || '16');
    let radius = parseInt(radiusControl?.value || '100');
    const active = activeToggle?.checked !== false;
    let letterSpacing = parseInt(spacingControl?.value || '50') / 100; // Convert to 0-1 range
    let colored = colorToggle?.checked !== false;
    let glitchIntensity = parseInt(glitchIntensityControl?.value || '3');
    let glitchSpeed = parseInt(glitchSpeedControl?.value || '5') / 10; // Convert to a reasonable range
    
    // Apply initial CSS variable for letter spacing
    document.documentElement.style.setProperty('--ascii-spacing', `${letterSpacing}em`);
    
    // Update value displays
    const updateValue = (id: string, value: number, suffix = 'px') => {
      const element = document.getElementById(`${id}-value`);
      if (element) {
        element.textContent = `${value}${suffix}`;
      }
    };
    
    updateValue('ascii-size', size);
    updateValue('ascii-radius', radius);
    updateValue('ascii-spacing', letterSpacing, '');
    updateValue('ascii-glitch-intensity', glitchIntensity, '');
    updateValue('ascii-glitch-speed', glitchSpeed, '');
    
    // Extended interface for ASCII effect options
    interface AsciiOptions {
      effect: 'ascii';
      size?: number;
      radius?: number;
      colored?: boolean;
      glitchIntensity?: number;
      glitchSpeed?: number;
    }
    
    // Function to apply or update the ASCII effect
    const applyAsciiEffect = () => {
      // If there's an existing instance, destroy it
      if (effectInstances.ascii) {
        effectInstances.ascii.destroy();
      }
      
      // Create a new instance with current settings
      const options: AsciiOptions = {
          effect: 'ascii',
        size: size,
        radius: radius,
        colored: colored,
        glitchIntensity: glitchIntensity,
        glitchSpeed: glitchSpeed
      };
      
      effectInstances.ascii = applyHoverEffect(asciiDemo, options);
    };
    
    // Initially apply the effect
    if (active) {
      applyAsciiEffect();
    }
    
    // Size control handler
    sizeControl.addEventListener('input', (e) => {
      size = parseInt(sizeControl.value);
      updateValue('ascii-size', size);
      applyAsciiEffect();
    });
    
    // Radius control handler
    radiusControl.addEventListener('input', (e) => {
      radius = parseInt(radiusControl.value);
      updateValue('ascii-radius', radius);
      applyAsciiEffect();
    });
    
    // Glitch intensity handler
    glitchIntensityControl.addEventListener('input', (e) => {
      glitchIntensity = parseFloat(glitchIntensityControl.value);
      updateValue('ascii-glitch-intensity', glitchIntensity, '');
      
      if (effectInstances.ascii && effectInstances.ascii.setGlitchIntensity) {
        effectInstances.ascii.setGlitchIntensity(glitchIntensity);
      } else {
        applyAsciiEffect();
      }
    });
    
    // Glitch speed handler
    glitchSpeedControl.addEventListener('input', (e) => {
      glitchSpeed = parseFloat(glitchSpeedControl.value) / 10;
      updateValue('ascii-glitch-speed', glitchSpeed, '');
      
      if (effectInstances.ascii && effectInstances.ascii.setGlitchSpeed) {
        effectInstances.ascii.setGlitchSpeed(glitchSpeed);
      } else {
        applyAsciiEffect();
      }
    });
    
    // Toggle effect active state
    activeToggle.addEventListener('change', () => {
      if (activeToggle.checked) {
        applyAsciiEffect();
      } else if (effectInstances.ascii) {
        effectInstances.ascii.destroy();
        effectInstances.ascii = null;
      }
    });
    
    // Toggle colored mode
    colorToggle.addEventListener('change', () => {
      colored = colorToggle.checked;
      if (effectInstances.ascii && effectInstances.ascii.setColored) {
        effectInstances.ascii.setColored(colored);
      } else {
        applyAsciiEffect();
      }
    });
    
    // Letter spacing control
    spacingControl.addEventListener('input', () => {
      letterSpacing = parseInt(spacingControl.value) / 100;
      document.documentElement.style.setProperty('--ascii-spacing', `${letterSpacing}em`);
      updateValue('ascii-spacing', letterSpacing, '');
      });
  }

  // Zoom Effect
  const zoomDemo = document.getElementById('zoom-demo') as HTMLImageElement;
  if (zoomDemo) {
    await ensureImageLoaded(zoomDemo);
    effectInstances.zoom = applyHoverEffect(zoomDemo, {
      effect: 'zoom',
      scale: 1.2,
      radius: 100
    });

    // Set up controls
    const scaleControl = document.getElementById('zoom-scale') as HTMLInputElement;
    const radiusControl = document.getElementById('zoom-radius') as HTMLInputElement;
    const activeToggle = document.getElementById('zoom-active') as HTMLInputElement;

    if (scaleControl && radiusControl) {
      scaleControl.addEventListener('input', () => {
        if (effectInstances.zoom) {
          effectInstances.zoom.destroy();
        }
        effectInstances.zoom = applyHoverEffect(zoomDemo, {
          effect: 'zoom',
          scale: parseInt(scaleControl.value) / 10,
          radius: parseInt(radiusControl.value)
        });
        updateValue('zoom-scale', parseInt(scaleControl.value) / 10, 'x');
      });

      radiusControl.addEventListener('input', () => {
        if (effectInstances.zoom) {
          effectInstances.zoom.destroy();
        }
        effectInstances.zoom = applyHoverEffect(zoomDemo, {
          effect: 'zoom',
          scale: parseInt(scaleControl.value) / 10,
          radius: parseInt(radiusControl.value)
        });
        updateValue('zoom-radius', parseInt(radiusControl.value));
      });
      
      activeToggle.addEventListener('change', () => {
        if (activeToggle.checked) {
          if (!effectInstances.zoom) {
            effectInstances.zoom = applyHoverEffect(zoomDemo, {
              effect: 'zoom',
              scale: parseInt(scaleControl.value) / 10,
              radius: parseInt(radiusControl.value)
            });
          }
        } else if (effectInstances.zoom) {
          effectInstances.zoom.destroy();
          effectInstances.zoom = null;
        }
      });
    }
  }

  // Particle Dust Effect
  const particleDemo = document.getElementById('particle-demo') as HTMLImageElement;
  if (particleDemo) {
    await ensureImageLoaded(particleDemo);
    effectInstances.particle = applyHoverEffect(particleDemo, {
      effect: 'particle-dust',
      spacing: 4,
      maxDrift: 28,
      radius: 110
    });

    // Set up controls
    const spacingControl = document.getElementById('particle-spacing') as HTMLInputElement;
    const driftControl = document.getElementById('particle-drift') as HTMLInputElement;
    const activeToggle = document.getElementById('particle-active') as HTMLInputElement;

    if (spacingControl && driftControl) {
      spacingControl.addEventListener('input', () => {
        if (effectInstances.particle) {
          effectInstances.particle.destroy();
        }
        effectInstances.particle = applyHoverEffect(particleDemo, {
          effect: 'particle-dust',
          spacing: parseInt(spacingControl.value),
          maxDrift: parseInt(driftControl.value),
          radius: 110
        });
        updateValue('particle-spacing', parseInt(spacingControl.value));
      });

      driftControl.addEventListener('input', () => {
        if (effectInstances.particle) {
          effectInstances.particle.destroy();
        }
        effectInstances.particle = applyHoverEffect(particleDemo, {
          effect: 'particle-dust',
          spacing: parseInt(spacingControl.value),
          maxDrift: parseInt(driftControl.value),
          radius: 110
        });
        updateValue('particle-drift', parseInt(driftControl.value));
      });
      
      activeToggle.addEventListener('change', () => {
        if (activeToggle.checked) {
          if (!effectInstances.particle) {
            effectInstances.particle = applyHoverEffect(particleDemo, {
              effect: 'particle-dust',
              spacing: parseInt(spacingControl.value),
              maxDrift: parseInt(driftControl.value),
              radius: 110
            });
          }
        } else if (effectInstances.particle) {
          effectInstances.particle.destroy();
          effectInstances.particle = null;
        }
      });
    }
  }

  // Pixel Effect
  const pixelDemo = document.getElementById('pixel-demo') as HTMLImageElement;
  if (pixelDemo) {
    await ensureImageLoaded(pixelDemo);
    effectInstances.pixel = applyHoverEffect(pixelDemo, {
      effect: 'pixel',
      blockSize: 6,
      radius: 130
    });

    // Set up controls
    const sizeControl = document.getElementById('pixel-size') as HTMLInputElement;
    const radiusControl = document.getElementById('pixel-radius') as HTMLInputElement;
    const activeToggle = document.getElementById('pixel-active') as HTMLInputElement;

    if (sizeControl && radiusControl) {
      sizeControl.addEventListener('input', () => {
        if (effectInstances.pixel) {
          effectInstances.pixel.destroy();
        }
        effectInstances.pixel = applyHoverEffect(pixelDemo, {
          effect: 'pixel',
          blockSize: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('pixel-size', parseInt(sizeControl.value));
      });

      radiusControl.addEventListener('input', () => {
        if (effectInstances.pixel) {
          effectInstances.pixel.destroy();
        }
        effectInstances.pixel = applyHoverEffect(pixelDemo, {
          effect: 'pixel',
          blockSize: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('pixel-radius', parseInt(radiusControl.value));
      });
      
      activeToggle.addEventListener('change', () => {
        if (activeToggle.checked) {
          if (!effectInstances.pixel) {
            effectInstances.pixel = applyHoverEffect(pixelDemo, {
              effect: 'pixel',
              blockSize: parseInt(sizeControl.value),
              radius: parseInt(radiusControl.value)
            });
          }
        } else if (effectInstances.pixel) {
          effectInstances.pixel.destroy();
          effectInstances.pixel = null;
        }
      });
    }
  }

  // Minecraft Effect
  const minecraftDemo = document.getElementById('minecraft-demo') as HTMLImageElement;
  if (minecraftDemo) {
    await ensureImageLoaded(minecraftDemo);
    effectInstances.minecraft = applyHoverEffect(minecraftDemo, {
      effect: 'minecraft',
      blockSize: 6,
      radius: 130
    });

    // Set up controls
    const sizeControl = document.getElementById('minecraft-size') as HTMLInputElement;
    const radiusControl = document.getElementById('minecraft-radius') as HTMLInputElement;
    const activeToggle = document.getElementById('minecraft-active') as HTMLInputElement;

    if (sizeControl && radiusControl) {
      sizeControl.addEventListener('input', () => {
        if (effectInstances.minecraft) {
          effectInstances.minecraft.destroy();
        }
        effectInstances.minecraft = applyHoverEffect(minecraftDemo, {
          effect: 'minecraft',
          blockSize: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('minecraft-size', parseInt(sizeControl.value));
      });

      radiusControl.addEventListener('input', () => {
        if (effectInstances.minecraft) {
          effectInstances.minecraft.destroy();
        }
        effectInstances.minecraft = applyHoverEffect(minecraftDemo, {
          effect: 'minecraft',
          blockSize: parseInt(sizeControl.value),
          radius: parseInt(radiusControl.value)
        });
        updateValue('minecraft-radius', parseInt(radiusControl.value));
      });
      
      activeToggle.addEventListener('change', () => {
        if (activeToggle.checked) {
          if (!effectInstances.minecraft) {
            effectInstances.minecraft = applyHoverEffect(minecraftDemo, {
              effect: 'minecraft',
              blockSize: parseInt(sizeControl.value),
              radius: parseInt(radiusControl.value)
            });
          }
        } else if (effectInstances.minecraft) {
          effectInstances.minecraft.destroy();
          effectInstances.minecraft = null;
        }
      });
    }
  }

  // LEGO Effect
  const legoDemo = document.getElementById('lego-demo') as HTMLImageElement;
  if (legoDemo) {
    await ensureImageLoaded(legoDemo);
    
    // Get all control elements
    const blockSizeControl = document.getElementById('lego-block-size') as HTMLInputElement;
    const gapControl = document.getElementById('lego-gap') as HTMLInputElement;
    const studScaleControl = document.getElementById('lego-stud-scale') as HTMLInputElement;
    const depthControl = document.getElementById('lego-depth') as HTMLInputElement;
    const radiusControl = document.getElementById('lego-radius') as HTMLInputElement;
    const softEdgeControl = document.getElementById('lego-soft-edge') as HTMLInputElement;
    const fadeExpControl = document.getElementById('lego-fade-exp') as HTMLInputElement;
    const activeToggle = document.getElementById('lego-active') as HTMLInputElement;
    
    // Get initial values
    let blockSize = parseInt(blockSizeControl?.value || '16');
    let gap = parseInt(gapControl?.value || '2');
    let studScale = parseInt(studScaleControl?.value || '33') / 100; // Convert to 0-1 range
    let depth = parseInt(depthControl?.value || '25') / 100; // Convert to 0-1 range
    let radius = parseInt(radiusControl?.value || '140');
    let softEdge = parseInt(softEdgeControl?.value || '90');
    let fadeExp = parseInt(fadeExpControl?.value || '14') / 10; // Convert to decimal
    const active = activeToggle?.checked !== false;
    
    // Update value displays
    updateValue('lego-block-size', blockSize);
    updateValue('lego-gap', gap);
    updateValue('lego-stud-scale', studScale, '');
    updateValue('lego-depth', depth, '');
    updateValue('lego-radius', radius);
    updateValue('lego-soft-edge', softEdge);
    updateValue('lego-fade-exp', fadeExp, '');
    
    // Extended interface for LEGO effect options
    interface LegoOptions {
      effect: 'lego';
      blockSize?: number;
      gap?: number;
      studScale?: number;
      depth?: number;
      radius?: number;
      softEdge?: number;
      fadeExp?: number;
    }
    
    // Function to apply or update the LEGO effect
    const applyLegoEffect = () => {
      // If there's an existing instance, destroy it
      if (effectInstances.lego) {
        effectInstances.lego.destroy();
      }
      
      // Create a new instance with current settings
      const options: LegoOptions = {
        effect: 'lego',
        blockSize: blockSize,
        gap: gap,
        studScale: studScale,
        depth: depth,
        radius: radius,
        softEdge: softEdge,
        fadeExp: fadeExp
      };
      
      effectInstances.lego = applyHoverEffect(legoDemo, options);
    };
    
    // Initially apply the effect
    if (active) {
      applyLegoEffect();
    }
    
    // Block size control handler
    blockSizeControl.addEventListener('input', () => {
      blockSize = parseInt(blockSizeControl.value);
      updateValue('lego-block-size', blockSize);
      
      if (effectInstances.lego && effectInstances.lego.setBlockSize) {
        effectInstances.lego.setBlockSize(blockSize);
      } else {
        applyLegoEffect();
      }
    });
    
    // Gap control handler
    gapControl.addEventListener('input', () => {
      gap = parseInt(gapControl.value);
      updateValue('lego-gap', gap);
      applyLegoEffect();
    });
    
    // Stud scale control handler
    studScaleControl.addEventListener('input', () => {
      studScale = parseInt(studScaleControl.value) / 100;
      updateValue('lego-stud-scale', studScale, '');
      applyLegoEffect();
    });
    
    // Depth control handler
    depthControl.addEventListener('input', () => {
      depth = parseInt(depthControl.value) / 100;
      updateValue('lego-depth', depth, '');
      applyLegoEffect();
    });
    
    // Radius control handler
    radiusControl.addEventListener('input', () => {
      radius = parseInt(radiusControl.value);
      updateValue('lego-radius', radius);
      
      if (effectInstances.lego && effectInstances.lego.setRadius) {
        effectInstances.lego.setRadius(radius);
      } else {
        applyLegoEffect();
      }
    });
    
    // Soft edge control handler
    softEdgeControl.addEventListener('input', () => {
      softEdge = parseInt(softEdgeControl.value);
      updateValue('lego-soft-edge', softEdge);
      applyLegoEffect();
    });
    
    // Fade exponent control handler
    fadeExpControl.addEventListener('input', () => {
      fadeExp = parseInt(fadeExpControl.value) / 10;
      updateValue('lego-fade-exp', fadeExp, '');
      applyLegoEffect();
    });
    
    // Toggle effect active state
    activeToggle.addEventListener('change', () => {
      if (activeToggle.checked) {
        applyLegoEffect();
      } else if (effectInstances.lego) {
        effectInstances.lego.destroy();
        effectInstances.lego = null;
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing hover effects demo...');
  
  // Set up tab switching
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all nav items and tab contents
      navItems.forEach(navItem => navItem.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked nav item and corresponding tab content
      item.classList.add('active');
      const tabId = item.getAttribute('data-tab');
      if (tabId) {
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
          tabContent.classList.add('active');
        }
      }
    });
  });
  
  initializeEffects().catch(error => {
    console.error('Failed to initialize effects:', error);
  });
}); 