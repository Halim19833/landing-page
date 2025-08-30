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

const SocialIcon = ({ platform, url }: { platform: string; url: string }) => {
  const iconProps = { className: "h-5 w-5" };

  switch (platform) {
    case "facebook":
      return <Facebook {...iconProps} style={{ color: "#1877F2" }} />;
    case "twitter":
      return <Twitter {...iconProps} style={{ color: "#1DA1F2" }} />;
    case "instagram":
      return <Instagram {...iconProps} style={{ color: "#E1306C" }} />;
    case "linkedin":
      return <Linkedin {...iconProps} style={{ color: "#0A66C2" }} />;
    case "github":
      return <Github {...iconProps} style={{ color: "#333" }} />;
    case "youtube":
      return <Youtube {...iconProps} style={{ color: "#FF0000" }} />;
    default:
      return null;
  }
};

export default function SiteFooter() {
  const { state } = useSiteConfig();
  const socialOrder = state.footer.socialOrder || [
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
  ];
  const socials = state.footer.socials || {};

  return (
    <footer
      className="mt-24 text-white"
      style={{
        ...bgStyleFrom(state.footer.background as any),
        color: "white",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">
              {state.header.logoText}
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              We craft reliable web platforms and modern digital experiences
              with a focus on performance and usability.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="opacity-80 hover:opacity-100 hover:underline transition-opacity"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="opacity-80 hover:opacity-100 hover:underline transition-opacity"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="opacity-80 hover:opacity-100 hover:underline transition-opacity"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  className="opacity-80 hover:opacity-100 hover:underline transition-opacity"
                >
                  Admin Panel
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Connect</h3>
            <p className="text-sm opacity-80 mb-4">
              Follow us on social media for updates and news.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {socialOrder.map((platform) => {
                const url = (socials as any)[platform];
                if (!url) return null;
                return (
                  <a
                    key={platform}
                    aria-label={`Follow us on ${platform}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                  >
                    <SocialIcon platform={platform} url={url} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm opacity-80">
            <span>{state.footer.text}</span>
            {state.footer.extraText && <span>{state.footer.extraText}</span>}
          </div>
        </div>
      </div>
    </footer>
  );
}
