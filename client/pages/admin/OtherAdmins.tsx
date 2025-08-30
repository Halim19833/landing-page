import { useSiteConfig } from "@/state/site-config";

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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Header</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          value={state.header.logoText}
          onChange={(e) =>
            set({ header: { ...state.header, logoText: e.target.value } })
          }
          className="border rounded px-2 py-1"
          placeholder="Logo text"
        />
        <input
          value={state.header.languageText}
          onChange={(e) =>
            set({ header: { ...state.header, languageText: e.target.value } })
          }
          className="border rounded px-2 py-1"
          placeholder="Language label"
        />
        <input
          value={state.header.contactText}
          onChange={(e) =>
            set({ header: { ...state.header, contactText: e.target.value } })
          }
          className="border rounded px-2 py-1"
          placeholder="Contact text"
        />
      </div>
      <div className="flex items-center gap-3">
        {state.header.logoUrl && (
          <img
            src={state.header.logoUrl}
            alt="logo"
            className="h-10 w-10 object-contain"
          />
        )}
        <label className="text-sm px-3 py-2 rounded-md bg-neutral-800 text-white cursor-pointer">
          Upload Logo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={uploadLogo}
          />
        </label>
      </div>
      <BackgroundControls
        value={state.header.background}
        onChange={(v) => set({ header: { ...state.header, background: v } })}
      />
      <div>
        <div className="mb-2 font-medium">Languages</div>
        <div className="space-y-2">
          {state.header.languages?.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={l.code}
                onChange={(e) => updateLang(i, { code: e.target.value })}
                className="border rounded px-2 py-1 text-sm w-24"
                placeholder="code"
              />
              <input
                value={l.label}
                onChange={(e) => updateLang(i, { label: e.target.value })}
                className="border rounded px-2 py-1 text-sm"
                placeholder="label"
              />
              <button
                onClick={() =>
                  set({ header: { ...state.header, selectedLang: l.code } })
                }
                className="text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
              >
                Set Default
              </button>
              <button
                onClick={() => removeLang(i)}
                className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addLang}
          className="mt-2 text-sm px-3 py-2 rounded-md bg-neutral-800 text-white"
        >
          Add Language
        </button>
      </div>
    </div>
  );
}

export function FooterAdmin() {
  const { state, set } = useSiteConfig();
  const updateSocial = (k: string, v: string) =>
    set({
      footer: {
        ...state.footer,
        socials: { ...(state.footer.socials || {}), [k]: v },
        text: state.footer.text,
        extraText: state.footer.extraText,
        socialOrder: state.footer.socialOrder || [
          "facebook",
          "twitter",
          "instagram",
          "linkedin",
        ],
      },
    });
  const reorder = (k: string, dir: -1 | 1) => {
    const order = [
      ...(state.footer.socialOrder || [
        "facebook",
        "twitter",
        "instagram",
        "linkedin",
      ]),
    ];
    const idx = order.indexOf(k);
    if (idx === -1) return;
    const ni = Math.min(order.length - 1, Math.max(0, idx + dir));
    order.splice(idx, 1);
    order.splice(ni, 0, k);
    set({ footer: { ...state.footer, socialOrder: order } });
  };
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Footer</h2>
      <label className="block text-sm">Copyright</label>
      <textarea
        value={state.footer.text}
        onChange={(e) =>
          set({ footer: { ...state.footer, text: e.target.value } })
        }
        className="w-full border rounded px-2 py-2"
      />
      <label className="block text-sm">Extra Text</label>
      <input
        value={state.footer.extraText || ""}
        onChange={(e) =>
          set({ footer: { ...state.footer, extraText: e.target.value } })
        }
        className="w-full border rounded px-2 py-1"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {(
          [
            "facebook",
            "twitter",
            "instagram",
            "linkedin",
            "github",
            "youtube",
          ] as const
        ).map((k) => (
          <div key={k} className="flex items-center gap-2">
            <label className="w-24 text-sm capitalize">{k}</label>
            <input
              value={(state.footer.socials || {})[k] || ""}
              onChange={(e) => updateSocial(k, e.target.value)}
              placeholder={`https://${k}.com/...`}
              className="flex-1 border rounded px-2 py-1"
            />
            <div className="flex items-center gap-1">
              <button
                className="text-xs px-2 py-1 rounded bg-neutral-100"
                onClick={() => reorder(k, -1)}
              >
                ↑
              </button>
              <button
                className="text-xs px-2 py-1 rounded bg-neutral-100"
                onClick={() => reorder(k, 1)}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      <BackgroundControls
        value={state.footer.background}
        onChange={(v) => set({ footer: { ...state.footer, background: v } })}
      />
    </div>
  );
}

export function ColorsAdmin() {
  const { state, set } = useSiteConfig();
  const updateTheme = (patch: any) =>
    set({ theme: { ...state.theme, ...patch } });
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Colors</h2>
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
        <input
          type="text"
          value={state.theme.pageBg || ""}
          onChange={(e) => updateTheme({ pageBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
          placeholder="#ffffff or linear-gradient(...)"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Boxes Section Background</label>
        <input
          type="text"
          value={state.theme.boxesSectionBg || ""}
          onChange={(e) => updateTheme({ boxesSectionBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
          placeholder="color or gradient"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Logos Section Background</label>
        <input
          type="text"
          value={state.theme.logosSectionBg || ""}
          onChange={(e) => updateTheme({ logosSectionBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Contact Section Background</label>
        <input
          type="text"
          value={state.theme.contactSectionBg || ""}
          onChange={(e) => updateTheme({ contactSectionBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm w-48">Default Box Background</label>
        <input
          type="text"
          value={state.theme.boxDefaultBg || ""}
          onChange={(e) => updateTheme({ boxDefaultBg: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
        />
      </div>
      <p className="text-sm text-neutral-600">
        Supports hex colors or CSS gradients (e.g., linear-gradient(...)). All
        updates apply live.
      </p>
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="space-y-2">
        <div className="font-medium">Section Padding (px)</div>
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
            <input
              type="number"
              className="w-20 border rounded px-2 py-1 text-sm"
              value={(s.sectionPadding || {})[k] || 24}
              onChange={(e) => setPad(k)(Number(e.target.value))}
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="font-medium">Default Box Heights (px)</div>
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
            <input
              type="number"
              className="w-20 border rounded px-2 py-1 text-sm"
              value={
                (s.boxHeights || { small: 200, medium: 200, large: 280 })[k]
              }
              onChange={(e) => setBox(k)(Number(e.target.value))}
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm">Contact recipient email</label>
        <input
          value={s.contactEmail || ""}
          onChange={(e) => update({ contactEmail: e.target.value })}
          className="border rounded px-2 py-1"
          placeholder="you@company.com"
        />
      </div>
      <p className="text-sm text-neutral-600">
        Local Storage is used in this demo. Connect a database later for
        persistence.
      </p>
    </div>
  );
}
