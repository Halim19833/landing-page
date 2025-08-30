export type AnyBackground =
  | { kind: "color"; color: string }
  | { kind: "gradient"; from: string; to: string; direction?: string }
  | {
      kind: "image";
      url: string;
      scale?: number;
      opacity?: number;
      overlay?: "none" | "darken" | "lighten";
      overlayStrength?: number;
    };

export function bgStyleFrom(background?: AnyBackground): React.CSSProperties {
  if (!background) return {};
  if (background.kind === "color") return { background: background.color };
  if (background.kind === "gradient")
    return {
      background: `linear-gradient(${background.direction || "to bottom"}, ${background.from}, ${background.to})`,
    };
  if (background.kind === "image") {
    const overlay =
      background.overlay === "darken"
        ? `rgba(0,0,0,${background.overlayStrength ?? 0.4})`
        : background.overlay === "lighten"
          ? `rgba(255,255,255,${background.overlayStrength ?? 0.4})`
          : undefined;
    return {
      backgroundImage: `${overlay ? `linear-gradient(${overlay}, ${overlay}),` : ""} url(${background.url})`,
      backgroundSize: `${background.scale || 100}% auto`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      opacity: background.opacity == null ? 1 : background.opacity,
    } as React.CSSProperties;
  }
  return {};
}
