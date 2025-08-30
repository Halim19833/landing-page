import { useSiteConfig } from "@/state/site-config";
import { useState } from "react";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Slider Management</h2>
        <label className="text-sm px-3 py-2 rounded-md bg-neutral-800 text-white cursor-pointer">
          Upload Slide
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={addSlide}
          />
        </label>
      </div>
      <div className="grid gap-4">
        {state.slides.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-4 bg-white p-3 rounded-md border"
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
          >
            <img
              src={s.url}
              alt="slide"
              className="h-16 w-28 object-cover rounded"
            />
            <div className="flex-1">
              <input
                value={s.alt || ""}
                onChange={(e) =>
                  set({
                    slides: state.slides.map((x) =>
                      x.id === s.id ? { ...x, alt: e.target.value } : x,
                    ),
                  })
                }
                placeholder="Alt text"
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>
            <button
              onClick={() => toggle(s.id)}
              className="text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
            >
              {s.hidden ? "Show" : "Hide"}
            </button>
            <button
              onClick={() => remove(s.id)}
              className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="text-sm text-neutral-600">
        Drag items to reorder. Changes are saved instantly.
      </div>
    </div>
  );
}
