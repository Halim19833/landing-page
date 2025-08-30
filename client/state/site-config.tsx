import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

export type Slide = {
  id: string;
  url: string;
  alt?: string;
  link?: string;
  hidden?: boolean;
};
export type BoxBackground =
  | { kind: "color"; color: string }
  | {
      kind: "gradient";
      from: string;
      to: string;
      direction?:
        | "to top"
        | "to bottom"
        | "to left"
        | "to right"
        | "to top right"
        | "to top left"
        | "to bottom right"
        | "to bottom left";
    }
  | {
      kind: "image";
      url: string;
      scale?: number;
      opacity?: number;
      overlay?: "none" | "darken" | "lighten";
      overlayStrength?: number;
    };

export type BoxShadow = {
  intensity: number;
  direction: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export type Box = {
  id: string;
  title: string;
  type: "text" | "image" | "both";
  content?: string; // rich text html
  description?: string; // rich text html
  buttonLabel?: string;
  ctaMode?: "button" | "icon" | "both";
  modalEnabled?: boolean;
  modalStyle?: { bg?: string; text?: string; shadow?: string; radius?: number };
  imageUrl?: string;
  align?: "left" | "center" | "right";
  size?: "small" | "medium" | "large";
  height?: number; // px
  borderRadius?: number; // px
  shadow?: BoxShadow;
  background?: BoxBackground;
  hidden?: boolean;
};
export type Logo = { id: string; url: string; href?: string; hidden?: boolean };

export type Language = { code: string; label: string };
export type HeaderConfig = {
  logoText: string;
  logoUrl?: string;
  languageText: string;
  contactText: string;
  languages: Language[];
  selectedLang?: string;
  background?: BoxBackground;
};

export type FooterLinkItem = { text: string; url: string; enabled: boolean };
export type FooterSocialItem = {
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "github" | string;
  url: string;
  icon: string; // lucide icon name or platform key
  order: number;
  enabled: boolean;
};
export type FooterHeadings = {
  about: { title: string; enabled: boolean };
  quick: { title: string; enabled: boolean };
  contact: { title: string; enabled: boolean };
};
export type FooterColors = {
  textColor?: string;
  linkColor?: string;
  iconColor?: string;
};
export type FooterLinksByColumn = {
  about: FooterLinkItem[];
  quick: FooterLinkItem[];
  contact: FooterLinkItem[];
};

export type FooterConfig = {
  text: string;
  description?: string;
  extraText?: string;
  // Legacy quick-links list (kept for migration)
  links?: { label: string; href: string }[];
  // Legacy socials map (kept for migration)
  socials?: Partial<
    Record<
      "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "github",
      string
    >
  >;
  // Legacy order (kept for migration)
  socialOrder?: (
    | "facebook"
    | "twitter"
    | "instagram"
    | "linkedin"
    | "youtube"
    | "github"
  )[];
  background?: BoxBackground;
  // New unified fields
  headings?: FooterHeadings;
  linksByColumn?: FooterLinksByColumn;
  socialIcons?: FooterSocialItem[];
  colors?: FooterColors;
};
export type ThemeConfig = {
  brand: string;
  pageBg?: string; // flat or gradient
  boxesSectionBg?: string;
  logosSectionBg?: string;
  contactSectionBg?: string;
  boxDefaultBg?: string;
};
export type SettingsConfig = {
  sectionPadding?: {
    hero?: number;
    boxes?: number;
    logos?: number;
    contact?: number;
  };
  boxHeights?: { small: number; medium: number; large: number };
  contactEmail?: string;
};

export type SiteConfig = {
  header: HeaderConfig;
  slides: Slide[];
  boxes: Box[];
  logos: Logo[];
  footer: FooterConfig;
  theme: ThemeConfig;
  settings?: SettingsConfig;
};

function expandShortHex(hex?: string | null): string | undefined {
  if (!hex || typeof hex !== "string") return hex || undefined;
  const m = hex.trim().match(/^#([0-9a-fA-F]{3})$/);
  if (m) {
    const [r, g, b] = m[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
}

function sanitizeConfig(data: SiteConfig): SiteConfig {
  const theme = data.theme || ({} as any);
  const fix = (v?: string) => expandShortHex(v) || v;
  const boxes = (data.boxes || []).map((b) => {
    const bg = b.background as any;
    let background: BoxBackground | undefined = undefined;
    if (!bg) background = undefined;
    else if (bg.kind === "color")
      background = {
        kind: "color",
        color:
          expandShortHex((bg.color || bg.value) as string) ||
          (bg.value as string),
      };
    else if (bg.kind === "gradient")
      background = {
        kind: "gradient",
        from: expandShortHex(bg.from) || bg.from,
        to: expandShortHex(bg.to) || bg.to,
        direction: bg.direction || "to bottom",
      };
    else if (bg.kind === "image")
      background = {
        kind: "image",
        url: bg.url || bg.value,
        scale: typeof bg.scale === "number" ? bg.scale : 100,
        opacity: typeof bg.opacity === "number" ? bg.opacity : 1,
        overlay: bg.overlay || "none",
        overlayStrength:
          typeof bg.overlayStrength === "number" ? bg.overlayStrength : 0.4,
      };

    return {
      ...b,
      ctaMode: b.ctaMode || "button",
      borderRadius: typeof b.borderRadius === "number" ? b.borderRadius : 12,
      shadow: b.shadow || { intensity: 12, direction: "bottom-right" },
      background,
      modalStyle: b.modalStyle
        ? {
            ...b.modalStyle,
            bg: expandShortHex(b.modalStyle.bg),
            text: expandShortHex(b.modalStyle.text),
          }
        : b.modalStyle,
    } as Box;
  });

  // Footer migrations and defaults
  const footer = { ...(data.footer || ({} as any)) } as FooterConfig;

  // Headings default
  if (!footer.headings) {
    footer.headings = {
      about: { title: "About", enabled: true },
      quick: { title: "Quick Links", enabled: true },
      contact: { title: "Contact", enabled: true },
    };
  } else {
    footer.headings = {
      about: {
        title: footer.headings.about?.title || "About",
        enabled: footer.headings.about?.enabled !== false,
      },
      quick: {
        title: footer.headings.quick?.title || "Quick Links",
        enabled: footer.headings.quick?.enabled !== false,
      },
      contact: {
        title: footer.headings.contact?.title || "Contact",
        enabled: footer.headings.contact?.enabled !== false,
      },
    };
  }

  // Colors default
  footer.colors = {
    textColor: fix(footer.colors?.textColor) || "#ffffff",
    linkColor: fix(footer.colors?.linkColor) || "#ffffff",
    iconColor: fix(footer.colors?.iconColor) || "#ffffff",
  };

  // Links by column migration
  if (!footer.linksByColumn) {
    const legacy = footer.links || [];
    footer.linksByColumn = {
      about: [],
      quick: legacy.map((l) => ({ text: l.label, url: l.href, enabled: true })),
      contact: [],
    };
  } else {
    const normalize = (items?: FooterLinkItem[]) =>
      (items || []).map((it) => ({
        text: it.text || (it as any).label || "",
        url: it.url || (it as any).href || "#",
        enabled: it.enabled !== false,
      }));
    footer.linksByColumn = {
      about: normalize(footer.linksByColumn.about),
      quick: normalize(footer.linksByColumn.quick),
      contact: normalize(footer.linksByColumn.contact),
    };
  }

  // Social icons migration
  if (!footer.socialIcons) {
    const platforms: FooterSocialItem["platform"][] = [
      "facebook",
      "twitter",
      "instagram",
      "linkedin",
      "youtube",
      "github",
    ];
    const orderList = footer.socialOrder && footer.socialOrder.length > 0 ? footer.socialOrder : platforms;
    const map = footer.socials || {};
    footer.socialIcons = orderList.map((p, idx) => ({
      platform: p,
      url: (map as any)[p] || "",
      icon: p,
      order: idx,
      enabled: Boolean((map as any)[p]),
    }));
  } else {
    footer.socialIcons = (footer.socialIcons || [])
      .map((s, idx) => ({
        platform: s.platform || s.icon || "",
        url: s.url || "",
        icon: s.icon || s.platform || "",
        order: typeof s.order === "number" ? s.order : idx,
        enabled: s.enabled !== false && Boolean(s.url),
      }))
      .sort((a, b) => a.order - b.order);
  }

  const nextFooter: FooterConfig = {
    ...footer,
  };

  return {
    ...data,
    boxes,
    footer: nextFooter,
    theme: {
      ...theme,
      brand: fix(theme.brand),
      pageBg: fix(theme.pageBg),
      boxesSectionBg: fix(theme.boxesSectionBg),
      logosSectionBg: fix(theme.logosSectionBg),
      contactSectionBg: fix(theme.contactSectionBg),
      boxDefaultBg: fix(theme.boxDefaultBg),
    },
  } as SiteConfig;
}

const DEFAULTS: SiteConfig = {
  header: {
    logoText: "NovaTech",
    logoUrl: undefined,
    languageText: "Language",
    contactText: "Contact Us",
    languages: [
      { code: "en", label: "English" },
      { code: "ar", label: "العربية" },
    ],
    selectedLang: "en",
    background: { kind: "color", color: "#ffffff" },
  },
  slides: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1600&auto=format&fit=crop",
      alt: "Team",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop",
      alt: "Dev",
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1600&auto=format&fit=crop",
      alt: "Design",
    },
  ],
  boxes: [
    {
      id: "b1",
      title: "Insights",
      type: "image",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets%2Ff923cd6a6a804325bb6d727c52cfce1d%2F7f9eafdf820d41e39483090ec9028652?format=webp&width=800",
      size: "small",
      height: 200,
      background: { kind: "color", color: "#ecfeff" },
      description: "Deep dives and analytics for smarter decisions.",
      buttonLabel: "Read More",
      ctaMode: "button",
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    },
    {
      id: "b2",
      title: "Automation",
      type: "image",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets%2Ff923cd6a6a804325bb6d727c52cfce1d%2Fc55bbf2b2f434abe8618539f059c18ff?format=webp&width=800",
      size: "small",
      height: 200,
      background: { kind: "color", color: "#ecfdf5" },
      description: "Automate workflows and boost productivity.",
      buttonLabel: "Read More",
      ctaMode: "button",
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    },
    {
      id: "b3",
      title: "Analytics",
      type: "image",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets%2Ff923cd6a6a804325bb6d727c52cfce1d%2F4ecc3c55ebf34aa885d3e37a7e6beda4?format=webp&width=800",
      size: "small",
      height: 200,
      background: { kind: "color", color: "#fffbeb" },
      description: "Measure what matters with clarity.",
      buttonLabel: "Read More",
      ctaMode: "button",
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    },
    {
      id: "b4",
      title: "Featured Solution",
      type: "image",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets%2Ff923cd6a6a804325bb6d727c52cfce1d%2F8fb791d1ba9d41dfb0dde327a0d2b698?format=webp&width=800",
      size: "large",
      height: 280,
      background: { kind: "color", color: "#fff7ed" },
      description: "Our flagship offering solves complex problems elegantly.",
      buttonLabel: "Read More",
      ctaMode: "button",
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    },
    {
      id: "b5",
      title: "Collaboration",
      type: "image",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets%2Ff923cd6a6a804325bb6d727c52cfce1d%2F58a46bbc0a2d4a1ba926aa1d62774caf?format=webp&width=800",
      size: "medium",
      height: 200,
      background: { kind: "color", color: "#eff6ff" },
      description: "Work together in real-time with ease.",
      buttonLabel: "Read More",
      ctaMode: "button",
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    },
    {
      id: "b6",
      title: "Design",
      type: "image",
      imageUrl:
        "https://cdn.builder.io/api/v1/image/assets%2Ff923cd6a6a804325bb6d727c52cfce1d%2Fb995546b58f94a9ab4fb5d25fb334121?format=webp&width=800",
      size: "medium",
      height: 200,
      background: { kind: "color", color: "#fdf2f8" },
      description: "Pixel-perfect, user-centric interfaces.",
      buttonLabel: "Read More",
      ctaMode: "button",
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    },
  ],
  logos: [
    {
      id: "l1",
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    },
    {
      id: "l2",
      url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    },
    {
      id: "l3",
      url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    },
    {
      id: "l4",
      url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    },
    {
      id: "l5",
      url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Stack_Overflow_logo.svg",
    },
    {
      id: "l6",
      url: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    },
  ],
  footer: {
    text: `© ${new Date().getFullYear()} NovaTech. All rights reserved.`,
    description:
      "We craft reliable web platforms and modern digital experiences with a focus on performance and usability.",
    links: [
      { label: "About", href: "#" },
      { label: "Services", href: "#" },
      { label: "Contact", href: "#contact" },
    ],
    socials: {},
    socialOrder: ["facebook", "twitter", "instagram", "linkedin"],
    background: { kind: "color", color: "#0a0a0a" },
    // new fields will be filled by sanitizeConfig
  },
  theme: {
    brand: "#0ea5e9",
    pageBg: "#ffffff",
    boxesSectionBg: "transparent",
    logosSectionBg: "transparent",
    contactSectionBg: "#1a1a1a",
    boxDefaultBg: "#f6f6f6",
  },
  settings: {
    sectionPadding: { hero: 24, boxes: 24, logos: 16, contact: 32 },
    boxHeights: { small: 200, medium: 200, large: 280 },
    contactEmail: "nosahalim13@gmail.com",
  },
} as SiteConfig;

const KEY = "site-config-v1";

function load(): SiteConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return sanitizeConfig(DEFAULTS);
    const parsed = JSON.parse(raw) as SiteConfig;
    return sanitizeConfig({ ...DEFAULTS, ...parsed } as SiteConfig);
  } catch {
    return sanitizeConfig(DEFAULTS);
  }
}

function save(data: SiteConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (err) {
    console.warn(
      "LocalStorage quota or write error; state kept in memory only.",
      err,
    );
  }
  try {
    window.dispatchEvent(
      new CustomEvent("site-config-change", { detail: data }),
    );
    window.dispatchEvent(new Event("storage"));
  } catch {}
}

type Action =
  | { type: "set"; data: Partial<SiteConfig> }
  | { type: "replace"; data: SiteConfig };
function reducer(state: SiteConfig, action: Action): SiteConfig {
  switch (action.type) {
    case "set": {
      const next = { ...state, ...action.data } as SiteConfig;
      const sanitized = sanitizeConfig(next);
      save(sanitized);
      return sanitized;
    }
    case "replace":
      return action.data;
  }
}

const Ctx = createContext<{
  state: SiteConfig;
  set: (d: Partial<SiteConfig>) => void;
}>({ state: DEFAULTS, set: () => {} });

export function SiteConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, undefined as any, load);
  useEffect(() => {
    const onStorage = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        if (e.key === KEY && e.newValue)
          dispatch({ type: "replace", data: JSON.parse(e.newValue) });
      } else if ((e as CustomEvent).detail) {
        dispatch({
          type: "replace",
          data: (e as CustomEvent).detail as SiteConfig,
        });
      }
    };
    window.addEventListener("storage", onStorage as any);
    window.addEventListener("site-config-change", onStorage as any);
    return () => {
      window.removeEventListener("storage", onStorage as any);
      window.removeEventListener("site-config-change", onStorage as any);
    };
  }, []);
  const value = useMemo(
    () => ({
      state,
      set: (d: Partial<SiteConfig>) => dispatch({ type: "set", data: d }),
    }),
    [state],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteConfig() {
  return useContext(Ctx);
}
