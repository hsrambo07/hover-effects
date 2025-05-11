export type HoverEffectOptions =
  | ({ effect: "ascii"; size?: number; chars?: string[]; radius?: number })
  | ({ effect: "zoom"; scale?: number; radius?: number })
  | ({ effect: "particle-dust"; spacing?: number; maxDrift?: number; radius?: number })
  | ({ effect: "pixel"; blockSize?: number; radius?: number })
  | ({ effect: "minecraft"; blockSize?: number; radius?: number });

export interface HoverEffect {
  attach(element: HTMLElement): void;
  detach(): void;
  destroy(): void;
}
