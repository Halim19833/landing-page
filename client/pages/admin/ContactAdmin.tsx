import { useEffect, useState } from "react";
import { MessageItem } from "@shared/api";
import {
  Search,
  Edit,
  Check,
  X,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  MessageSquare,
  Globe,
  Tag,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminSection,
  AdminButton,
  AdminIconButton,
  AdminInput,
  AdminSelect,
  AdminBadge,
  AdminEmptyState,
  AdminFormGroup,
} from "@/components/admin/AdminUI";

interface Msg extends MessageItem {}

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

function getCountryFlag(countryCode?: string): string {
  const country = COUNTRIES.find((c) => c.code === countryCode);
  return country ? country.flag : "🌍";
}

function getCountryName(countryCode?: string): string {
  const country = COUNTRIES.find((c) => c.code === countryCode);
  return country ? country.name : countryCode || "Unknown";
}

export default function ContactAdmin() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [filteredMsgs, setFilteredMsgs] = useState<Msg[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMsgs(data.items || []);
      } else {
        setMsgs(JSON.parse(localStorage.getItem("contactMessages") || "[]"));
      }
    } catch {
      setMsgs(JSON.parse(localStorage.getItem("contactMessages") || "[]"));
    }
  };

  // Filter messages based on country, type, and search query
  useEffect(() => {
    let filtered = [...msgs];

    if (filterCountry) {
      filtered = filtered.filter((m) => m.country === filterCountry);
    }

    if (filterType) {
      filtered = filtered.filter((m) => m.type === filterType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.subject.toLowerCase().includes(query) ||
          m.message.toLowerCase().includes(query) ||
          (m.mobile && m.mobile.includes(query)),
      );
    }

    setFilteredMsgs(filtered);
  }, [msgs, filterCountry, filterType, searchQuery]);

  useEffect(() => {
    load();
    const onAny = () => load();
    window.addEventListener("storage", onAny);
    window.addEventListener("contact-messages-change", onAny as any);

    const interval = setInterval(load, 5000);

    return () => {
      window.removeEventListener("storage", onAny);
      window.removeEventListener("contact-messages-change", onAny as any);
      clearInterval(interval);
    };
  }, []);

  const mark = async (id: string, read: boolean) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      if (response.ok) {
        load();
      }
    } catch (error) {
      const arr = msgs.map((m) => (m.id === id ? { ...m, read } : m));
      setMsgs(arr);
      localStorage.setItem("contactMessages", JSON.stringify(arr));
      window.dispatchEvent(new CustomEvent("contact-messages-change"));
    }
  };

  const approve = async (id: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (response.ok) {
        load();
      }
    } catch (error) {
      console.error("Failed to update approval status:", error);
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        load();
      }
    } catch (error) {
      const arr = msgs.filter((m) => m.id !== id);
      setMsgs(arr);
      localStorage.setItem("contactMessages", JSON.stringify(arr));
      window.dispatchEvent(new CustomEvent("contact-messages-change"));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredMsgs.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectMessage = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const bulkApprove = async () => {
    const promises = Array.from(selectedIds).map((id) => approve(id, true));
    await Promise.all(promises);
    setSelectedIds(new Set());
  };

  const bulkDelete = async () => {
    const promises = Array.from(selectedIds).map((id) => remove(id));
    await Promise.all(promises);
    setSelectedIds(new Set());
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const [recipient, setRecipient] = useState<string>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("site-config-v1") || "{}")?.settings
          ?.contactEmail || ""
      );
    } catch {
      return "";
    }
  });

  const saveRecipient = (v: string) => {
    setRecipient(v);
    try {
      const cfg = JSON.parse(localStorage.getItem("site-config-v1") || "{}");
      cfg.settings = { ...(cfg.settings || {}), contactEmail: v };
      localStorage.setItem("site-config-v1", JSON.stringify(cfg));
      window.dispatchEvent(
        new CustomEvent("site-config-change", { detail: cfg }),
      );
    } catch {}
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Contact Messages"
        description="Manage and respond to customer inquiries and contact form submissions."
        action={
          <div className="flex items-center gap-3">
            <AdminIconButton
              variant="secondary"
              onClick={load}
              title="Refresh messages"
            >
              <RefreshCw className="h-4 w-4" />
            </AdminIconButton>
            <AdminButton variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Export
            </AdminButton>
            <div className="text-sm font-medium text-gray-600">
              {filteredMsgs.length} of {msgs.length}
            </div>
          </div>
        }
      />

      {/* Filters and Search */}
      <AdminSection
        title="Filters & Search"
        description="Filter messages by country, type, or search through content."
        action={
          <AdminButton
            variant="ghost"
            size="small"
            onClick={() => {
              setFilterCountry("");
              setFilterType("");
              setSearchQuery("");
            }}
          >
            Clear Filters
          </AdminButton>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AdminFormGroup label="Search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <AdminInput
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </AdminFormGroup>

          <AdminFormGroup label="Country">
            <AdminSelect
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </AdminSelect>
          </AdminFormGroup>

          <AdminFormGroup label="Type">
            <AdminSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {INQUIRY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </AdminSelect>
          </AdminFormGroup>

          <AdminFormGroup label="Recipient Email">
            <AdminInput
              value={recipient}
              onChange={(e) => saveRecipient(e.target.value)}
              placeholder="admin@company.com"
            />
          </AdminFormGroup>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectedIds.size} selected
            </span>
            <AdminButton size="small" variant="success" onClick={bulkApprove}>
              <Check className="h-4 w-4 mr-1" />
              Approve All
            </AdminButton>
            <AdminButton size="small" variant="danger" onClick={bulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete All
            </AdminButton>
          </div>
        )}
      </AdminSection>

      {/* Messages Table */}
      <AdminCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filteredMsgs.length > 0 &&
                      selectedIds.size === filteredMsgs.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                <th className="p-4 text-left font-semibold text-gray-900">
                  ID
                </th>
                <th className="p-4 text-left font-semibold text-gray-900">
                  Country
                </th>
                <th className="p-4 text-left font-semibold text-gray-900">
                  Type
                </th>
                <th className="p-4 text-left font-semibold text-gray-900">
                  Contact
                </th>
                <th className="p-4 text-left font-semibold text-gray-900">
                  Subject
                </th>
                <th className="p-4 text-left font-semibold text-gray-900">
                  Message
                </th>
                <th className="p-4 text-left font-semibold text-gray-900">
                  Date
                </th>
                <th className="p-4 text-left font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMsgs.map((msg) => (
                <tr
                  key={msg.id}
                  className={`hover:bg-gray-50 transition-colors ${!msg.read ? "bg-blue-50" : ""}`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(msg.id)}
                      onChange={(e) =>
                        handleSelectMessage(msg.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                  </td>
                  <td className="p-4 text-gray-900 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span>{msg.id.substring(0, 8)}...</span>
                      {!msg.read && <AdminBadge variant="info">NEW</AdminBadge>}
                      {msg.approved && (
                        <AdminBadge variant="success">APPROVED</AdminBadge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getCountryFlag(msg.country)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {msg.country || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <AdminBadge variant="default">
                      {msg.type || "Other"}
                    </AdminBadge>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {msg.name}
                      </div>
                      <div className="text-xs text-gray-600">{msg.email}</div>
                      {msg.mobile && (
                        <div className="text-xs text-gray-600">
                          {msg.mobile}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-900 max-w-xs">
                    <div className="truncate" title={msg.subject}>
                      {truncateText(msg.subject, 30)}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs">
                    <div className="truncate" title={msg.message}>
                      {truncateText(msg.message, 40)}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 text-xs">
                    {formatDate(msg.at || Date.now().toString())}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <AdminIconButton
                        variant="primary"
                        size="small"
                        onClick={() =>
                          setEditingId(editingId === msg.id ? null : msg.id)
                        }
                        title="Edit message"
                      >
                        <Edit className="h-3 w-3" />
                      </AdminIconButton>
                      <AdminIconButton
                        variant={msg.approved ? "warning" : "success"}
                        size="small"
                        onClick={() => approve(msg.id, !msg.approved)}
                        title={msg.approved ? "Unapprove" : "Approve"}
                      >
                        {msg.approved ? (
                          <X className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </AdminIconButton>
                      <AdminIconButton
                        variant="danger"
                        size="small"
                        onClick={() => remove(msg.id)}
                        title="Delete message"
                      >
                        <Trash2 className="h-3 w-3" />
                      </AdminIconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMsgs.length === 0 && (
          <AdminEmptyState
            icon={<MessageSquare className="h-12 w-12" />}
            title="No messages found"
            description={
              msgs.length === 0
                ? "No contact messages have been received yet."
                : "Try adjusting your search or filter criteria."
            }
            action={
              msgs.length === 0 ? (
                <AdminButton onClick={load}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </AdminButton>
              ) : undefined
            }
          />
        )}
      </AdminCard>

      {/* Legend */}
      {filteredMsgs.length > 0 && (
        <AdminCard className="bg-gray-50">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-gray-600">Unread messages</span>
            </div>
            <div className="flex items-center gap-2">
              <AdminBadge variant="info">NEW</AdminBadge>
              <span className="text-gray-600">Unread</span>
            </div>
            <div className="flex items-center gap-2">
              <AdminBadge variant="success">APPROVED</AdminBadge>
              <span className="text-gray-600">Approved</span>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
