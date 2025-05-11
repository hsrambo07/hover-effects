export type HoverEffectOptions =
  | ({ effect: "ascii"; size?: number; chars?: string[] })
  | ({ effect: "blur"; strength?: number })
  | ({ effect: "zoom"; scale?: number })
  & { radius?: number };

export interface HoverEffect {
  attach(element: HTMLElement): void;
  detach(): void;
  destroy(): void;
}
