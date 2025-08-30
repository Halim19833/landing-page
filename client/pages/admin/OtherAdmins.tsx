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
              onChange={(e) =>
                onChange({ ...value, direction: e.target.value })
              }
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
              <img
                src={value.url}
                alt="bg"
                className="h-14 w-24 object-cover rounded"
              />
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
                onChange={(e) =>
                  onChange({ ...value, scale: Number(e.target.value) })
                }
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
                onChange={(e) =>
                  onChange({ ...value, opacity: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16">Adjust</span>
              <select
                value={value.overlay || "none"}
                onChange={(e) =>
                  onChange({ ...value, overlay: e.target.value })
                }
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
                  onChange({
                    ...value,
                    overlayStrength: Number(e.target.value),
                  })
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
  const updateLang = (
    i: number,
    patch: Partial<{ code: string; label: string }>,
  ) =>
    set({
      header: {
        ...state.header,
        languages: state.header.languages.map((l, idx) =>
          idx === i ? { ...l, ...patch } : l,
        ),
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
      <AdminPageHeader
        title="Header"
        description="Manage site logo, labels, languages, and header background."
      />

      <AdminCard className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <AdminFormGroup label="Logo Text">
            <AdminInput
              value={state.header.logoText}
              onChange={(e) =>
                set({ header: { ...state.header, logoText: e.target.value } })
              }
              placeholder="Logo text"
            />
          </AdminFormGroup>
          <AdminFormGroup label="Language Label">
            <AdminInput
              value={state.header.languageText}
              onChange={(e) =>
                set({
                  header: { ...state.header, languageText: e.target.value },
                })
              }
              placeholder="Language label"
            />
          </AdminFormGroup>
          <AdminFormGroup label="Contact Text">
            <AdminInput
              value={state.header.contactText}
              onChange={(e) =>
                set({
                  header: { ...state.header, contactText: e.target.value },
                })
              }
              placeholder="Contact text"
            />
          </AdminFormGroup>
        </div>

        <div className="flex items-center gap-3">
          {state.header.logoUrl && (
            <img
              src={state.header.logoUrl}
              alt="logo"
              className="h-10 w-10 object-contain rounded"
            />
          )}
          <label className="inline-flex items-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadLogo}
            />
            <AdminButton className="cursor-pointer">
              <ImageIcon className="h-4 w-4 mr-2" /> Upload Logo
            </AdminButton>
          </label>
        </div>

        <BackgroundControls
          value={state.header.background}
          onChange={(v) => set({ header: { ...state.header, background: v } })}
        />

        <AdminSection
          title="Languages"
          description="Manage available languages and select the default."
        >
          <div className="space-y-2">
            {state.header.languages?.map((l, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center gap-2"
              >
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
                    onClick={() =>
                      set({ header: { ...state.header, selectedLang: l.code } })
                    }
                  >
                    Set Default
                  </AdminButton>
                  <AdminIconButton
                    variant="danger"
                    size="small"
                    onClick={() => removeLang(i)}
                  >
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
  const footer = state.footer;
  const headings = footer.headings!;
  const linksBy = footer.linksByColumn!;
  const socialIcons = (footer.socialIcons || []).slice().sort((a, b) => a.order - b.order);

  const updateFooter = (patch: Partial<typeof footer>) => set({ footer: { ...footer, ...patch } });

  const updateHead = (key: keyof NonNullable<typeof headings>, patch: Partial<(typeof headings)[typeof key]>) => {
    updateFooter({ headings: { ...headings, [key]: { ...headings[key], ...patch } } });
  };

  const updateLink = (
    column: keyof NonNullable<typeof linksBy>,
    idx: number,
    patch: Partial<NonNullable<typeof linksBy>[typeof column][number]>,
  ) => {
    const arr = [...linksBy[column]];
    arr[idx] = { ...arr[idx], ...patch };
    updateFooter({ linksByColumn: { ...linksBy, [column]: arr } });
  };
  const addLink = (column: keyof NonNullable<typeof linksBy>) => {
    const arr = [...linksBy[column], { text: "New", url: "#", enabled: true }];
    updateFooter({ linksByColumn: { ...linksBy, [column]: arr } });
  };
  const removeLink = (column: keyof NonNullable<typeof linksBy>, idx: number) => {
    const arr = [...linksBy[column]];
    arr.splice(idx, 1);
    updateFooter({ linksByColumn: { ...linksBy, [column]: arr } });
  };
  const moveLink = (column: keyof NonNullable<typeof linksBy>, idx: number, dir: -1 | 1) => {
    const arr = [...linksBy[column]];
    const ni = Math.min(arr.length - 1, Math.max(0, idx + dir));
    if (ni === idx) return;
    const [it] = arr.splice(idx, 1);
    arr.splice(ni, 0, it);
    updateFooter({ linksByColumn: { ...linksBy, [column]: arr } });
  };

  const updateSocial = (idx: number, patch: Partial<NonNullable<typeof socialIcons>[number]>) => {
    const arr = [...socialIcons];
    arr[idx] = { ...arr[idx], ...patch };
    updateFooter({ socialIcons: arr });
  };
  const addSocial = () => {
    const arr = [...socialIcons, { platform: "facebook", url: "", icon: "facebook", order: socialIcons.length, enabled: true }];
    updateFooter({ socialIcons: arr });
  };
  const removeSocial = (idx: number) => {
    const arr = [...socialIcons];
    arr.splice(idx, 1);
    arr.forEach((s, i) => (s.order = i));
    updateFooter({ socialIcons: arr });
  };
  const moveSocial = (idx: number, dir: -1 | 1) => {
    const arr = [...socialIcons];
    const ni = Math.min(arr.length - 1, Math.max(0, idx + dir));
    if (ni === idx) return;
    const [it] = arr.splice(idx, 1);
    arr.splice(ni, 0, it);
    arr.forEach((s, i) => (s.order = i));
    updateFooter({ socialIcons: arr });
  };

  const colors = footer.colors || { textColor: "#ffffff", linkColor: "#ffffff", iconColor: "#ffffff" };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Footer"
        description="Manage footer content, headings, links, social icons, colors and background."
      />

      <AdminCard className="space-y-6">
        <AdminFormGroup label="Copyright">
          <AdminTextarea
            value={footer.text}
            onChange={(e) => updateFooter({ text: e.target.value })}
          />
        </AdminFormGroup>
        <AdminFormGroup label="Extra Text">
          <AdminInput
            value={footer.extraText || ""}
            onChange={(e) => updateFooter({ extraText: e.target.value })}
          />
        </AdminFormGroup>
        <AdminFormGroup label="About Description">
          <AdminTextarea
            value={footer.description || ""}
            onChange={(e) => updateFooter({ description: e.target.value })}
          />
        </AdminFormGroup>

        <AdminSection title="Headings & Visibility" description="Control column headings and enable/disable sections.">
          <div className="grid sm:grid-cols-3 gap-4">
            {(["about", "quick", "contact"] as const).map((k) => (
              <div key={k} className="space-y-2">
                <label className="text-sm capitalize">{k}</label>
                <AdminInput
                  value={headings[k].title}
                  onChange={(e) => updateHead(k, { title: e.target.value })}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={headings[k].enabled}
                    onChange={(e) => updateHead(k, { enabled: e.target.checked })}
                  />
                  <span>Enabled</span>
                </label>
              </div>
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Links by Column" description="Manage links for About, Quick Links, and Contact.">
          <div className="space-y-6">
            {(["about", "quick", "contact"] as const).map((col) => (
              <div key={col} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">{col}</h4>
                  <AdminButton size="small" onClick={() => addLink(col)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Link
                  </AdminButton>
                </div>
                <div className="space-y-2">
                  {linksBy[col].map((link, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <AdminInput
                        placeholder="Text"
                        value={link.text}
                        onChange={(e) => updateLink(col, i, { text: e.target.value })}
                        className="sm:w-48"
                      />
                      <AdminInput
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateLink(col, i, { url: e.target.value })}
                        className="flex-1"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={link.enabled}
                          onChange={(e) => updateLink(col, i, { enabled: e.target.checked })}
                        />
                        <span>Enabled</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <AdminButton size="small" variant="secondary" onClick={() => moveLink(col, i, -1)}>
                          ↑
                        </AdminButton>
                        <AdminButton size="small" variant="secondary" onClick={() => moveLink(col, i, 1)}>
                          ↓
                        </AdminButton>
                        <AdminIconButton variant="danger" size="small" onClick={() => removeLink(col, i)}>
                          <Trash2 className="h-3 w-3" />
                        </AdminIconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Social Media Icons" description="Add, enable, and reorder social icons.">
          <div className="space-y-2">
            {socialIcons.map((s, i) => (
              <div key={`${s.platform}-${i}`} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <AdminInput
                  value={s.platform}
                  onChange={(e) => updateSocial(i, { platform: e.target.value })}
                  className="sm:w-40"
                  placeholder="platform"
                />
                <AdminInput
                  value={s.icon}
                  onChange={(e) => updateSocial(i, { icon: e.target.value })}
                  className="sm:w-40"
                  placeholder="icon name"
                />
                <AdminInput
                  value={s.url}
                  onChange={(e) => updateSocial(i, { url: e.target.value })}
                  className="flex-1"
                  placeholder="https://..."
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={(e) => updateSocial(i, { enabled: e.target.checked })}
                  />
                  <span>Enabled</span>
                </label>
                <div className="flex items-center gap-1">
                  <AdminButton size="small" variant="secondary" onClick={() => moveSocial(i, -1)}>
                    ↑
                  </AdminButton>
                  <AdminButton size="small" variant="secondary" onClick={() => moveSocial(i, 1)}>
                    ↓
                  </AdminButton>
                  <AdminIconButton variant="danger" size="small" onClick={() => removeSocial(i)}>
                    <Trash2 className="h-3 w-3" />
                  </AdminIconButton>
                </div>
              </div>
            ))}
            <AdminButton size="small" onClick={addSocial}>
              <Plus className="h-4 w-4 mr-2" /> Add Social
            </AdminButton>
          </div>
        </AdminSection>

        <AdminSection title="Colors" description="Customize text, link, and icon colors.">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm w-28">Text</label>
              <input
                type="color"
                value={colors.textColor || "#ffffff"}
                onChange={(e) => updateFooter({ colors: { ...colors, textColor: e.target.value } })}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm w-28">Links</label>
              <input
                type="color"
                value={colors.linkColor || colors.textColor || "#ffffff"}
                onChange={(e) => updateFooter({ colors: { ...colors, linkColor: e.target.value } })}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm w-28">Icons</label>
              <input
                type="color"
                value={colors.iconColor || colors.textColor || "#ffffff"}
                onChange={(e) => updateFooter({ colors: { ...colors, iconColor: e.target.value } })}
              />
            </div>
          </div>
        </AdminSection>

        <BackgroundControls
          value={footer.background}
          onChange={(v) => updateFooter({ background: v })}
        />

        <div className="flex justify-end">
          <AdminButton onClick={() => updateFooter({})}>Apply</AdminButton>
        </div>
      </AdminCard>
    </div>
  );
}

export function ColorsAdmin() {
  const { state, set } = useSiteConfig();
  const updateTheme = (patch: any) =>
    set({ theme: { ...state.theme, ...patch } });
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Colors & Theme"
        description="Edit theme brand color and section backgrounds."
      />
      <AdminCard className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm w-48">Brand</label>
            <input
              type="color"
              value={state.theme.brand}
              onChange={(e) => updateTheme({ brand: e.target.value })}
            />
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
              onChange={(e) =>
                updateTheme({ contactSectionBg: e.target.value })
              }
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
            Supports hex colors or CSS gradients (e.g., linear-gradient(...)).
            All updates apply live.
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
  const setPad =
    (k: keyof NonNullable<typeof s.sectionPadding>) => (v: number) =>
      update({ sectionPadding: { ...(s.sectionPadding || {}), [k]: v } });
  const setBox = (k: keyof NonNullable<typeof s.boxHeights>) => (v: number) =>
    update({
      boxHeights: {
        ...(s.boxHeights || { small: 200, medium: 200, large: 280 }),
        [k]: v,
      },
    });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description="Site paddings, default box heights and contact email."
      />

      <AdminCard className="space-y-6">
        <AdminSection
          title="Section Padding (px)"
          description="Fine-tune spacing for each section."
        >
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
                  value={
                    (s.boxHeights || { small: 200, medium: 200, large: 280 })[k]
                  }
                  onChange={(e) => setBox(k)(Number(e.target.value))}
                />
                <AdminInput
                  type="number"
                  className="w-24"
                  value={
                    (s.boxHeights || { small: 200, medium: 200, large: 280 })[k]
                  }
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
          Local Storage is used in this demo. Connect a database later for
          persistence.
        </div>
      </AdminCard>
    </div>
  );
}
