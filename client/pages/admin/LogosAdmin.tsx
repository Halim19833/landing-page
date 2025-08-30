import { useSiteConfig } from "@/state/site-config";
import { useState } from "react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminIconButton,
  AdminInput,
} from "@/components/admin/AdminUI";
import { GripVertical, Eye, EyeOff, Trash2, Building2, Link as LinkIcon } from "lucide-react";

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
      logos: state.logos.map((l) => (l.id === id ? { ...l, hidden: !l.hidden } : l)),
    });
  const update = (id: string, patch: any) =>
    set({ logos: state.logos.map((l) => (l.id === id ? { ...l, ...patch } : l)) });

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
    <div className="space-y-8">
      <AdminPageHeader
        title="Brand Logos"
        description="Upload partner/client logos and control their order in the marquee."
        action={
          <label className="inline-flex items-center">
            <input type="file" accept="image/*" className="hidden" onChange={addLogo} />
            <AdminButton className="cursor-pointer">
              <Building2 className="h-4 w-4 mr-2" /> Upload Logo
            </AdminButton>
          </label>
        }
      />

      {state.logos.length === 0 && (
        <AdminCard className="text-sm text-gray-600">
          No logos yet. Click "Upload Logo" to add your first logo.
        </AdminCard>
      )}

      <div className="space-y-4">
        {state.logos.map((l, i) => (
          <AdminCard
            key={l.id}
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

              <img src={l.url} alt="logo" className="h-10 w-auto object-contain" />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                  <AdminInput
                    value={l.href || ""}
                    onChange={(e) => update(l.id, { href: e.target.value })}
                    placeholder="Optional link (https://...)"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <AdminIconButton
                  variant="secondary"
                  size="small"
                  onClick={() => toggle(l.id)}
                  title={l.hidden ? "Show logo" : "Hide logo"}
                >
                  {l.hidden ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </AdminIconButton>
                <AdminIconButton
                  variant="danger"
                  size="small"
                  onClick={() => remove(l.id)}
                  title="Delete logo"
                >
                  <Trash2 className="h-3 w-3" />
                </AdminIconButton>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {state.logos.length > 0 && (
        <div className="text-sm text-neutral-600">
          Drag to reorder. Logos appear in the infinite ticker on the homepage.
        </div>
      )}
    </div>
  );
}
