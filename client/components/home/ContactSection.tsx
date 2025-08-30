import { useEffect, useRef, useState } from "react";
import { ContactFormData, ContactResponse } from "@shared/api";
import {
  User,
  Mail,
  Pencil,
  MessageSquare,
  Phone,
  Globe,
  Tag,
} from "lucide-react";
import { useSiteConfig } from "@/state/site-config";

interface ExtendedContactFormData extends ContactFormData {
  country?: string;
  type?: string;
  mobile?: string;
}

function Field({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-300">
        {icon}
      </div>
      {children}
    </div>
  );
}

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
];

const INQUIRY_TYPES = [
  "General Inquiry",
  "Support Request",
  "Sales Question",
  "Partnership",
  "Technical Issue",
  "Feature Request",
  "Bug Report",
  "Other",
];

export default function ContactSection() {
  const { state } = useSiteConfig();
  const [form, setForm] = useState<ExtendedContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    country: "",
    type: "",
    mobile: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExtendedContactFormData, string>>
  >({});
  const [status, setStatus] = useState<string>("");
  const recaptchaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const siteKey =
      (window as any).RECAPTCHA_SITE_KEY ||
      (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey || (window as any).grecaptcha) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const validate = (): boolean => {
    const e: Partial<Record<keyof ExtendedContactFormData, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 10)
      e.message = "Message must be at least 10 characters";
    if (!form.country) e.country = "Please select your country";
    if (!form.type) e.type = "Please select inquiry type";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getRecaptchaToken = async (): Promise<string | undefined> => {
    const siteKey =
      (window as any).RECAPTCHA_SITE_KEY ||
      (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
    const grecaptcha = (window as any).grecaptcha;
    if (siteKey && grecaptcha?.ready) {
      return new Promise((resolve) => {
        grecaptcha.ready(() => {
          grecaptcha
            .execute(siteKey, { action: "submit" })
            .then((token: string) => resolve(token));
        });
      });
    }
    return undefined;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("Sending...");
    const token = await getRecaptchaToken();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recaptchaToken: token }),
      });
      const data = (await res.json()) as ContactResponse;
      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        setStatus(data.message);
        return;
      }
      // Also persist to backend messages store
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          country: form.country,
          type: form.type,
          mobile: form.mobile,
        }),
      });
      setStatus(data.message);
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        country: "",
        type: "",
        mobile: "",
      });
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    }
  };

  const pad = state.settings?.sectionPadding?.contact ?? 32;
  const recipient = state.settings?.contactEmail || "configure in Settings";
  return (
    <section
      id="contact"
      className="mx-auto max-w-[1200px] px-4 sm:px-6 mt-16"
      style={{
        paddingTop: pad,
        paddingBottom: pad,
        background: state.theme.contactSectionBg,
      }}
    >
      <div
        className="mx-auto max-w-[800px] rounded-2xl text-white p-6 sm:p-8 shadow-2xl border border-white/10"
        style={{ background: state.theme.contactSectionBg || "#1a1a1a" }}
      >
        <h2 className="text-2xl font-bold mb-2">Let’s Talk</h2>
        <p className="text-xs text-neutral-300 mb-4">
          Messages will be sent to: {recipient}
        </p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <Field icon={<User className="h-4 w-4" />}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full h-11 sm:h-12 rounded-xl bg-[#2a2a2a] pl-10 pr-3 border border-[#444] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </Field>
            <Field icon={<Mail className="h-4 w-4" />}>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                type="email"
                className="w-full h-11 sm:h-12 rounded-xl bg-[#2a2a2a] pl-10 pr-3 border border-[#444] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <Field icon={<Globe className="h-4 w-4" />}>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full h-11 sm:h-12 rounded-xl bg-[#2a2a2a] pl-10 pr-3 border border-[#444] text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field icon={<Tag className="h-4 w-4" />}>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full h-11 sm:h-12 rounded-xl bg-[#2a2a2a] pl-10 pr-3 border border-[#444] text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="">Select inquiry type</option>
                {INQUIRY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <Field icon={<Phone className="h-4 w-4" />}>
              <input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="Mobile number (optional)"
                type="tel"
                className="w-full h-11 sm:h-12 rounded-xl bg-[#2a2a2a] pl-10 pr-3 border border-[#444] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </Field>
            <Field icon={<Pencil className="h-4 w-4" />}>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Subject"
                className="w-full h-11 sm:h-12 rounded-xl bg-[#2a2a2a] pl-10 pr-3 border border-[#444] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </Field>
          </div>
          <div>
            <Field icon={<MessageSquare className="h-4 w-4" />}>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your project or inquiry..."
                rows={5}
                className="w-full min-h-[120px] sm:min-h-[140px] rounded-xl bg-[#2a2a2a] pl-10 pr-3 py-3 border border-[#444] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-y"
              />
            </Field>
          </div>
          {/* Errors */}
          <div className="text-red-400 text-sm space-y-1">
            {errors.name && <div>👤 {errors.name}</div>}
            {errors.email && <div>✉️ {errors.email}</div>}
            {errors.country && <div>🌍 {errors.country}</div>}
            {errors.type && <div>🏷️ {errors.type}</div>}
            {errors.mobile && <div>📱 {errors.mobile}</div>}
            {errors.subject && <div>📝 {errors.subject}</div>}
            {errors.message && <div>💬 {errors.message}</div>}
            {errors.recaptchaToken && <div>⚠️ {errors.recaptchaToken}</div>}
          </div>
          <div ref={recaptchaRef} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="submit"
              disabled={status === "Sending..."}
              className="h-11 sm:h-12 w-full sm:w-auto px-8 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
            >
              {status === "Sending..." ? "Sending..." : "Send Message"}
            </button>
            {status && status !== "Sending..." && (
              <div className="text-sm text-neutral-300">{status}</div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
