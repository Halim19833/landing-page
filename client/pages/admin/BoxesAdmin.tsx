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

function BoxEditorTrigger({ boxId, index }: { boxId: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AdminButton size="small" variant="secondary" onClick={() => setOpen(true)}>Edit</AdminButton>
      {open && <BoxEditorSheet boxId={boxId} onClose={() => setOpen(false)} />}
    </>
  );
}

function BoxEditorSheet({ boxId, onClose }: { boxId: string; onClose: () => void }) {
  const { state, set } = useSiteConfig();
  const live = state.boxes.find((b) => b.id === boxId)!;
  const [draft, setDraft] = useState({ ...live });
  const setField = (patch: any) => setDraft((d: any) => ({ ...d, ...patch }));

  useEffect(() => {
    const t = setTimeout(() => {
      set({ boxes: state.boxes.map((b) => (b.id === boxId ? draft : b)) });
    }, 250);
    return () => clearTimeout(t);
  }, [draft]);

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Box</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <AdminFormGroup label="Title">
            <div className="flex items-center gap-2">
              <AdminInput value={draft.title} onChange={(e) => setField({ title: e.target.value })} />
              <EmojiPicker onEmojiClick={(e: EmojiClickData) => setField({ title: (draft.title || "") + e.emoji })} width={280} height={380} lazyLoadEmojis skinTonesDisabled categories={["suggested"] as any} />
            </div>
          </AdminFormGroup>
          <AdminFormGroup label="Alt / Subtitle">
            <AdminInput value={draft.alt || ""} onChange={(e) => setField({ alt: e.target.value })} />
          </AdminFormGroup>
          <AdminFormGroup label="Description">
            <RichTextEditor value={draft.description || ""} onChange={(html) => setField({ description: html })} />
          </AdminFormGroup>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormGroup label="Height (px)">
              <AdminInput type="number" value={draft.height || 200} onChange={(e) => setField({ height: Number(e.target.value) })} />
            </AdminFormGroup>
            <AdminFormGroup label="Border Radius">
              <AdminInput type="number" value={draft.borderRadius ?? 12} onChange={(e) => setField({ borderRadius: Number(e.target.value) })} />
            </AdminFormGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormGroup label="CTA Mode">
              <AdminSelect value={draft.ctaMode || "button"} onChange={(e) => setField({ ctaMode: e.target.value })}>
                <option value="button">Button</option>
                <option value="icon">Icon</option>
                <option value="both">Both</option>
              </AdminSelect>
            </AdminFormGroup>
            <AdminFormGroup label="Button Label">
              <AdminInput value={draft.buttonLabel || "Read More"} onChange={(e) => setField({ buttonLabel: e.target.value })} />
            </AdminFormGroup>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["mobile","tablet","desktop"] as const).map((bp) => (
              <AdminFormGroup key={bp} label={`Span ${bp}`}>
                <AdminInput type="number" min={1} max={12} value={(draft.gridSpan as any)?.[bp] ?? 1} onChange={(e) => setField({ gridSpan: { ...(draft.gridSpan || { mobile:1, tablet:1, desktop:1 }), [bp]: Number(e.target.value) } })} />
              </AdminFormGroup>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormGroup label="Align H">
              <AdminSelect value={draft.alignH || "left"} onChange={(e) => setField({ alignH: e.target.value })}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </AdminSelect>
            </AdminFormGroup>
            <AdminFormGroup label="Align V">
              <AdminSelect value={draft.alignV || "top"} onChange={(e) => setField({ alignV: e.target.value })}>
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </AdminSelect>
            </AdminFormGroup>
          </div>
          <div className="flex justify-end gap-2">
            <AdminButton variant="secondary" onClick={onClose}>Close</AdminButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function BoxesAdmin() {
  const { state, set } = useSiteConfig();

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

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Grid Editor"
        description="Drag, resize, and configure cards. Changes sync live to the site."
        action={
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {state.boxes.filter((b) => !b.hidden).length} visible / {state.boxes.length} total
            </div>
            <AdminButton onClick={add}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </AdminButton>
          </div>
        }
      />

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

      <AdminSection title="Grid Editor" description="Drag, drop, and resize boxes. Changes save instantly.">
        <GridEditor />
        <div className="flex items-center justify-between gap-3 mt-4">
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2">
              {state.boxes.map((b, i) => (
                <div key={b.id} className="min-w-[220px] border rounded-lg bg-white">
                  <div className="flex items-center gap-2 p-2 border-b">
                    <span title="Drag" className="inline-flex h-6 w-6 items-center justify-center rounded bg-neutral-100"><GripVertical className="h-3 w-3 text-neutral-600" /></span>
                    <span className="text-sm font-medium truncate flex-1">{b.title}</span>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={!b.hidden} onChange={(e) => set({ boxes: state.boxes.map(x => x.id===b.id ? { ...x, hidden: !e.target.checked } : x) })} />
                      Visible
                    </label>
                  </div>
                  <div className="p-2 flex items-center justify-end">
                    <BoxEditorTrigger boxId={b.id} index={i} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ExportImportControls />
        </div>
      </AdminSection>
    </div>
  );
}
