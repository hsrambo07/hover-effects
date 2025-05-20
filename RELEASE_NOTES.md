# Release Notes - v2.4.3

## Documentation Improvements

1. **Updated Demo Links**
   - Replaced Twitter demo links with YouTube video link
   - Updated all demo references throughout the documentation
   - Added YouTube video thumbnail for better visual representation
   - Removed Twitter embed code

## Migration Guide

No breaking changes were introduced. This is a documentation update only.

# Release Notes - v2.4.2

## Bug Fixes

1. **ASCII Effect Radius Fix**
   - Fixed issue where the ASCII effect radius parameter wasn't working correctly
   - Improved mouse position tracking to properly respect the canvas coordinate system
   - Updated event listeners to attach to the wrapper element for better consistency
   - Enhanced canvas positioning and scaling to ensure the effect works across all screen sizes
   - Added debug information to help diagnose any future radius issues

## Migration Guide

No breaking changes were introduced. This is a pure bugfix release.

# Release Notes - v2.4.1

## Bug Fixes

1. **ParticleDust Effect Improvements**
   - Fixed drift slider functionality to properly update the effect
   - Added robust event handling for consistent slider behavior
   - Fixed variable naming conflicts to ensure controls work properly
   - Improved logging for easier debugging
   - Maintained natural appearance while ensuring slider functionality

## Migration Guide

No breaking changes were introduced. This is a pure bugfix release.

# Release Notes - v2.2.5

## Bug Fixes

1. **Minecraft Effect Improvements**
   - Fixed initialization bug where the constructor defaulted to 6px blocks regardless of provided value
   - Changed default block size from 6px to 28px for better visual quality
   - Fixed `setBlockSize` method to properly update the visual effect in real-time
   - Added safety checks for array bounds when sampling image
   - Added proper error handling throughout the effect implementation

2. **Pixel Effect Improvements**
   - Changed default block size from 6px to 16px for better visual quality
   - Fixed `setBlockSize` method to properly update the visual effect in real-time
   - Improved cursor interaction with better event handling
   - Added safety checks for array bounds when sampling image

3. **General Improvements**
   - Added new debugging methods to all effects:
     - `getBlockSize()` - returns current block size
     - `getRadius()` - returns current radius
     - `getSamplesCount()` - returns number of samples 
     - `getDebugInfo()` - returns comprehensive debug information
   - Added better error messaging and console logging for debugging
   - Updated documentation with correct default values
   - Added explicit type definitions for all debugging methods

## Documentation Improvements

1. **Added Best Practices Section**
   - Proper initialization of effects with loaded images
   - Using UI control values during initialization
   - Safe updates using setter methods
   - Debugging tips for troubleshooting
   - Canvas inspection guidance

2. **Updated README**
   - Corrected default values for Minecraft effect (28px) and Pixel effect (16px)
   - Updated parameter range documentation
   - Added new debugging method documentation

3. **Added Example Code**
   - Created new examples/usage-guide.html with interactive demo
   - Properly demonstrates initialization with UI control values
   - Shows correct usage of setter methods
   - Includes debug features

## Testing

All fixes have been tested in the following scenarios:
- Initialization with different block sizes
- Real-time updates using UI controls
- Edge cases with extreme values
- Array bounds safety with different image sizes
- Debugging output verification

## Migration Guide

No breaking changes were introduced, but developers should:
1. Review any hardcoded default values (6px → 28px for Minecraft, 6px → 16px for Pixel)
2. Consider using the new debugging methods for troubleshooting
3. Follow the best practices in README for initialization

## Contributors

- Harsh Singhal 

# Publishing Checklist
1. npm login
2. npm run build
3. npm publish
4. git tag v2.2.5
5. git push origin v2.2.5

