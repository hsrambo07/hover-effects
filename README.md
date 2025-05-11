# hover-effects

A lightweight library for applying various hover effects to DOM elements.

## Installation

```bash
npm install hover-effects
# or
yarn add hover-effects
# or
pnpm add hover-effects
```

## Usage

```javascript
import { applyHoverEffect } from 'hover-effects';

// Apply ASCII effect
applyHoverEffect('img.portrait', { 
  effect: 'ascii', 
  radius: 80, 
  size: 14 
});

// Apply zoom effect
applyHoverEffect('#hero', { 
  effect: 'zoom', 
  radius: 120, 
  scale: 1.15 
});

// Apply blur effect
applyHoverEffect('.gallery img', { 
  effect: 'blur', 
  radius: 60, 
  strength: 4 
});

// Clean up effects when no longer needed
const effect = applyHoverEffect('.my-element', { effect: 'blur' });
// Later...
effect.destroy();
```

## Available Effects

### ASCII Effect

Transforms images into ASCII art on hover.

Options:
- `radius`: Radius of the effect circle in pixels (default: 100)
- `size`: Size of ASCII characters in pixels (default: 10)
- `chars`: Array of characters to use for ASCII art (default: [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'])

### Blur Effect

Applies a blur filter to elements on hover.

Options:
- `radius`: Radius of the effect circle in pixels (default: 80)
- `strength`: Blur intensity in pixels (default: 5)

### Zoom Effect

Zooms in elements on hover.

Options:
- `radius`: Radius of the effect circle in pixels (default: 100)
- `scale`: Zoom level (default: 1.2)

## API

```typescript
type HoverEffectOptions =
  | ({ effect: "ascii"; size?: number; chars?: string[] })
  | ({ effect: "blur"; strength?: number })
  | ({ effect: "zoom"; scale?: number })
  & { radius?: number };

function applyHoverEffect(
  target: string | HTMLElement | NodeListOf<HTMLElement>,
  options: HoverEffectOptions
): { destroy: () => void };
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## License

MIT 