// Wait for images to load first
document.addEventListener('DOMContentLoaded', () => {
  const minecraftDemo = document.getElementById('minecraft-demo');
  const pixelDemo = document.getElementById('pixel-demo');
  
  // Store effect instances
  let minecraftEffect = null;
  let pixelEffect = null;
  
  // Initialize effects when images are loaded
  const initializeEffects = () => {
    // Get current slider values
    const minecraftBlockSize = parseInt(document.getElementById('minecraft-block-size').value);
    const minecraftRadius = parseInt(document.getElementById('minecraft-radius').value);
    
    const pixelBlockSize = parseInt(document.getElementById('pixel-block-size').value);
    const pixelRadius = parseInt(document.getElementById('pixel-radius').value);
    
    console.log('Initializing Minecraft effect with:', { blockSize: minecraftBlockSize, radius: minecraftRadius });
    console.log('Initializing Pixel effect with:', { blockSize: pixelBlockSize, radius: pixelRadius });
    
    try {
      // Apply Minecraft effect with values from sliders
      minecraftEffect = HoverEffects.applyHoverEffect(minecraftDemo, {
        effect: 'minecraft',
        blockSize: minecraftBlockSize,
        radius: minecraftRadius
      });
      
      // Apply Pixel effect with values from sliders
      pixelEffect = HoverEffects.applyHoverEffect(pixelDemo, {
        effect: 'pixel',
        blockSize: pixelBlockSize,
        radius: pixelRadius
      });
      
      // Set up controls
      setupControls();
    } catch (error) {
      console.error('Error initializing effects:', error);
    }
  };
  
  // Wait for images to load
  let imagesLoaded = 0;
  const onImageLoad = () => {
    imagesLoaded++;
    if (imagesLoaded === 2) {
      initializeEffects();
    }
  };
  
  if (minecraftDemo.complete) {
    onImageLoad();
  } else {
    minecraftDemo.onload = onImageLoad;
  }
  
  if (pixelDemo.complete) {
    onImageLoad();
  } else {
    pixelDemo.onload = onImageLoad;
  }
  
  // Setup control handlers
  const setupControls = () => {
    // Minecraft controls
    const minecraftBlockSizeSlider = document.getElementById('minecraft-block-size');
    const minecraftRadiusSlider = document.getElementById('minecraft-radius');
    const minecraftBlockSizeValue = document.getElementById('minecraft-block-size-value');
    const minecraftRadiusValue = document.getElementById('minecraft-radius-value');
    const minecraftDebugBtn = document.getElementById('minecraft-debug');
    const minecraftDebugOutput = document.getElementById('minecraft-debug-output');
    
    // Update block size using setter method
    minecraftBlockSizeSlider.addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      minecraftBlockSizeValue.textContent = size;
      
      try {
        minecraftEffect.setBlockSize(size);
      } catch (error) {
        console.error('Error updating Minecraft block size:', error);
      }
    });
    
    // Update radius using setter method
    minecraftRadiusSlider.addEventListener('input', (e) => {
      const radius = parseInt(e.target.value);
      minecraftRadiusValue.textContent = radius;
      
      try {
        minecraftEffect.setRadius(radius);
      } catch (error) {
        console.error('Error updating Minecraft radius:', error);
      }
    });
    
    // Debug button
    minecraftDebugBtn.addEventListener('click', () => {
      try {
        const debugInfo = minecraftEffect.getDebugInfo();
        minecraftDebugOutput.textContent = JSON.stringify(debugInfo, null, 2);
      } catch (error) {
        minecraftDebugOutput.textContent = 'Error getting debug info: ' + error.message;
      }
    });
    
    // Pixel controls (similar pattern)
    const pixelBlockSizeSlider = document.getElementById('pixel-block-size');
    const pixelRadiusSlider = document.getElementById('pixel-radius');
    const pixelBlockSizeValue = document.getElementById('pixel-block-size-value');
    const pixelRadiusValue = document.getElementById('pixel-radius-value');
    const pixelDebugBtn = document.getElementById('pixel-debug');
    const pixelDebugOutput = document.getElementById('pixel-debug-output');
    
    pixelBlockSizeSlider.addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      pixelBlockSizeValue.textContent = size;
      
      try {
        pixelEffect.setBlockSize(size);
      } catch (error) {
        console.error('Error updating Pixel block size:', error);
      }
    });
    
    pixelRadiusSlider.addEventListener('input', (e) => {
      const radius = parseInt(e.target.value);
      pixelRadiusValue.textContent = radius;
      
      try {
        pixelEffect.setRadius(radius);
      } catch (error) {
        console.error('Error updating Pixel radius:', error);
      }
    });
    
    pixelDebugBtn.addEventListener('click', () => {
      try {
        const debugInfo = pixelEffect.getDebugInfo();
        pixelDebugOutput.textContent = JSON.stringify(debugInfo, null, 2);
      } catch (error) {
        pixelDebugOutput.textContent = 'Error getting debug info: ' + error.message;
      }
    });
  };
}); 