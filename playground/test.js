/**
 * This script helps verify the Minecraft effect implementation.
 * Open the developer tools console and run this script when 
 * you're viewing the Minecraft tab in the playground.
 */

// Helper function to test the Minecraft effect
function testMinecraftEffect() {
  console.log('=== Minecraft Effect Test ===');
  
  // Get the effect instance
  const effect = window.effectInstances?.minecraft;
  if (!effect) {
    console.error('❌ Minecraft effect not found!');
    return;
  }
  
  console.log('✅ Minecraft effect found');
  
  // Test setBlockSize method
  if (typeof effect.setBlockSize === 'function') {
    console.log('✅ setBlockSize method exists');
    
    // Try to access blockSize for verification
    let blockSizeBefore;
    try {
      blockSizeBefore = effect.blockSize;
      console.log('  Current blockSize:', blockSizeBefore);
    } catch (e) {
      console.log('  Unable to access current blockSize directly');
    }
    
    // Run tests with different block sizes
    const testSizes = [12, 24, 36, 48];
    console.log('  Testing block sizes:', testSizes);
    
    let currentIndex = 0;
    
    function testNextSize() {
      if (currentIndex >= testSizes.length) {
        console.log('✅ Block size test sequence complete');
        return;
      }
      
      const size = testSizes[currentIndex++];
      console.log(`  Setting block size to ${size}...`);
      
      // Update the slider for visual feedback
      const slider = document.getElementById('minecraft-size');
      if (slider) {
        slider.value = size;
        const event = new Event('input');
        slider.dispatchEvent(event);
      } else {
        // Directly call the method if slider not found
        effect.setBlockSize(size);
      }
      
      // Schedule next test
      setTimeout(testNextSize, 1500);
    }
    
    // Start the test sequence
    testNextSize();
  } else {
    console.error('❌ setBlockSize method not found!');
  }
  
  // Test setRadius method
  if (typeof effect.setRadius === 'function') {
    console.log('✅ setRadius method exists');
  } else {
    console.error('❌ setRadius method not found!');
  }
  
  console.log('=== Test Complete ===');
}

// Run the test
testMinecraftEffect(); 