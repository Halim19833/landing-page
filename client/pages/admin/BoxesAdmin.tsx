import { useSiteConfig } from "@/state/site-config";
import { useEffect, useMemo, useState } from "react";
import {
  GripVertical,
  Plus,
  Eye,
  EyeOff,
  Settings,
  Trash2,
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AdminPageHeader,
  AdminCard,
  AdminSection,
  AdminButton,
  AdminIconButton,
  AdminInput,
  AdminSelect,
  AdminBadge,
  AdminEmptyState,
  AdminFormGroup,
} from "@/components/admin/AdminUI";

function expandShortHex(hex?: string): string | undefined {
  if (!hex) return hex;
  const m = hex.trim().match(/^#([0-9a-fA-F]{3})$/);
  if (m) {
    const [r, g, b] = m[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
}

import { WidthProvider, Responsive, type Layout, type Layouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
const ResponsiveGridLayout = WidthProvider(Responsive as any);

function ExportImportControls() {
  const { state, set } = useSiteConfig();
  const onExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    try {
      const json = JSON.parse(text);
      set(json);
    } catch {}
  };
  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex items-center">
        <input type="file" accept="application/json" className="hidden" onChange={onImport} />
        <button className="px-3 py-1.5 text-sm rounded border">Import JSON</button>
      </label>
      <button className="px-3 py-1.5 text-sm rounded border" onClick={onExport}>Export JSON</button>
    </div>
  );
}

function GridEditor() {
  const { state, set } = useSiteConfig();
  const cols = state.boxesGrid?.columns || { mobile: 1, tablet: 2, desktop: 4 };
  const gap = state.boxesGrid?.gap || { mobile: 16, tablet: 20, desktop: 24 };

  const breakpoints = { lg: 1024, md: 640, sm: 0 };
  const colsMap = { lg: cols.desktop, md: cols.tablet, sm: cols.mobile } as any;
  const rowHeight = 20;

  const makeLayouts = (): Layouts => {
    const items = state.boxes;
    const toL = (bp: "mobile" | "tablet" | "desktop"): Layout[] =>
      items.map((b, i) => {
        const l = (b.layout as any)?.[bp] || { x: 0, y: i, w: (b.gridSpan as any)?.[bp] || 1, h: 1 };
        return { i: b.id, x: l.x, y: l.y, w: l.w, h: l.h, minW: 1, minH: 1 } as Layout;
      });
    return { lg: toL("desktop"), md: toL("tablet"), sm: toL("mobile") } as Layouts;
  };

  const [layouts, setLayouts] = useState<Layouts>(() => makeLayouts());

  useEffect(() => setLayouts(makeLayouts()), [state.boxes.length]);

  const onLayoutsChange = (current: Layout[], all: Layouts) => {
    setLayouts(all);
    const mapById = (list: Layout[]) => Object.fromEntries(list.map((l) => [l.i, l]));
    const lg = mapById(all.lg || []);
    const md = mapById(all.md || []);
    const sm = mapById(all.sm || []);

    const nextBoxes = state.boxes.map((b, idx) => {
      const Lg = lg[b.id] || { x: 0, y: idx, w: (b.gridSpan as any)?.desktop || 1, h: 1 };
      const Md = md[b.id] || { x: 0, y: idx, w: (b.gridSpan as any)?.tablet || 1, h: 1 };
      const Sm = sm[b.id] || { x: 0, y: idx, w: (b.gridSpan as any)?.mobile || 1, h: 1 };
      return {
        ...b,
        layout: {
          desktop: { x: Lg.x, y: Lg.y, w: Lg.w, h: Lg.h },
          tablet: { x: Md.x, y: Md.y, w: Md.w, h: Md.h },
          mobile: { x: Sm.x, y: Sm.y, w: Sm.w, h: Sm.h },
        },
        gridSpan: {
          desktop: Lg.w,
          tablet: Md.w,
          mobile: Sm.w,
        } as any,
      };
    });
    set({ boxes: nextBoxes });
  };

  return (
    <div>
      <ResponsiveGridLayout
        className="layout"
        breakpoints={breakpoints}
        cols={colsMap}
        rowHeight={rowHeight}
        margin={[gap.mobile, gap.mobile] as any}
        layouts={layouts}
        onLayoutChange={onLayoutsChange}
        onLayoutsChange={onLayoutsChange}
        isDraggable
        isResizable
        compactType="vertical"
      >
        {state.boxes.map((b) => (
          <div key={b.id} className="rounded border bg-white overflow-hidden">
            <div className="p-2 text-sm font-medium border-b bg-gray-50 flex items-center justify-between">
              <span className="truncate">{b.title}</span>
              <span className="text-xs text-gray-500">{b.size}</span>
            </div>
            <div className="p-3">
              {b.imageUrl ? (
                <img src={b.imageUrl} className="w-full h-24 object-cover rounded" alt="preview" />
              ) : (
                <div className="h-24 flex items-center justify-center text-xs text-gray-500">No image</div>
              )}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

export default function BoxesAdmin() {
  const { state, set } = useSiteConfig();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [drafts, setDrafts] = useState(() =>
    state.boxes.map((b) => ({ ...b })),
  );

  useEffect(() => {
    setDrafts(state.boxes.map((b) => ({ ...b })));
  }, [state.boxes.length]);

  const setDraft = (id: string, patch: any) =>
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const add = () => {
    const nb = {
      id: crypto.randomUUID(),
      title: "New Box",
      type: "image" as const,
      size: "small" as const,
      height: 200,
      background: { kind: "color", color: "#f3f4f6" } as any,
      buttonLabel: "Read More",
      ctaMode: "button" as const,
      modalEnabled: true,
      borderRadius: 12,
      shadow: { intensity: 12, direction: "bottom-right" as const },
      modalStyle: {
        bg: "#111111",
        text: "#ffffff",
        shadow: "0 10px 30px rgba(0,0,0,0.3)",
        radius: 16,
      },
    };
    set({ boxes: [...state.boxes, nb] });
  };

  const remove = (id: string) =>
    set({ boxes: state.boxes.filter((b) => b.id !== id) });
  const toggle = (id: string) =>
    set({
      boxes: state.boxes.map((b) =>
        b.id === id ? { ...b, hidden: !b.hidden } : b,
      ),
    });

  const apply = (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;
    set({ boxes: state.boxes.map((b) => (b.id === id ? draft : b)) });
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDrop = (i: number) => {
    if (dragIdx === null) return;
    const arr = [...state.boxes];
    const [it] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, it);
    set({ boxes: arr });
    setDragIdx(null);
  };

  const items = useMemo(
    () =>
      state.boxes.map((b) => ({
        live: b,
        draft: drafts.find((d) => d.id === b.id) || b,
      })),
    [state.boxes, drafts],
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Content Boxes"
        description="Create and manage feature boxes, cards, and content sections for your website."
        action={
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {state.boxes.filter((b) => !b.hidden).length} visible /{" "}
              {state.boxes.length} total
            </div>
            <AdminButton onClick={add}>
              <Plus className="h-4 w-4 mr-2" />
              Add Box
            </AdminButton>
          </div>
        }
      />

      {/* Grid Settings */}
      <AdminSection title="Grid Settings" description="Control columns, gaps, column widths and background stripes.">
        <div className="grid sm:grid-cols-3 gap-4">
          {(["mobile","tablet","desktop"] as const).map((bp) => (
            <div key={bp} className="space-y-2">
              <label className="text-sm capitalize">{bp} Columns</label>
              <input
                type="number"
                min={1}
                max={12}
                value={(state.boxesGrid?.columns as any)?.[bp] ?? (bp === 'desktop' ? 4 : bp === 'tablet' ? 2 : 1)}
                onChange={(e) =>
                  set({ boxesGrid: { ...(state.boxesGrid || {}), columns: { ...(state.boxesGrid?.columns || { mobile:1, tablet:2, desktop:4 }), [bp]: Number(e.target.value) } } })
                }
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {(["mobile","tablet","desktop"] as const).map((bp) => (
            <div key={bp} className="space-y-2">
              <label className="text-sm capitalize">{bp} Column Width (px)</label>
              <input
                type="number"
                min={0}
                value={(state.boxesGrid?.columnWidth as any)?.[bp] ?? 0}
                onChange={(e) =>
                  set({ boxesGrid: { ...(state.boxesGrid || {}), columnWidth: { ...(state.boxesGrid?.columnWidth || { mobile:0, tablet:0, desktop:0 }), [bp]: Number(e.target.value) } } })
                }
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {(["mobile","tablet","desktop"] as const).map((bp) => (
            <div key={bp} className="space-y-2">
              <label className="text-sm capitalize">{bp} Gap (px)</label>
              <input
                type="number"
                min={0}
                value={(state.boxesGrid?.gap as any)?.[bp] ?? (bp === 'desktop' ? 24 : bp === 'tablet' ? 20 : 16)}
                onChange={(e) =>
                  set({ boxesGrid: { ...(state.boxesGrid || {}), gap: { ...(state.boxesGrid?.gap || { mobile:16, tablet:20, desktop:24 }), [bp]: Number(e.target.value) } } })
                }
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-3">
            <label className="text-sm w-40">Column Stripe Color</label>
            <input
              type="color"
              value={state.boxesGrid?.columnColor || "#e0f2fe"}
              onChange={(e) => set({ boxesGrid: { ...(state.boxesGrid || {}), columnColor: e.target.value } })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!state.boxesGrid?.showColumnColor}
              onChange={(e) => set({ boxesGrid: { ...(state.boxesGrid || {}), showColumnColor: e.target.checked } })}
            />
            Show Column Background
          </label>
        </div>
      </AdminSection>

      {/* Live Grid Editor */}
      <AdminSection title="Grid Editor" description="Drag, drop, and resize boxes. Changes save instantly.">
        <GridEditor />
        <div className="flex items-center justify-end gap-2 mt-4">
          <ExportImportControls />
        </div>
      </AdminSection>

      <div className="space-y-6">
        {items.map(({ live, draft }, i) => (
          <AdminCard
            key={live.id}
            className="relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
          >
            <div className="flex items-center gap-3">
              <span
                title="Drag to reorder"
                className="cursor-grab inline-flex items-center justify-center h-8 w-8 rounded bg-neutral-100"
                draggable
                onDragStart={() => onDragStart(i)}
              >
                <GripVertical className="h-4 w-4 text-neutral-600" />
              </span>
              <input
                value={draft.title}
                onChange={(e) => setDraft(live.id, { title: e.target.value })}
                className="border rounded px-2 py-1 text-sm flex-1"
              />
              <select
                value={draft.size as any}
                onChange={(e) =>
                  setDraft(live.id, { size: e.target.value as any })
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              <input
                type="number"
                min={120}
                max={600}
                value={draft.height || 200}
                onChange={(e) =>
                  setDraft(live.id, { height: Number(e.target.value) })
                }
                className="w-24 border rounded px-2 py-1 text-sm"
              />
              <AdminIconButton
                variant="secondary"
                size="small"
                onClick={() => toggle(live.id)}
                title={live.hidden ? "Show box" : "Hide box"}
              >
                {live.hidden ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </AdminIconButton>
              <AdminIconButton
                variant="danger"
                size="small"
                onClick={() => remove(live.id)}
                title="Delete box"
              >
                <Trash2 className="h-3 w-3" />
              </AdminIconButton>
            </div>

            <div className="mt-3 grid lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {draft.imageUrl && (
                    <img
                      src={draft.imageUrl}
                      alt="preview"
                      className="h-14 w-24 object-cover rounded"
                    />
                  )}
                  <label className="text-xs px-2 py-1 rounded bg-neutral-800 text-white cursor-pointer">
                    Upload Image
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
                        setDraft(live.id, { imageUrl: url, type: "image" });
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">CTA Mode</label>
                  <select
                    value={draft.ctaMode || "button"}
                    onChange={(e) =>
                      setDraft(live.id, { ctaMode: e.target.value as any })
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="button">Button only</option>
                    <option value="icon">Icon only</option>
                    <option value="both">Button + Icon</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Button Label</label>
                  <input
                    value={draft.buttonLabel || "Read More"}
                    onChange={(e) =>
                      setDraft(live.id, { buttonLabel: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <label className="text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draft.modalEnabled !== false}
                      onChange={(e) =>
                        setDraft(live.id, { modalEnabled: e.target.checked })
                      }
                    />{" "}
                    Enable Modal
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Border Radius</label>
                  <input
                    type="range"
                    min={0}
                    max={28}
                    value={draft.borderRadius ?? 12}
                    onChange={(e) =>
                      setDraft(live.id, {
                        borderRadius: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Shadow</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={draft.shadow?.direction || "bottom-right"}
                      onChange={(e) =>
                        setDraft(live.id, {
                          shadow: {
                            ...(draft.shadow || { intensity: 12 }),
                            direction: e.target.value as any,
                          },
                        })
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={draft.shadow?.intensity ?? 12}
                      onChange={(e) =>
                        setDraft(live.id, {
                          shadow: {
                            ...(draft.shadow || { direction: "bottom-right" }),
                            intensity: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Background</label>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={draft.background?.kind || "color"}
                      onChange={(e) =>
                        setDraft(live.id, {
                          background:
                            e.target.value === "color"
                              ? { kind: "color", color: "#f3f4f6" }
                              : e.target.value === "gradient"
                                ? {
                                    kind: "gradient",
                                    from: "#ffffff",
                                    to: "#f3f4f6",
                                    direction: "to bottom",
                                  }
                                : ({
                                    kind: "image",
                                    url:
                                      (draft.background &&
                                        (draft.background as any).url) ||
                                      "",
                                    scale: 100,
                                    opacity: 1,
                                    overlay: "none",
                                    overlayStrength: 0.4,
                                  } as any),
                        })
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="color">Color</option>
                      <option value="gradient">Gradient</option>
                      <option value="image">Image</option>
                    </select>
                    {draft.background?.kind === "color" && (
                      <input
                        type="color"
                        value={(draft.background as any).color || "#f3f4f6"}
                        onChange={(e) =>
                          setDraft(live.id, {
                            background: {
                              kind: "color",
                              color:
                                expandShortHex(e.target.value) ||
                                e.target.value,
                            } as any,
                          })
                        }
                      />
                    )}
                    {draft.background?.kind === "gradient" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(draft.background as any).from || "#ffffff"}
                          onChange={(e) =>
                            setDraft(live.id, {
                              background: {
                                ...(draft.background as any),
                                from:
                                  expandShortHex(e.target.value) ||
                                  e.target.value,
                              } as any,
                            })
                          }
                        />
                        <input
                          type="color"
                          value={(draft.background as any).to || "#f3f4f6"}
                          onChange={(e) =>
                            setDraft(live.id, {
                              background: {
                                ...(draft.background as any),
                                to:
                                  expandShortHex(e.target.value) ||
                                  e.target.value,
                              } as any,
                            })
                          }
                        />
                        <select
                          value={
                            (draft.background as any).direction || "to bottom"
                          }
                          onChange={(e) =>
                            setDraft(live.id, {
                              background: {
                                ...(draft.background as any),
                                direction: e.target.value,
                              } as any,
                            })
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="to top">to top</option>
                          <option value="to bottom">to bottom</option>
                          <option value="to left">to left</option>
                          <option value="to right">to right</option>
                          <option value="to top right">to top right</option>
                          <option value="to top left">to top left</option>
                          <option value="to bottom right">
                            to bottom right
                          </option>
                          <option value="to bottom left">to bottom left</option>
                        </select>
                      </div>
                    )}
                    {draft.background?.kind === "image" && (
                      <div className="space-y-2 w-full">
                        {(draft.background as any).url && (
                          <img
                            src={(draft.background as any).url}
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
                              const url = await new Promise<string>(
                                (res, rej) => {
                                  const r = new FileReader();
                                  r.onload = () => res(r.result as string);
                                  r.onerror = rej;
                                  r.readAsDataURL(f);
                                },
                              );
                              const bg = draft.background as any;
                              setDraft(live.id, {
                                background: {
                                  kind: "image",
                                  url,
                                  scale: bg?.scale || 100,
                                  opacity: bg?.opacity ?? 1,
                                  overlay: bg?.overlay || "none",
                                  overlayStrength: bg?.overlayStrength ?? 0.4,
                                } as any,
                              });
                            }}
                          />
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">Scale</span>
                          <input
                            type="range"
                            min={50}
                            max={200}
                            value={(draft.background as any).scale || 100}
                            onChange={(e) =>
                              setDraft(live.id, {
                                background: {
                                  ...(draft.background as any),
                                  scale: Number(e.target.value),
                                } as any,
                              })
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
                            value={(draft.background as any).opacity ?? 1}
                            onChange={(e) =>
                              setDraft(live.id, {
                                background: {
                                  ...(draft.background as any),
                                  opacity: Number(e.target.value),
                                } as any,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">Adjust</span>
                          <select
                            value={(draft.background as any).overlay || "none"}
                            onChange={(e) =>
                              setDraft(live.id, {
                                background: {
                                  ...(draft.background as any),
                                  overlay: e.target.value as any,
                                } as any,
                              })
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
                            value={
                              (draft.background as any).overlayStrength ?? 0.4
                            }
                            onChange={(e) =>
                              setDraft(live.id, {
                                background: {
                                  ...(draft.background as any),
                                  overlayStrength: Number(e.target.value),
                                } as any,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm">Grid Span</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["mobile","tablet","desktop"] as const).map((bp) => (
                      <div key={bp} className="flex items-center gap-2">
                        <span className="text-xs capitalize w-14">{bp}</span>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={(draft.gridSpan as any)?.[bp] ?? 1}
                          onChange={(e) => setDraft(live.id, { gridSpan: { ...(draft.gridSpan || { mobile:1, tablet:1, desktop:1 }), [bp]: Number(e.target.value) } })}
                          className="w-20 border rounded px-2 py-1 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Alignment</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12">Horizontal</span>
                      <select
                        value={draft.alignH || "left"}
                        onChange={(e) => setDraft(live.id, { alignH: e.target.value as any })}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12">Vertical</span>
                      <select
                        value={draft.alignV || "top"}
                        onChange={(e) => setDraft(live.id, { alignV: e.target.value as any })}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Modal Styles</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">BG</span>
                    <input
                      type="color"
                      value={expandShortHex(draft.modalStyle?.bg) || "#111111"}
                      onChange={(e) =>
                        setDraft(live.id, {
                          modalStyle: {
                            ...draft.modalStyle,
                            bg: expandShortHex(e.target.value),
                          },
                        })
                      }
                    />
                    <span className="text-xs">Text</span>
                    <input
                      type="color"
                      value={
                        expandShortHex(draft.modalStyle?.text) || "#ffffff"
                      }
                      onChange={(e) =>
                        setDraft(live.id, {
                          modalStyle: {
                            ...draft.modalStyle,
                            text: expandShortHex(e.target.value),
                          },
                        })
                      }
                    />
                    <span className="text-xs">Radius</span>
                    <input
                      type="range"
                      min={0}
                      max={28}
                      value={draft.modalStyle?.radius || 16}
                      onChange={(e) =>
                        setDraft(live.id, {
                          modalStyle: {
                            ...draft.modalStyle,
                            radius: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <input
                    value={
                      draft.modalStyle?.shadow || "0 10px 30px rgba(0,0,0,0.3)"
                    }
                    onChange={(e) =>
                      setDraft(live.id, {
                        modalStyle: {
                          ...draft.modalStyle,
                          shadow: e.target.value,
                        },
                      })
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder="CSS box-shadow"
                  />
                </div>

                <label className="block text-sm">Description</label>
                <RichTextEditor
                  value={draft.description || ""}
                  onChange={(html) => setDraft(live.id, { description: html })}
                />

                <div className="flex items-center justify-end gap-2">
                  <AdminButton onClick={() => apply(live.id)} variant="primary">
                    Apply Changes
                  </AdminButton>
                </div>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
      <div className="text-sm text-neutral-600 mt-3">
        Drag using the handle to reorder. Changes apply when you press Apply.
      </div>
    </div>
  );
}
