import { useSiteConfig } from "@/state/site-config";
import { useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminIconButton,
  AdminInput,
  AdminFormGroup,
  AdminSelect,
} from "@/components/admin/AdminUI";
import { GripVertical, Eye, EyeOff, Trash2, Images } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SliderAdmin() {
  const { state, set } = useSiteConfig();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Local form state for size controls
  const cfg = state.slider || { widthPercent: 100, height: { unit: "px", mobile: 250, tablet: 320, desktop: 400 } };
  const [widthPercent, setWidthPercent] = useState<number>(cfg.widthPercent);
  const [unit, setUnit] = useState<"px" | "vh">(cfg.height.unit);
  const [mobileH, setMobileH] = useState<number>(cfg.height.mobile);
  const [tabletH, setTabletH] = useState<number>(cfg.height.tablet);
  const [desktopH, setDesktopH] = useState<number>(cfg.height.desktop);

  useEffect(() => {
    // keep local state in sync if external changes happen
    const s = state.slider || cfg;
    setWidthPercent(s.widthPercent);
    setUnit(s.height.unit);
    setMobileH(s.height.mobile);
    setTabletH(s.height.tablet);
    setDesktopH(s.height.desktop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.slider?.widthPercent, state.slider?.height?.unit, state.slider?.height?.mobile, state.slider?.height?.tablet, state.slider?.height?.desktop]);

  const applySize = () => {
    set({ slider: { widthPercent, height: { unit, mobile: mobileH, tablet: tabletH, desktop: desktopH } } });
    toast({ title: "Saved", description: "Hero Slider size updated successfully." });
  };

  const addSlide = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataURL(file);
    set({ slides: [...state.slides, { id: crypto.randomUUID(), url }] });
  };

  const remove = (id: string) =>
    set({ slides: state.slides.filter((s) => s.id !== id) });
  const toggle = (id: string) =>
    set({
      slides: state.slides.map((s) =>
        s.id === id ? { ...s, hidden: !s.hidden } : s,
      ),
    });

  const onDragStart = (i: number) => setDragIdx(i);
  const onDrop = (i: number) => {
    if (dragIdx === null) return;
    const arr = [...state.slides];
    const [it] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, it);
    set({ slides: arr });
    setDragIdx(null);
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Hero Slider"
        description="Upload, reorder, and manage the slides shown in the homepage hero."
        action={
          <label className="inline-flex items-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={addSlide}
            />
            <AdminButton className="cursor-pointer">
              <Images className="h-4 w-4 mr-2" /> Upload Slide
            </AdminButton>
          </label>
        }
      />

      {/* Size Controls */}
      <AdminCard className="space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminFormGroup label="Width (%)">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={100}
                value={widthPercent}
                onChange={(e) => setWidthPercent(Number(e.target.value))}
                className="flex-1"
              />
              <AdminInput
                type="number"
                value={widthPercent}
                onChange={(e) => setWidthPercent(Math.max(50, Math.min(100, Number(e.target.value))))}
                className="w-24"
              />
            </div>
          </AdminFormGroup>
          <AdminFormGroup label="Height Unit">
            <AdminSelect value={unit} onChange={(e) => setUnit(e.target.value as any)}>
              <option value="px">Pixels (px)</option>
              <option value="vh">Viewport (vh)</option>
            </AdminSelect>
          </AdminFormGroup>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <AdminFormGroup label="Mobile Height">
            <AdminInput
              type="number"
              value={mobileH}
              onChange={(e) => setMobileH(Number(e.target.value))}
              placeholder={unit === "vh" ? "e.g., 24" : "e.g., 250"}
            />
          </AdminFormGroup>
          <AdminFormGroup label="Tablet Height">
            <AdminInput
              type="number"
              value={tabletH}
              onChange={(e) => setTabletH(Number(e.target.value))}
              placeholder={unit === "vh" ? "e.g., 32" : "e.g., 320"}
            />
          </AdminFormGroup>
          <AdminFormGroup label="Desktop Height">
            <AdminInput
              type="number"
              value={desktopH}
              onChange={(e) => setDesktopH(Number(e.target.value))}
              placeholder={unit === "vh" ? "e.g., 40" : "e.g., 400"}
            />
          </AdminFormGroup>
        </div>
        <div className="flex justify-end">
          <AdminButton onClick={applySize}>Save Changes</AdminButton>
        </div>
      </AdminCard>

      {state.slides.length === 0 && (
        <AdminCard className="text-sm text-gray-600">
          No slides yet. Click "Upload Slide" to add your first image.
        </AdminCard>
      )}

      <div className="space-y-4">
        {state.slides.map((s, i) => (
          <AdminCard
            key={s.id}
            className="relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
          >
            <div className="flex items-center gap-4">
              <span
                title="Drag to reorder"
                className="cursor-grab inline-flex items-center justify-center h-9 w-9 rounded-lg bg-gray-100"
                draggable
                onDragStart={() => onDragStart(i)}
              >
                <GripVertical className="h-4 w-4 text-gray-600" />
              </span>

              <img
                src={s.url}
                alt={s.alt || "slide preview"}
                className="h-16 w-28 object-cover rounded-lg border"
              />

              <div className="flex-1 grid gap-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <AdminInput
                    value={s.alt || ""}
                    onChange={(e) =>
                      set({
                        slides: state.slides.map((x) =>
                          x.id === s.id ? { ...x, alt: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Alt text for accessibility"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <AdminIconButton
                  variant="secondary"
                  size="small"
                  onClick={() => toggle(s.id)}
                  title={s.hidden ? "Show slide" : "Hide slide"}
                >
                  {s.hidden ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </AdminIconButton>
                <AdminIconButton
                  variant="danger"
                  size="small"
                  onClick={() => remove(s.id)}
                  title="Delete slide"
                >
                  <Trash2 className="h-3 w-3" />
                </AdminIconButton>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {state.slides.length > 0 && (
        <div className="text-sm text-neutral-600">
          Drag using the handle to reorder. Changes are saved instantly.
        </div>
      )}
    </div>
  );
}
