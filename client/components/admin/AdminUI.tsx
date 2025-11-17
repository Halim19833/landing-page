import React from "react";
import { cn } from "@/lib/utils";

// Page Layout Components
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-2 max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  padding = "default",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "small" | "default" | "large";
} & React.HTMLAttributes<HTMLDivElement>) {
  const paddingClasses = {
    none: "",
    small: "p-4",
    default: "p-6",
    large: "p-8",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AdminSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <AdminCard className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </AdminCard>
  );
}

// Button Components
export function AdminButton({
  variant = "primary",
  size = "default",
  children,
  className,
  ...props
}: {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "ghost";
  size?: "small" | "default" | "large";
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    warning:
      "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 shadow-sm",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminIconButton({
  variant = "ghost",
  size = "default",
  children,
  className,
  title,
  ...props
}: {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "ghost";
  size?: "small" | "default" | "large";
  children: React.ReactNode;
  className?: string;
  title?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-500",
    secondary: "bg-gray-50 text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    success:
      "bg-green-50 text-green-600 hover:bg-green-100 focus:ring-green-500",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
    warning:
      "bg-orange-50 text-orange-600 hover:bg-orange-100 focus:ring-orange-500",
    ghost:
      "text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:ring-gray-500",
  };

  const sizes = {
    small: "p-1.5",
    default: "p-2",
    large: "p-3",
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
}

// Form Components
export function AdminFormGroup({
  label,
  description,
  children,
  required,
  error,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        )}
      </div>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function AdminInput({
  className,
  error,
  ...props
}: {
  className?: string;
  error?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm",
        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        error && "border-red-300 focus:ring-red-500",
        className,
      )}
      {...props}
    />
  );
}

export function AdminSelect({
  className,
  error,
  children,
  ...props
}: {
  className?: string;
  error?: boolean;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm",
        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        error && "border-red-300 focus:ring-red-500",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function AdminTextarea({
  className,
  error,
  ...props
}: {
  className?: string;
  error?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm",
        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        "resize-y",
        error && "border-red-300 focus:ring-red-500",
        className,
      )}
      {...props}
    />
  );
}

// Utility Components
export function AdminBadge({
  variant = "default",
  children,
}: {
  variant?: "default" | "success" | "danger" | "warning" | "info";
  children: React.ReactNode;
}) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-orange-100 text-orange-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
      )}
    >
      {children}
    </span>
  );
}

export function AdminAlert({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  children: React.ReactNode;
}) {
  const variants = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-orange-50 border-orange-200 text-orange-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={cn("border rounded-lg p-4", variants[variant])}>
      {title && <h4 className="font-medium mb-2">{title}</h4>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

// Loading and Empty States
export function AdminLoader({
  size = "default",
}: {
  size?: "small" | "default" | "large";
}) {
  const sizes = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-brand-600",
          sizes[size],
        )}
      />
    </div>
  );
}

export function AdminEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && action}
    </div>
  );
}
