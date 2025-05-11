import { applyHoverEffect } from "./debug";

console.log("Initializing hover effects...");

// Utility function to create effect with controls
function createEffectWithControls(
  selector: string,
  options: any,
  radiusControlId: string,
  radiusValueId: string
) {
  const effect = applyHoverEffect(selector, options);
  const radiusControl = document.getElementById(radiusControlId) as HTMLInputElement;
  const radiusValue = document.getElementById(radiusValueId) as HTMLSpanElement;

  if (radiusControl && radiusValue) {
    radiusControl.addEventListener('input', () => {
      const newRadius = parseInt(radiusControl.value);
      radiusValue.textContent = newRadius.toString();
      
      // Remove old effect and create new one with updated radius
      effect.destroy();
      applyHoverEffect(selector, { ...options, radius: newRadius });
    });
  }

  return effect;
}

// Utility function to create effect with multiple controls
function createEffectWithMultipleControls(
  selector: string,
  options: any,
  controls: Array<{
    controlId: string,
    valueId: string,
    optionKey: string
  }>
) {
  let effect = applyHoverEffect(selector, options);

  controls.forEach(({ controlId, valueId, optionKey }) => {
    const control = document.getElementById(controlId) as HTMLInputElement;
    const value = document.getElementById(valueId) as HTMLSpanElement;

    if (control && value) {
      control.addEventListener('input', () => {
        const newValue = parseInt(control.value);
        value.textContent = newValue.toString();
        
        // Update options with new value
        options[optionKey] = newValue;
        
        // Remove old effect and create new one with updated options
        effect.destroy();
        effect = applyHoverEffect(selector, options);
      });
    }
  });

  return effect;
}

// Apply ASCII effect to images with data-hover="ascii" attribute
const asciiElements = document.querySelectorAll("img[data-hover='ascii']");
console.log(`Found ${asciiElements.length} ASCII elements`);
createEffectWithControls("img[data-hover='ascii']", { 
  effect: "ascii", 
  radius: 80, 
  size: 14 
}, "asciiRadius", "asciiRadiusValue");
console.log("ASCII effect applied");

// Apply zoom effect to hero section
createEffectWithControls("#hero", { 
  effect: "zoom", 
  radius: 120, 
  scale: 1.15 
}, "zoomRadius", "zoomRadiusValue");
console.log("Zoom effect applied");

// Apply particle dust effect to images with data-hover="particle" attribute
const particleElements = document.querySelectorAll("img[data-hover='particle']");
console.log(`Found ${particleElements.length} particle elements`);
createEffectWithControls("img[data-hover='particle']", {
  effect: "particle-dust",
  radius: 110,
  spacing: 4,
  maxDrift: 28
}, "particleRadius", "particleRadiusValue");
console.log("Particle dust effect applied");

// Apply minecraft effect to images with data-hover="minecraft" attribute
const minecraftElements = document.querySelectorAll("img[data-hover='minecraft']");
console.log(`Found ${minecraftElements.length} minecraft elements`);
createEffectWithMultipleControls("img[data-hover='minecraft']", {
  effect: "minecraft",
  radius: 130,
  blockSize: 6
}, [
  {
    controlId: "minecraftRadius",
    valueId: "minecraftRadiusValue",
    optionKey: "radius"
  },
  {
    controlId: "minecraftBlock",
    valueId: "minecraftBlockValue",
    optionKey: "blockSize"
  }
]);
console.log("Minecraft effect applied");

// Apply pixel effect to images with data-hover="pixel" attribute
const pixelElements = document.querySelectorAll("img[data-hover='pixel']");
console.log(`Found ${pixelElements.length} pixel elements`);
createEffectWithMultipleControls("img[data-hover='pixel']", {
  effect: "pixel",
  radius: 130,
  blockSize: 6
}, [
  {
    controlId: "pixelRadius",
    valueId: "pixelRadiusValue",
    optionKey: "radius"
  },
  {
    controlId: "pixelBlock",
    valueId: "pixelBlockValue",
    optionKey: "blockSize"
  }
]);
console.log("Pixel effect applied"); 