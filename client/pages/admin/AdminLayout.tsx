import { Link, Outlet, useLocation } from "react-router-dom";
import { useSiteConfig } from "@/state/site-config";
import {
  LayoutDashboard,
  Images,
  Box,
  Building2,
  MessageSquare,
  LayoutPanelTop,
  LayoutPanelBottom,
  Palette,
  Settings,
  Menu,
  X,
  Home,
  LogOut,
} from "lucide-react";
import { useState } from "react";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

function NavItem({ to, label, icon, description }: NavItemProps) {
  const loc = useLocation();
  const active =
    to === "/admin" ? loc.pathname === "/admin" : loc.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <div
        className={`${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {description && (
          <div
            className={`text-xs mt-0.5 ${active ? "text-white/80" : "text-gray-500"}`}
          >
            {description}
          </div>
        )}
      </div>
    </Link>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export default function AdminLayout() {
  const { state } = useSiteConfig();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      section: "Overview",
      items: [
        {
          to: "/admin",
          label: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          description: "Analytics & overview",
        },
      ],
    },
    {
      section: "Content Management",
      items: [
        {
          to: "/admin/slider",
          label: "Hero Slider",
          icon: <Images className="h-5 w-5" />,
          description: "Manage slide images",
        },
        {
          to: "/admin/boxes",
          label: "Content Boxes",
          icon: <Box className="h-5 w-5" />,
          description: "Feature boxes & cards",
        },
        {
          to: "/admin/logos",
          label: "Brand Logos",
          icon: <Building2 className="h-5 w-5" />,
          description: "Partner & client logos",
        },
        {
          to: "/admin/contact",
          label: "Contact Messages",
          icon: <MessageSquare className="h-5 w-5" />,
          description: "Manage inquiries",
        },
      ],
    },
    {
      section: "Site Customization",
      items: [
        {
          to: "/admin/header",
          label: "Header",
          icon: <LayoutPanelTop className="h-5 w-5" />,
          description: "Navigation & branding",
        },
        {
          to: "/admin/footer",
          label: "Footer",
          icon: <LayoutPanelBottom className="h-5 w-5" />,
          description: "Links & social media",
        },
        {
          to: "/admin/colors",
          label: "Colors & Theme",
          icon: <Palette className="h-5 w-5" />,
          description: "Brand colors & styling",
        },
        {
          to: "/admin/settings",
          label: "Settings",
          icon: <Settings className="h-5 w-5" />,
          description: "General configuration",
        },
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-70px)] bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 shadow-sm
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:static lg:inset-auto lg:z-auto lg:shadow-none
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600 mt-1">
                Managing:{" "}
                <span className="font-medium text-brand-600">
                  {state.header.logoText}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-8 overflow-y-auto">
            {navigation.map((section) => (
              <NavSection key={section.section} title={section.section}>
                {section.items.map((item) => (
                  <NavItem key={item.to} {...item} />
                ))}
              </NavSection>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home className="h-5 w-5 text-gray-400" />
              <span>View Site</span>
            </Link>
            <div className="text-xs text-gray-500 px-4">
              Changes are saved automatically and applied in real-time.
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-80">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-sm font-medium text-gray-900">Admin Panel</div>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Content area */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
