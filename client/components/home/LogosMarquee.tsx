import { useSiteConfig } from "@/state/site-config";

export default function LogosMarquee() {
  const { state } = useSiteConfig();
  const logos = state.logos.filter((l) => !l.hidden).map((l) => l.url);
  const items = [...logos, ...logos, ...logos];
  const pad = state.settings?.sectionPadding?.logos ?? 16;
  return (
    <section
      className="mt-14"
      style={{
        background: state.theme.logosSectionBg,
        paddingTop: pad,
        paddingBottom: pad,
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-4 text-center text-sm font-semibold text-neutral-700">
          Logos of Companies We Work With
        </div>
      </div>
      <div className="relative h-[100px] overflow-hidden border-y">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] group">
          <div className="flex h-full items-center animate-marquee [animation-duration:45s] group-hover:[animation-play-state:paused] gap-14">
            {items.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="logo"
                className="h-[50px] w-auto object-contain opacity-70 hover:opacity-100 transition grayscale hover:grayscale-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
