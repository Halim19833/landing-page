import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteConfig } from "@/state/site-config";

export default function HeroSlider() {
  const { state } = useSiteConfig();
  const images = state.slides.filter((s) => !s.hidden);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sliderHeight, setSliderHeight] = useState<string>("400px");

  useEffect(() => {
    const compute = () => {
      const cfg = state.slider || { widthPercent: 100, height: { unit: "px", mobile: 250, tablet: 320, desktop: 400 } };
      const w = window.innerWidth;
      const bpMobile = 768;
      const bpTablet = 1024;
      let val = cfg.height.desktop;
      if (w < bpMobile) val = cfg.height.mobile;
      else if (w < bpTablet) val = cfg.height.tablet;
      const h = cfg.height.unit === "vh" ? `${val}vh` : `${val}px`;
      setSliderHeight(h);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [state.slider]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);

    const id = setInterval(() => {
      emblaApi.scrollNext();
    }, 4500);
    return () => {
      clearInterval(id);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const widthPercent = state.slider?.widthPercent ?? 100;

  return (
    <section
      className="mx-auto max-w-[1200px] px-6 mt-6"
      style={{
        paddingTop: state.settings?.sectionPadding?.hero ?? 24,
        paddingBottom: state.settings?.sectionPadding?.hero ?? 24,
      }}
    >
      <div className="relative" style={{ width: `${widthPercent}%`, margin: "0 auto" }}>
        <button
          aria-label="Previous"
          onClick={scrollPrev}
          className="absolute -left-7 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-md p-2 hover:shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next"
          onClick={scrollNext}
          className="absolute -right-7 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-md p-2 hover:shadow-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div ref={emblaRef} className="overflow-hidden rounded-[20px]" style={{ height: sliderHeight }}>
          <div className="flex h-full">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative min-w-0 flex-[0_0_100%] h-full"
              >
                <img
                  src={img.url}
                  alt={img.alt ?? "slide"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${selectedIndex === i ? "bg-brand-600 scale-110" : "bg-neutral-300"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
