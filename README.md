# Hover Effects

A collection of beautiful hover effects for images, built with TypeScript and Canvas.

## Features

- 🖼️ **Multiple Effects**: Choose from ASCII art, zoom, particle dust, pixel art, and Minecraft-style effects
- 🎨 **Canvas-based**: Smooth, performant animations using the Canvas API
- 📱 **Responsive**: Works with any image size
- 🎮 **Interactive**: Dynamic effects that respond to mouse movement
- 🔧 **Customizable**: Configure effect parameters to match your needs

## Installation

```bash
npm install hover-effects-ts
# or
yarn add hover-effects-ts
# or
pnpm add hover-effects-ts
```

## Usage

```typescript
import { applyHoverEffect } from 'hover-effects-ts';

// Apply an effect to a single image
const image = document.querySelector('img');
const effect = applyHoverEffect(image, {
  effect: 'zoom',
  scale: 1.2,
  radius: 100
});

// Apply an effect to multiple images
const images = document.querySelectorAll('.hover-image');
const effect = applyHoverEffect(images, {
  effect: 'ascii',
  size: 12,
  radius: 70
});

// Clean up when done
effect.destroy();
```

## Available Effects

### Zoom Effect
```typescript
applyHoverEffect(element, {
  effect: 'zoom',
  scale: 1.2,    // Zoom scale (default: 1.2)
  radius: 100    // Effect radius in pixels (default: 100)
});
```

### ASCII Art Effect
```typescript
applyHoverEffect(element, {
  effect: 'ascii',
  size: 12,      // Character size in pixels (default: 12)
  radius: 70,    // Effect radius in pixels (default: 70)
  chars: ['@', '#', '$', '*', '+', '=', '-', ':', '.', ' '] // Optional custom characters
});
```

### Particle Dust Effect
```typescript
applyHoverEffect(element, {
  effect: 'particle-dust',
  spacing: 4,     // Particle spacing in pixels (default: 4)
  maxDrift: 28,   // Maximum particle drift distance (default: 28)
  radius: 110     // Effect radius in pixels (default: 110)
});
```

### Pixel Effect
```typescript
applyHoverEffect(element, {
  effect: 'pixel',
  blockSize: 6,   // Pixel size in pixels (default: 6)
  radius: 130     // Effect radius in pixels (default: 130)
});
```

### Minecraft Effect
```typescript
applyHoverEffect(element, {
  effect: 'minecraft',
  blockSize: 6,   // Block size in pixels (default: 6)
  radius: 130     // Effect radius in pixels (default: 130)
});
```

## Browser Support

The library uses modern web APIs and is supported in all modern browsers:

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Development

To run the development server:

```bash
npm install
npm run dev
```

## License

MIT © Harsh Singhal

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-new-feature`)
5. Create new Pull Request ## Live Demo
Check out our live demo to see all the effects in action:
All effects are showcased with customizable parameters and work smoothly on all modern browsers.
