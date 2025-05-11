/**
 * Full Effect Mode implementation
 * This script handles applying effects to the entire image without requiring hover
 */

// Track full mode state for each effect
const fullModeState = {};

// Store created effect instances
let effectInstances = {};

// Function to get the center position of an image
function getImageCenter(img) {
  if (!img) return { x: 0, y: 0 };
  const rect = img.getBoundingClientRect();
  return {
    x: rect.width / 2,
    y: rect.height / 2
  };
}

// Function to create a simulated mouse event
function createMouseEvent(type, x, y) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y
  });
}

// Function to patch the hover effect to cover the whole image
function patchEffectRadius(effectId) {
  const img = document.getElementById(`${effectId}-demo`);
  if (!img || !effectInstances[effectId]) return;
  
  // Get the original radius
  const originalRadius = effectInstances[effectId].radius || 
                         effectInstances[effectId].options?.radius || 100;
  
  console.log(`[FullMode] ${effectId}: Original radius: ${originalRadius}`);
  
  // Store original radius for restoration later
  if (!fullModeState[effectId].originalRadius) {
    fullModeState[effectId].originalRadius = originalRadius;
  }
  
  // Calculate new radius to cover the entire image (diagonal measurement)
  const rect = img.getBoundingClientRect();
  const diagonal = Math.ceil(Math.sqrt(rect.width * rect.width + rect.height * rect.height));
  const newRadius = diagonal * 2; // Extra large to ensure full coverage
  
  console.log(`[FullMode] ${effectId}: New radius: ${newRadius} (diagonal: ${diagonal})`);
  
  // Update the radius in the effect instance
  if (typeof effectInstances[effectId].setRadius === 'function') {
    console.log(`[FullMode] ${effectId}: Using setRadius() method`);
    effectInstances[effectId].setRadius(newRadius);
  } else {
    console.log(`[FullMode] ${effectId}: Using control trigger method`);
    // Recreate the effect with a much larger radius
    // Get the current control values
    const radiusControl = document.getElementById(`${effectId}-radius`);
    if (radiusControl) {
      // Temporarily set a very large value
      const originalValue = radiusControl.value;
      console.log(`[FullMode] ${effectId}: Original control value: ${originalValue}`);
      radiusControl.value = newRadius;
      
      // Trigger a change event
      radiusControl.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Restore the display value but keep the actual large radius
      const valueDisplay = document.getElementById(`${effectId}-radius-value`);
      if (valueDisplay) {
        valueDisplay.textContent = `${originalValue}px`;
      }
      
      // Store the control for later restoration
      fullModeState[effectId].radiusControl = radiusControl;
      fullModeState[effectId].radiusValue = originalValue;
    }
  }
}

// Function to restore original radius
function restoreEffectRadius(effectId) {
  if (!fullModeState[effectId].originalRadius) return;
  
  // Restore original radius if possible
  if (effectInstances[effectId] && typeof effectInstances[effectId].setRadius === 'function') {
    effectInstances[effectId].setRadius(fullModeState[effectId].originalRadius);
  } else if (fullModeState[effectId].radiusControl) {
    // Restore control value
    fullModeState[effectId].radiusControl.value = fullModeState[effectId].radiusValue;
    fullModeState[effectId].radiusControl.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// Function to apply full effect mode
function applyFullEffectMode(effectId) {
  const img = document.getElementById(`${effectId}-demo`);
  if (!img) return;
  
  const rect = img.getBoundingClientRect();
  const center = getImageCenter(img);
  const x = rect.left + center.x;
  const y = rect.top + center.y;
  
  // Create and dispatch a simulated mouse enter event
  const enterEvent = createMouseEvent('mouseenter', x, y);
  
  // First dispatch the event to trigger the effect
  img.dispatchEvent(enterEvent);
  
  // Patch the effect to cover the whole image
  patchEffectRadius(effectId);
  
  // Then manually update the effect's mouse position
  if (effectInstances[effectId]) {
    if (typeof effectInstances[effectId].updateMousePosition === 'function') {
      effectInstances[effectId].updateMousePosition(center.x, center.y);
    } else if (typeof effectInstances[effectId].onMouseMove === 'function') {
      // Create move event at center
      const moveEvent = createMouseEvent('mousemove', x, y);
      effectInstances[effectId].onMouseMove(moveEvent);
    }
  }
  
  // Create an animation loop to continuously update the effect
  if (fullModeState[effectId]?.interval) {
    clearInterval(fullModeState[effectId].interval);
  }
  
  fullModeState[effectId] = {
    ...fullModeState[effectId],
    active: true,
    interval: setInterval(() => {
      // Periodically update the mouse position to ensure effect remains applied
      const moveEvent = createMouseEvent('mousemove', x, y);
      img.dispatchEvent(moveEvent);
      
      // Directly update effect instance if available
      if (effectInstances[effectId]) {
        if (typeof effectInstances[effectId].updateMousePosition === 'function') {
          effectInstances[effectId].updateMousePosition(center.x, center.y);
        } else if (typeof effectInstances[effectId].onMouseMove === 'function') {
          effectInstances[effectId].onMouseMove(moveEvent);
        }
        
        // Force canvas to stay visible
        const canvas = img.parentElement.querySelector('canvas');
        if (canvas) {
          canvas.style.opacity = '1';
        }
      }
    }, 100) // Update every 100ms
  };
}

// Function to remove full effect mode
function removeFullEffectMode(effectId) {
  if (fullModeState[effectId]?.interval) {
    clearInterval(fullModeState[effectId].interval);
  }
  
  // Restore original radius
  restoreEffectRadius(effectId);
  
  fullModeState[effectId] = { 
    ...fullModeState[effectId],
    active: false 
  };
  
  const img = document.getElementById(`${effectId}-demo`);
  if (!img) return;
  
  // Create and dispatch a simulated mouse leave event
  const leaveEvent = createMouseEvent('mouseleave', 0, 0);
  img.dispatchEvent(leaveEvent);
}

// Initialize full effect mode handlers
function initializeFullEffectMode() {
  // Wait for the DOM and effect instances to be initialized
  setTimeout(() => {
    // Get effect instances from main.ts
    if (window.effectInstances) {
      effectInstances = window.effectInstances;
    }
    
    // Set up event listeners for full mode toggles
    document.querySelectorAll('[id$="-full"]').forEach(checkbox => {
      const effectId = checkbox.id.replace('-full', '');
      
      // Initialize state
      fullModeState[effectId] = { active: checkbox.checked };
      
      // Apply initial state if checked
      if (checkbox.checked) {
        applyFullEffectMode(effectId);
      }
      
      // Handle toggle changes
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          applyFullEffectMode(effectId);
        } else {
          removeFullEffectMode(effectId);
        }
      });
    });
    
    // Handle effect re-creation (when controls are changed)
    const observer = new MutationObserver((mutations) => {
      if (window.effectInstances) {
        effectInstances = window.effectInstances;
        
        // Check if any effects in full mode need to be reapplied
        Object.keys(fullModeState).forEach(effectId => {
          if (fullModeState[effectId]?.active) {
            applyFullEffectMode(effectId);
          }
        });
      }
    });
    
    // Watch for changes to the effect-preview containers
    document.querySelectorAll('.effect-preview').forEach(container => {
      observer.observe(container, { childList: true, subtree: true });
    });
  }, 1000); // Wait 1 second for everything to initialize
}

// Initialize when the page loads
window.addEventListener('load', initializeFullEffectMode);

// Re-initialize when switching tabs
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    setTimeout(() => {
      const tabId = item.getAttribute('data-tab');
      if (fullModeState[tabId]?.active) {
        applyFullEffectMode(tabId);
      }
    }, 200);
  });
});

// Expose to window for debugging
window.fullModeState = fullModeState; 