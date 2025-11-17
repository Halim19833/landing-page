import {
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Github,
  Youtube,
} from "lucide-react";

import { useSiteConfig } from "@/state/site-config";
import { bgStyleFrom } from "@/lib/background";

function IconFor({
  name,
  className,
  color,
}: {
  name: string;
  className?: string;
  color?: string;
}) {
  const props = {
    className: className || "h-5 w-5",
    style: color ? { color } : undefined,
  } as any;
  switch (name) {
    case "facebook":
    case "Facebook":
      return <Facebook {...props} />;
    case "twitter":
    case "Twitter":
      return <Twitter {...props} />;
    case "instagram":
    case "Instagram":
      return <Instagram {...props} />;
    case "linkedin":
    case "Linkedin":
    case "LinkedIn":
      return <Linkedin {...props} />;
    case "youtube":
    case "YouTube":
    case "Youtube":
      return <Youtube {...props} />;
    case "github":
    case "GitHub":
    case "Github":
      return <Github {...props} />;
    default:
      return <Github {...props} />;
  }
}

export default function SiteFooter() {
  const { state } = useSiteConfig();
  const footer = state.footer;
  const headings = footer.headings!;
  const colors = footer.colors!;
  const linksBy = footer.linksByColumn!;
  const socialIcons = (footer.socialIcons || [])
    .filter((s) => s.enabled && s.url)
    .sort((a, b) => a.order - b.order);

  const textColor = colors.textColor || "#ffffff";
  const linkColor = colors.linkColor || textColor;
  const iconColor = colors.iconColor || textColor;

  return (
    <footer
      className="mt-24"
      style={{
        ...bgStyleFrom(state.footer.background as any),
        color: textColor,
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
          {headings.about.enabled && (
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: textColor }}
              >
                {headings.about.title}
              </h3>
              <p
                className="text-sm opacity-80 leading-relaxed"
                style={{ color: textColor }}
              >
                {footer.description ||
                  "We craft reliable web platforms and modern digital experiences with a focus on performance and usability."}
              </p>
              {linksBy.about && linksBy.about.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm">
                  {linksBy.about
                    .filter((l) => l.enabled)
                    .map((l, idx) => (
                      <li key={idx}>
                        <a
                          href={l.url || "#"}
                          style={{ color: linkColor }}
                          className="hover:underline"
                        >
                          {l.text || "Link"}
                        </a>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}

          {headings.quick.enabled && (
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: textColor }}
              >
                {headings.quick.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {linksBy.quick
                  .filter((l) => l.enabled)
                  .map((l, idx) => (
                    <li key={idx}>
                      <a
                        href={l.url || "#"}
                        style={{ color: linkColor }}
                        className="opacity-90 hover:opacity-100 hover:underline transition-opacity"
                      >
                        {l.text || "Link"}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {headings.contact.enabled && (
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: textColor }}
              >
                {headings.contact.title}
              </h3>
              {linksBy.contact && linksBy.contact.length > 0 && (
                <ul className="space-y-2 text-sm mb-4">
                  {linksBy.contact
                    .filter((l) => l.enabled)
                    .map((l, idx) => (
                      <li key={idx}>
                        <a
                          href={l.url || "#"}
                          style={{ color: linkColor }}
                          className="hover:underline"
                        >
                          {l.text || "Contact"}
                        </a>
                      </li>
                    ))}
                </ul>
              )}

              {/* Social Icons */}
              {socialIcons.length > 0 && (
                <div className="flex gap-3">
                  {socialIcons.map((s, i) => (
                    <a
                      key={`${s.platform}-${i}`}
                      aria-label={`Follow us on ${s.platform}`}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                      style={{ color: iconColor }}
                    >
                      <IconFor name={s.icon || s.platform} color={iconColor} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bottom */}
        <div
          className="border-t pt-6"
          style={{ borderColor: "rgba(255,255,255,0.2)" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm opacity-80">
            <span style={{ color: textColor }}>{state.footer.text}</span>
            {state.footer.extraText && (
              <span style={{ color: textColor }}>{state.footer.extraText}</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
