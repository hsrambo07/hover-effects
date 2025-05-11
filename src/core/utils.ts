/**
 * Get target elements from various input types
 * @param target - A CSS selector, HTMLElement, or NodeList of HTMLElements
 * @returns An array of HTMLElements
 */
export function getTargets(
  target: string | HTMLElement | NodeListOf<HTMLElement>
): HTMLElement[] {
  if (typeof target === 'string') {
    const elements = document.querySelectorAll(target);
    console.log(`Query selector "${target}" found ${elements.length} elements`);
    return Array.from(elements) as HTMLElement[];
  } else if (target instanceof HTMLElement) {
    return [target];
  } else if (target instanceof NodeList) {
    return Array.from(target) as HTMLElement[];
  }
  return [];
}

/**
 * Shade a color by a percentage
 * @param rgb - RGB color string (e.g., 'rgb(255,255,255)')
 * @param pct - Percentage to shade (-1 to 1)
 * @returns Shaded RGB color string
 */
export function shadeColor(rgb: string, pct: number): string {
  const colors = rgb.match(/\d+/g)?.map(Number) || [0, 0, 0];
  return `rgb(${colors.map(v => 
    Math.min(255, Math.max(0, v * (1 + pct))) | 0
  ).join(',')})`;
}

/**
 * Create a wrapper element for an effect
 * @param element - Element to wrap
 * @param className - Class name for the wrapper
 * @returns The wrapper element
 */
export function createWrapper(element: HTMLElement, className: string): HTMLElement {
  let wrapper = element.parentElement;
  if (!wrapper || !wrapper.classList.contains(className)) {
    wrapper = document.createElement('div');
    wrapper.className = className;
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    element.replaceWith(wrapper);
    wrapper.appendChild(element);
  }
  return wrapper;
}

/**
 * Create and setup a canvas element
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns The configured canvas element
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 0.25s ease';
  return canvas;
}
