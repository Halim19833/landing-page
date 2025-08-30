import "./global.css";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import SliderAdmin from "./pages/admin/SliderAdmin";
import BoxesAdmin from "./pages/admin/BoxesAdmin";
import LogosAdmin from "./pages/admin/LogosAdmin";
import ContactAdmin from "./pages/admin/ContactAdmin";
import {
  HeaderAdmin,
  FooterAdmin,
  ColorsAdmin,
  SettingsAdmin,
} from "./pages/admin/OtherAdmins";

const queryClient = new QueryClient();

import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { SiteConfigProvider } from "@/state/site-config";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("App crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-neutral-600 mb-4">
              {this.state.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-neutral-900 text-white"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

const router = createBrowserRouter([
  { path: "/", element: <Index /> },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardAdmin /> },
      { path: "slider", element: <SliderAdmin /> },
      { path: "boxes", element: <BoxesAdmin /> },
      { path: "logos", element: <LogosAdmin /> },
      { path: "contact", element: <ContactAdmin /> },
      { path: "header", element: <HeaderAdmin /> },
      { path: "footer", element: <FooterAdmin /> },
      { path: "colors", element: <ColorsAdmin /> },
      { path: "settings", element: <SettingsAdmin /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Sonner />
        <SiteConfigProvider>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col" id="app-root-bg">
              <SiteHeader />
              <main className="flex-1">
                <RouterProvider router={router} />
              </main>
              <SiteFooter />
            </div>
          </ErrorBoundary>
        </SiteConfigProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
