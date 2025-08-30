import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/state/site-config";
import { bgStyleFrom } from "@/lib/background";

interface BoxProps {
  id: string;
}

function computeShadow(intensity: number, direction: string) {
  const d = 6 + intensity;
  const blur = 12 + intensity * 1.5;
  const spread = Math.max(0, Math.floor(intensity / 6));
  const map: Record<string, [number, number]> = {
    "top-left": [-d, -d],
    "top-right": [d, -d],
    "bottom-left": [-d, d],
    "bottom-right": [d, d],
  };
  const [x, y] = map[direction] || [d, d];
  return `${x}px ${y}px ${blur}px ${spread}px rgba(0,0,0,0.15)`;
}

function Box({ id }: BoxProps) {
  const { state } = useSiteConfig();
  const box = state.boxes.find((b) => b.id === id);
  const modalEnabled = box?.modalEnabled !== false;
  const modalStyle = box?.modalStyle || {};
  const heightPx = box?.height || state.settings?.boxHeights?.small || 200;

  if (!box) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "group relative w-full border bg-white transition focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:cursor-not-allowed",
            "overflow-hidden",
          )}
          style={{
            ...bgStyleFrom(box.background as any),
            borderRadius: (box.borderRadius ?? 12) + "px",
            boxShadow: box.shadow
              ? computeShadow(box.shadow.intensity, box.shadow.direction)
              : undefined,
          }}
          disabled={!modalEnabled}
        >
          {/* Image on top with controlled height */}
          {box.imageUrl && (
            <div className="w-full">
              <img
                src={box.imageUrl}
                alt={box.title}
                className="w-full object-cover"
                style={{
                  height: heightPx,
                  borderTopLeftRadius: (box.borderRadius ?? 12) + "px",
                  borderTopRightRadius: (box.borderRadius ?? 12) + "px",
                }}
              />
            </div>
          )}
          {/* Card body */}
          <div className="p-4 bg-white/90 backdrop-blur-[1px]">
            <div className="text-base font-semibold text-neutral-900">
              {box.title}
            </div>
            <div className="mt-3 flex items-center gap-2">
              {(box.ctaMode === "button" ||
                box.ctaMode === "both" ||
                !box.ctaMode) && (
                <span className="inline-flex items-center px-3 py-2 text-sm rounded-md bg-brand-600 text-white shadow group-hover:bg-brand-500 transition-colors">
                  {box.buttonLabel || "Read More"}
                </span>
              )}
              {(box.ctaMode === "icon" || box.ctaMode === "both") && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-brand-600"
                >
                  <path d="M13.5 4.5a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V6.31l-7.72 7.72a.75.75 0 1 1-1.06-1.06l7.72-7.72h-3.44a.75.75 0 0 1-.75-.75Z" />
                  <path d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h12.5a.75.75 0 0 0 .75-.75v-5.5a.75.75 0 0 1 1.5 0v5.5A2.25 2.25 0 0 1 17.75 21H5.25A2.25 2.25 0 0 1 3 18.75V6.75Z" />
                </svg>
              )}
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent
        className="md:max-w-2xl lg:max-w-3xl max-h-[80vh] overflow-y-auto"
        style={{
          background: modalStyle.bg || undefined,
          color: modalStyle.text || undefined,
          boxShadow: modalStyle.shadow || undefined,
          borderRadius: modalStyle.radius
            ? `${modalStyle.radius}px`
            : undefined,
        }}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold leading-tight break-words">
            {box.title ?? "No Title"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-hidden">
          {box.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={box.imageUrl}
                alt={box.title}
                className="w-full h-64 object-cover rounded"
                style={{ maxWidth: "100%" }}
              />
            </div>
          )}
          {box?.description && (
            <div
              className="text-sm leading-6 break-words overflow-wrap-anywhere hyphens-auto prose prose-sm max-w-none"
              style={{
                wordWrap: "break-word",
                overflowWrap: "anywhere",
                whiteSpace: "pre-wrap",
                maxWidth: "100%",
              }}
              dangerouslySetInnerHTML={{ __html: box.description }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Boxes() {
  const { state } = useSiteConfig();
  const visible = state.boxes.filter((b) => !b.hidden);
  const pad = state.settings?.sectionPadding?.boxes ?? 24;

  return (
    <section
      className="mx-auto max-w-[1200px] px-4 sm:px-6 mt-8 sm:mt-10"
      style={{
        paddingTop: pad,
        paddingBottom: pad,
        background: state.theme.boxesSectionBg,
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {visible.map((b) => (
          <div
            key={b.id}
            className={cn(
              b.size === "large"
                ? "sm:col-span-2 lg:col-span-4"
                : b.size === "medium"
                  ? "sm:col-span-1 lg:col-span-2"
                  : "sm:col-span-1 lg:col-span-1",
            )}
          >
            <Box id={b.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
