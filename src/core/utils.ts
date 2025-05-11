export function getTargets(
  target: string | HTMLElement | NodeListOf<HTMLElement>
): HTMLElement[] {
  if (typeof target === 'string') {
    return Array.from(document.querySelectorAll(target)) as HTMLElement[];
  } else if (target instanceof HTMLElement) {
    return [target];
  } else if (target instanceof NodeList) {
    return Array.from(target) as HTMLElement[];
  }
  
  return [];
}
