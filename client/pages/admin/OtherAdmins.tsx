import { useSiteConfig } from "@/state/site-config";
import {
  AdminPageHeader,
  AdminCard,
  AdminSection,
  AdminButton,
  AdminIconButton,
  AdminFormGroup,
  AdminInput,
  AdminTextarea,
  AdminSelect,
} from "@/components/admin/AdminUI";
import { Image as ImageIcon, Plus, Trash2, Eye, EyeOff } from "lucide-react";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function BackgroundControls({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm">Background</label>
      <div className="flex flex-wrap gap-2">
        <select
          value={value?.kind || "color"}
          onChange={(e) =>
            onChange(
              e.target.value === "color"
                ? { kind: "color", color: "#ffffff" }
                : e.target.value === "gradient"
                  ? {
                      kind: "gradient",
                      from: "#ffffff",
                      to: "#f3f4f6",
                      direction: "to bottom",
                    }
                  : {
                      kind: "image",
                      url: "",
                      scale: 100,
                      opacity: 1,
                      overlay: "none",
                      overlayStrength: 0.4,
                    },
            )
          }
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="color">Color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
        </select>
        {value?.kind === "color" && (
          <input
            type="color"
            value={value.color || "#ffffff"}
            onChange={(e) => onChange({ kind: "color", color: e.target.value })}
          />
        )}
        {value?.kind === "gradient" && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.from || "#ffffff"}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
            />
            <input
              type="color"
              value={value.to || "#f3f4f6"}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
            />
            <select
              value={value.direction || "to bottom"}
              onChange={(e) => onChange({ ...value, direction: e.target.value })}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="to top">to top</option>
              <option value="to bottom">to bottom</option>
              <option value="to left">to left</option>
              <option value="to right">to right</option>
              <option value="to top right">to top right</option>
              <option value="to top left">to top left</option>
              <option value="to bottom right">to bottom right</option>
              <option value="to bottom left">to bottom left</option>
            </select>
          </div>
        )}
        {value?.kind === "image" && (
          <div className="space-y-2 w-full">
            {value.url && (
              <img src={value.url} alt="bg" className="h-14 w-24 object-cover rounded" />
            )}
            <label className="text-xs px-2 py-1 rounded bg-neutral-800 text-white cursor-pointer inline-block">
              Upload Background
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await new Promise<string>((res, rej) => {
                    const r = new FileReader();
                    r.onload = () => res(r.result as string);
                    r.onerror = rej;
                    r.readAsDataURL(f);
                  });
                  onChange({ ...value, url });
                }}
              />
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16">Scale</span>
              <input
                type="range"
                min={50}
                max={200}
                value={value.scale || 100}
                onChange={(e) => onChange({ ...value, scale: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16">Opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={value.opacity ?? 1}
                onChange={(e) => onChange({ ...value, opacity: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16">Adjust</span>
              <select
                value={value.overlay || "none"}
                onChange={(e) => onChange({ ...value, overlay: e.target.value })}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="none">None</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
              </select>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={value.overlayStrength ?? 0.4}
                onChange={(e) =>
                  onChange({ ...value, overlayStrength: Number(e.target.value) })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function HeaderAdmin() {
  const { state, set } = useSiteConfig();

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await readFileAsDataURL(f);
    set({ header: { ...state.header, logoUrl: url } });
  };

  const addLang = () =>
    set({
      header: {
        ...state.header,
        languages: [...(state.header.languages || []), { code: "", label: "" }],
      },
    });
  const updateLang = (i: number, patch: Partial<{ code: string; label: string }>) =>
    set({
      header: {
        ...state.header,
        languages: state.header.languages.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
      },
    });
  const removeLang = (i: number) =>
    set({
      header: {
        ...state.header,
        languages: state.header.languages.filter((_, idx) => idx !== i),
      },
    });

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Header" description="Manage site logo, labels, languages, and header background." />

      <AdminCard className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <AdminFormGroup label="Logo Text">
            <AdminInput
              value={state.header.logoText}
              onChange={(e) => set({ header: { ...state.header, logoText: e.target.value } })}
              placeholder="Logo text"
            />
          </AdminFormGroup>
          <AdminFormGroup label="Language Label">
            <AdminInput
              value={state.header.languageText}
              onChange={(e) => set({ header: { ...state.header, languageText: e.target.value } })}
              placeholder="Language label"
            />
          </AdminFormGroup>
          <AdminFormGroup label="Contact Text">
            <AdminInput
              value={state.header.contactText}
              onChange={(e) => set({ header: { ...state.header, contactText: e.target.value } })}
              placeholder="Contact text"
            />
          </AdminFormGroup>
        </div>

        <div className="flex items-center gap-3">
          {state.header.logoUrl && (
            <img src={state.header.logoUrl} alt="logo" className="h-10 w-10 object-contain rounded" />
          )}
          <label className="inline-flex items-center">
            <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
            <AdminButton className="cursor-pointer">
              <ImageIcon className="h-4 w-4 mr-2" /> Upload Logo
            </AdminButton>
          </label>
        </div>

        <BackgroundControls
          value={state.header.background}
          onChange={(v) => set({ header: { ...state.header, background: v } })}
        />

        <AdminSection title="Languages" description="Manage available languages and select the default.">
          <div className="space-y-2">
            {state.header.languages?.map((l, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <AdminInput
                  value={l.code}
                  onChange={(e) => updateLang(i, { code: e.target.value })}
                  placeholder="code"
                  className="sm:w-24"
                />
                <AdminInput
                  value={l.label}
                  onChange={(e) => updateLang(i, { label: e.target.value })}
                  placeholder="label"
                />
                <div className="flex items-center gap-1">
                  <AdminButton
                    size="small"
                    variant="secondary"
                    onClick={() => set({ header: { ...state.header, selectedLang: l.code } })}
                  >
                    Set Default
                  </AdminButton>
                  <AdminIconButton variant="danger" size="small" onClick={() => removeLang(i)}>
                    <Trash2 className="h-3 w-3" />
                  </AdminIconButton>
                </div>
              </div>
            ))}
            <AdminButton size="small" onClick={addLang}>
              <Plus className="h-4 w-4 mr-2" /> Add Language
            </AdminButton>
          </div>
        </AdminSection>
      </AdminCard>
    </div>
  );
}

export function FooterAdmin() {
  const { state, set } = useSiteConfig();
  type SocialKey = "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "github";
  const updateSocial = (k: SocialKey, v: string) =>
    set({
      footer: {
        ...state.footer,
        socials: { ...(state.footer.socials || {}), [k]: v },
        text: state.footer.text,
        extraText: state.footer.extraText,
        socialOrder: state.footer.socialOrder || ["facebook", "twitter", "instagram", "linkedin"],
      },
    });
  const reorder = (k: SocialKey, dir: -1 | 1) => {
    const order = [
      ...(state.footer.socialOrder || ["facebook", "twitter", "instagram", "linkedin"]),
    ] as SocialKey[];
    const idx = order.indexOf(k);
    if (idx === -1) return;
    const ni = Math.min(order.length - 1, Math.max(0, idx + dir));
    order.splice(idx, 1);
    order.splice(ni, 0, k);
    set({ footer: { ...state.footer, socialOrder: order } });
  };
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Footer" description="Manage footer content, social links, and background." />

      <AdminCard className="space-y-6">
        <AdminFormGroup label="Copyright">
          <AdminTextarea
            value={state.footer.text}
            onChange={(e) => set({ footer: { ...state.footer, text: e.target.value } })}
          />
        </AdminFormGroup>
        <AdminFormGroup label="Extra Text">
          <AdminInput
            value={state.footer.extraText || ""}
            onChange={(e) => set({ footer: { ...state.footer, extraText: e.target.value } })}
          />
        </AdminFormGroup>
        <AdminFormGroup label="Description">
          <AdminTextarea
            value={state.footer.description || ""}
            onChange={(e) => set({ footer: { ...state.footer, description: e.target.value } })}
          />
        </AdminFormGroup>

        <AdminSection title="Quick Links" description="Manage footer links list.">
          <div className="space-y-2">
            {(state.footer.links || []).map((link, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <AdminInput
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => {
                    const links = [...(state.footer.links || [])];
                    links[i] = { ...link, label: e.target.value };
                    set({ footer: { ...state.footer, links } });
                  }}
                  className="sm:w-48"
                />
                <AdminInput
                  placeholder="https://..."
                  value={link.href}
                  onChange={(e) => {
                    const links = [...(state.footer.links || [])];
                    links[i] = { ...link, href: e.target.value };
                    set({ footer: { ...state.footer, links } });
                  }}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <AdminButton size="small" variant="secondary" onClick={() => {
                    const links = [...(state.footer.links || [])];
                    if (i === 0) return;
                    const [it] = links.splice(i, 1);
                    links.splice(i - 1, 0, it);
                    set({ footer: { ...state.footer, links } });
                  }}>↑</AdminButton>
                  <AdminButton size="small" variant="secondary" onClick={() => {
                    const links = [...(state.footer.links || [])];
                    if (i >= links.length - 1) return;
                    const [it] = links.splice(i, 1);
                    links.splice(i + 1, 0, it);
                    set({ footer: { ...state.footer, links } });
                  }}>↓</AdminButton>
                  <AdminIconButton variant="danger" size="small" onClick={() => {
                    const links = [...(state.footer.links || [])];
                    links.splice(i, 1);
                    set({ footer: { ...state.footer, links } });
                  }}>
                    <Trash2 className="h-3 w-3" />
                  </AdminIconButton>
                </div>
              </div>
            ))}
            <AdminButton size="small" onClick={() => set({ footer: { ...state.footer, links: [...(state.footer.links || []), { label: "New Link", href: "#" }] } })}>
              <Plus className="h-4 w-4 mr-2" /> Add Link
            </AdminButton>
          </div>
        </AdminSection>

        <AdminSection title="Social Links" description="Add links and control their order.">
          <div className="grid sm:grid-cols-2 gap-3">
            {(["facebook", "twitter", "instagram", "linkedin", "github", "youtube"] as const).map(
              (k) => (
                <div key={k} className="flex items-center gap-2">
                  <label className="w-24 text-sm capitalize">{k}</label>
                  <AdminInput
                    value={(state.footer.socials || {})[k] || ""}
                    onChange={(e) => updateSocial(k, e.target.value)}
                    placeholder={`https://${k}.com/...`}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <AdminButton size="small" variant="secondary" onClick={() => reorder(k, -1)}>
                      ↑
                    </AdminButton>
                    <AdminButton size="small" variant="secondary" onClick={() => reorder(k, 1)}>
                      ↓
                    </AdminButton>
                    <AdminIconButton
                      variant="danger"
                      size="small"
                      title="Clear"
                      onClick={() => updateSocial(k, "")}
                    >
                      <Trash2 className="h-3 w-3" />
                    </AdminIconButton>
                  </div>
                </div>
              ),
            )}
          </div>
        </AdminSection>

        <BackgroundControls
          value={state.footer.background}
          onChange={(v) => set({ footer: { ...state.footer, background: v } })}
        />
      </AdminCard>
    </div>
  );
}

export function ColorsAdmin() {
  const { state, set } = useSiteConfig();
  const updateTheme = (patch: any) => set({ theme: { ...state.theme, ...patch } });
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Colors & Theme" description="Edit theme brand color and section backgrounds." />
      <AdminCard className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm w-48">Brand</label>
            <input type="color" value={state.theme.brand} onChange={(e) => updateTheme({ brand: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm w-48">Global Page Background</label>
            <AdminInput
              value={state.theme.pageBg || ""}
              onChange={(e) => updateTheme({ pageBg: e.target.value })}
              placeholder="#ffffff or linear-gradient(...)"
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm w-48">Boxes Section Background</label>
            <AdminInput
              value={state.theme.boxesSectionBg || ""}
              onChange={(e) => updateTheme({ boxesSectionBg: e.target.value })}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm w-48">Logos Section Background</label>
            <AdminInput
              value={state.theme.logosSectionBg || ""}
              onChange={(e) => updateTheme({ logosSectionBg: e.target.value })}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm w-48">Contact Section Background</label>
            <AdminInput
              value={state.theme.contactSectionBg || ""}
              onChange={(e) => updateTheme({ contactSectionBg: e.target.value })}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm w-48">Default Box Background</label>
            <AdminInput
              value={state.theme.boxDefaultBg || ""}
              onChange={(e) => updateTheme({ boxDefaultBg: e.target.value })}
              className="flex-1"
            />
          </div>
          <p className="text-sm text-neutral-600">
            Supports hex colors or CSS gradients (e.g., linear-gradient(...)). All updates apply live.
          </p>
        </div>
      </AdminCard>
    </div>
  );
}

export function SettingsAdmin() {
  const { state, set } = useSiteConfig();
  const s = state.settings || {};
  const update = (patch: any) => set({ settings: { ...s, ...patch } });
  const setPad = (k: keyof NonNullable<typeof s.sectionPadding>) => (v: number) =>
    update({ sectionPadding: { ...(s.sectionPadding || {}), [k]: v } });
  const setBox = (k: keyof NonNullable<typeof s.boxHeights>) => (v: number) =>
    update({ boxHeights: { ...(s.boxHeights || { small: 200, medium: 200, large: 280 }), [k]: v } });

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Settings" description="Site paddings, default box heights and contact email." />

      <AdminCard className="space-y-6">
        <AdminSection title="Section Padding (px)" description="Fine-tune spacing for each section.">
          <div className="space-y-3">
            {(["hero", "boxes", "logos", "contact"] as const).map((k) => (
              <div key={k} className="flex items-center gap-3">
                <label className="w-24 text-sm capitalize">{k}</label>
                <input
                  type="range"
                  min={0}
                  max={96}
                  value={(s.sectionPadding || {})[k] || 24}
                  onChange={(e) => setPad(k)(Number(e.target.value))}
                />
                <AdminInput
                  type="number"
                  className="w-24"
                  value={(s.sectionPadding || {})[k] || 24}
                  onChange={(e) => setPad(k)(Number(e.target.value))}
                />
              </div>
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Default Box Heights (px)">
          <div className="space-y-3">
            {(["small", "medium", "large"] as const).map((k) => (
              <div key={k} className="flex items-center gap-3">
                <label className="w-24 text-sm capitalize">{k}</label>
                <input
                  type="range"
                  min={120}
                  max={600}
                  value={(s.boxHeights || { small: 200, medium: 200, large: 280 })[k]}
                  onChange={(e) => setBox(k)(Number(e.target.value))}
                />
                <AdminInput
                  type="number"
                  className="w-24"
                  value={(s.boxHeights || { small: 200, medium: 200, large: 280 })[k]}
                  onChange={(e) => setBox(k)(Number(e.target.value))}
                />
              </div>
            ))}
          </div>
        </AdminSection>

        <AdminFormGroup label="Contact recipient email">
          <AdminInput
            value={s.contactEmail || ""}
            onChange={(e) => update({ contactEmail: e.target.value })}
            placeholder="you@company.com"
          />
        </AdminFormGroup>
        <div className="text-sm text-neutral-600">
          Local Storage is used in this demo. Connect a database later for persistence.
        </div>
      </AdminCard>
    </div>
  );
}
