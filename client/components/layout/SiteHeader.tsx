import { cn } from "@/lib/utils";
import { Globe, Mail, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteConfig } from "@/state/site-config";
import { bgStyleFrom } from "@/lib/background";

export default function SiteHeader() {
  const { state } = useSiteConfig();
  const [count, setCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    let stop = false;
    let apiOk = true;
    let cooldown: any = null;

    const load = async () => {
      if (!apiOk || stop) return;
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        const res = await fetch("/api/messages", { signal: controller.signal });
        clearTimeout(t);
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
        if (!stop)
          setCount((data.items || []).filter((m: any) => !m.read).length);
      } catch {
        if (!stop) setCount(0);
        apiOk = false;
        if (cooldown) clearTimeout(cooldown);
        cooldown = setTimeout(() => {
          apiOk = true;
        }, 30000);
      }
    };

    load();
    const id = setInterval(load, 5000);
    return () => {
      stop = true;
      clearInterval(id);
      if (cooldown) clearTimeout(cooldown);
    };
  }, []);
  useEffect(() => {
    const el = document.getElementById("app-root-bg");
    if (el)
      (el as HTMLElement).style.background = state.theme.pageBg || "#ffffff";
  }, [state.theme.pageBg]);
  return (
    <header
      className={cn("w-full border-b border-neutral-200 relative")}
      style={bgStyleFrom(state.header.background as any)}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-4 flex items-center justify-between h-[70px]">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 font-extrabold text-lg sm:text-xl text-neutral-900 z-20 relative"
        >
          {state.header.logoUrl ? (
            <img
              src={state.header.logoUrl}
              alt="logo"
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            />
          ) : (
            <span className="inline-block h-6 w-6 sm:h-8 sm:w-8 rounded-md bg-gradient-to-br from-sky-500 to-cyan-400" />
          )}
          <span className="truncate max-w-[150px] sm:max-w-none">
            {state.header.logoText}
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm text-neutral-700">
          <a
            href="#"
            className="inline-flex items-center gap-2 hover:text-neutral-900 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden lg:inline">
              {state.header.languages?.find(
                (l) => l.code === state.header.selectedLang,
              )?.label || state.header.languageText}
            </span>
          </a>
          <a
            href="#contact"
            className="relative inline-flex items-center gap-2 hover:text-neutral-900 transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden lg:inline">{state.header.contactText}</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-3 h-5 min-w-5 px-1 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center">
                {count}
              </span>
            )}
          </a>
          <a
            href="/admin"
            className="text-xs px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200"
          >
            Admin
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden z-20 relative p-2 text-neutral-700 hover:text-neutral-900"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 md:hidden z-10">
            <nav className="mx-auto max-w-[1200px] px-4 py-4 space-y-4">
              <a
                href="#"
                className="flex items-center gap-3 py-2 text-neutral-700 hover:text-neutral-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Globe className="h-4 w-4" />
                <span>
                  {state.header.languages?.find(
                    (l) => l.code === state.header.selectedLang,
                  )?.label || state.header.languageText}
                </span>
              </a>
              <a
                href="#contact"
                className="relative flex items-center gap-3 py-2 text-neutral-700 hover:text-neutral-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mail className="h-4 w-4" />
                <span>{state.header.contactText}</span>
                {count > 0 && (
                  <span className="h-5 min-w-5 px-1 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center">
                    {count}
                  </span>
                )}
              </a>
              <a
                href="/admin"
                className="inline-block px-4 py-2 text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
