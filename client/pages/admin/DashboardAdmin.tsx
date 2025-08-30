import { useSiteConfig } from "@/state/site-config";
import { AdminPageHeader, AdminCard } from "@/components/admin/AdminUI";
import {
  Images,
  Box,
  Building2,
  MessageSquare,
  TrendingUp,
  Users,
  Activity,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

function StatCard({
  title,
  value,
  icon,
  description,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: string; type: "up" | "down" | "neutral" };
}) {
  return (
    <AdminCard className="relative overflow-hidden">
      <div className="flex items-center">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="text-gray-400">{icon}</div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
            {trend && (
              <div
                className={`flex items-center mt-2 text-sm ${
                  trend.type === "up"
                    ? "text-green-600"
                    : trend.type === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                <TrendingUp
                  className={`h-4 w-4 mr-1 ${trend.type === "down" ? "rotate-180" : ""}`}
                />
                {trend.value}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminCard>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  timestamp,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
}) {
  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <p className="text-xs text-gray-500">{timestamp}</p>
      </div>
    </div>
  );
}

export default function DashboardAdmin() {
  const { state } = useSiteConfig();
  const [messageCount, setMessageCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadMessageStats = async () => {
      try {
        const response = await fetch("/api/messages");
        if (response.ok) {
          const data = await response.json();
          const messages = data.items || [];
          setMessageCount(messages.length);
          setUnreadCount(messages.filter((m: any) => !m.read).length);
        }
      } catch {
        // Fallback to localStorage
        try {
          const messages = JSON.parse(
            localStorage.getItem("contactMessages") || "[]",
          );
          setMessageCount(messages.length);
          setUnreadCount(messages.filter((m: any) => !m.read).length);
        } catch {
          setMessageCount(0);
          setUnreadCount(0);
        }
      }
    };

    loadMessageStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadMessageStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const visibleBoxes = state.boxes.filter((b) => !b.hidden).length;
  const visibleLogos = state.logos.filter((l) => !l.hidden).length;
  const visibleSlides = state.slides.filter((s) => !s.hidden).length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Welcome to your admin dashboard. Monitor your site's content and performance at a glance."
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Hero Slides"
          value={visibleSlides}
          icon={<Images className="h-5 w-5" />}
          description={`${state.slides.length} total (${state.slides.length - visibleSlides} hidden)`}
        />

        <StatCard
          title="Content Boxes"
          value={visibleBoxes}
          icon={<Box className="h-5 w-5" />}
          description={`${state.boxes.length} total (${state.boxes.length - visibleBoxes} hidden)`}
        />

        <StatCard
          title="Brand Logos"
          value={visibleLogos}
          icon={<Building2 className="h-5 w-5" />}
          description={`${state.logos.length} total (${state.logos.length - visibleLogos} hidden)`}
        />

        <StatCard
          title="Messages"
          value={messageCount}
          icon={<MessageSquare className="h-5 w-5" />}
          description={
            unreadCount > 0 ? `${unreadCount} unread` : "All messages read"
          }
          trend={
            unreadCount > 0
              ? { value: `${unreadCount} new`, type: "up" }
              : undefined
          }
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <AdminCard className="space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-3">
            <a
              href="/admin/boxes"
              className="block p-3 border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Box className="h-5 w-5 text-gray-400 group-hover:text-brand-600" />
                <div>
                  <p className="font-medium text-gray-900">Add Content Box</p>
                  <p className="text-sm text-gray-600">
                    Create new feature box
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/admin/contact"
              className="block p-3 border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-gray-400 group-hover:text-brand-600" />
                <div>
                  <p className="font-medium text-gray-900">View Messages</p>
                  <p className="text-sm text-gray-600">
                    Manage contact inquiries
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/admin/colors"
              className="block p-3 border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-gray-900">Customize Theme</p>
                  <p className="text-sm text-gray-600">
                    Update colors & styling
                  </p>
                </div>
              </div>
            </a>
          </div>
        </AdminCard>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <AdminCard className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-2">
              <ActivityItem
                icon={<MessageSquare className="h-4 w-4" />}
                title="New contact message"
                description="Someone submitted the contact form"
                timestamp="2 min ago"
              />
              <ActivityItem
                icon={<Box className="h-4 w-4" />}
                title="Content box updated"
                description="Modified 'Analytics' box description"
                timestamp="1 hour ago"
              />
              <ActivityItem
                icon={<Users className="h-4 w-4" />}
                title="Site visitor activity"
                description="24 unique visitors in the last hour"
                timestamp="1 hour ago"
              />
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Site Health */}
      <AdminCard className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Site Health & Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm font-medium text-green-800">
                All Systems Operational
              </p>
            </div>
            <p className="text-sm text-green-700">
              Your site is running smoothly. All content is properly configured.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-medium text-blue-800">Pro Tip</p>
            </div>
            <p className="text-sm text-blue-700">
              Consider adding more content boxes to showcase your key features
              and services.
            </p>
          </div>
        </div>
      </AdminCard>

      {/* Help */}
      <AdminCard className="bg-gradient-to-r from-brand-50 to-blue-50 border-brand-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-brand-600 text-white rounded-lg flex items-center justify-center">
              💡
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-gray-700 mb-4">
              All changes are saved automatically and applied to your live site
              in real-time. Use the sidebar navigation to manage different
              sections of your website.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300">
                Auto-save enabled
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300">
                Real-time preview
              </span>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
