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

export default function LogosAdmin() {
  const { state, set } = useSiteConfig();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const addLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataURL(file);
    set({ logos: [...state.logos, { id: crypto.randomUUID(), url }] });
  };
  const remove = (id: string) =>
    set({ logos: state.logos.filter((l) => l.id !== id) });
  const toggle = (id: string) =>
    set({
      logos: state.logos.map((l) =>
        l.id === id ? { ...l, hidden: !l.hidden } : l,
      ),
    });
  const update = (id: string, patch: any) =>
    set({
      logos: state.logos.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });

  const onDragStart = (i: number) => setDragIdx(i);
  const onDrop = (i: number) => {
    if (dragIdx === null) return;
    const arr = [...state.logos];
    const [it] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, it);
    set({ logos: arr });
    setDragIdx(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Logos Management</h2>
        <label className="text-sm px-3 py-2 rounded-md bg-neutral-800 text-white cursor-pointer">
          Upload Logo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={addLogo}
          />
        </label>
      </div>
      <div className="space-y-3">
        {state.logos.map((l, i) => (
          <div
            key={l.id}
            className="flex items-center gap-4 bg-white p-3 rounded-md border"
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
          >
            <img
              src={l.url}
              alt="logo"
              className="h-10 w-auto object-contain"
            />
            <input
              value={l.href || ""}
              onChange={(e) => update(l.id, { href: e.target.value })}
              placeholder="Optional link"
              className="border rounded px-2 py-1 text-sm flex-1"
            />
            <button
              onClick={() => toggle(l.id)}
              className="text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
            >
              {l.hidden ? "Show" : "Hide"}
            </button>
            <button
              onClick={() => remove(l.id)}
              className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="text-sm text-neutral-600">
        Drag to reorder. Logos appear in the infinite ticker.
      </div>
    </div>
  );
}
