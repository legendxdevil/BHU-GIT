"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Layers,
  Map,
  GitCompare,
  FileCheck2,
  History,
  FileText,
  Download,
  BookOpen,
  ShieldCheck,
  LogOut,
  Sparkles,
} from "lucide-react";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/lib/auth/auth-context";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role: userRole, logout } = useAuth();

  const userName = user ? user.displayName : "Review Officer A";

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: [USER_ROLES.ADMIN, USER_ROLES.REVIEW_OFFICER, USER_ROLES.FIELD_OFFICER, USER_ROLES.VIEWER] },
    { label: "Data Ingestion", href: "/data-sources", icon: Layers, roles: [USER_ROLES.ADMIN, USER_ROLES.REVIEW_OFFICER, USER_ROLES.FIELD_OFFICER] },
    { label: "Parcel Explorer", href: "/parcels", icon: Map, roles: [USER_ROLES.ADMIN, USER_ROLES.REVIEW_OFFICER, USER_ROLES.FIELD_OFFICER, USER_ROLES.VIEWER] },
    { label: "Conflict Center", href: "/conflicts", icon: GitCompare, roles: [USER_ROLES.ADMIN, USER_ROLES.REVIEW_OFFICER, USER_ROLES.FIELD_OFFICER] },
    { label: "Review Workspace", href: "/review", icon: FileCheck2, roles: [USER_ROLES.ADMIN, USER_ROLES.REVIEW_OFFICER] },
    { label: "Version History", href: "/history", icon: History, roles: [USER_ROLES.ADMIN, USER_ROLES.REVIEW_OFFICER, USER_ROLES.FIELD_OFFICER, USER_ROLES.VIEWER] },
    { label: "Legacy OCR", href: "/documents", icon: FileText, roles: [USER_ROLES.ADMIN, USER_ROLES.REVIEW_OFFICER, USER_ROLES.FIELD_OFFICER] },
    { label: "Reports & Exports", href: "/exports", icon: Download, roles: [USER_ROLES.ADMIN, USER_ROLES.REVIEW_OFFICER, USER_ROLES.FIELD_OFFICER] },
    { label: "Documentation", href: "/docs", icon: BookOpen, roles: [USER_ROLES.ADMIN, USER_ROLES.REVIEW_OFFICER, USER_ROLES.FIELD_OFFICER, USER_ROLES.VIEWER] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-paper border-r border-mist flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-ink text-paper flex items-center justify-center font-bold text-lg shadow-card group-hover:bg-blush group-hover:text-sienna transition-all duration-300">
            <Sparkles className="w-5 h-5 text-blush group-hover:text-sienna" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-ink flex items-center gap-1">
              Bhu-Git
              <span className="text-[10px] font-sans font-semibold bg-blush text-sienna px-2 py-0.5 rounded-pill uppercase tracking-widest">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate font-medium">Urban Land Harmonization</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="mt-8 flex flex-col gap-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-pill text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-ink text-paper font-semibold shadow-sm"
                    : "text-slate hover:text-ink hover:bg-fog"
                )}
              >
                <Icon className={clsx("w-4 h-4", isActive ? "text-blush" : "text-slate")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-mist bg-fog/50">
        <div className="p-3 bg-paper border border-mist rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blush text-sienna font-bold text-xs flex items-center justify-center flex-shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{userName}</p>
              <span className="text-[10px] text-slate capitalize flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {userRole.replace("_", " ")}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-ash hover:text-red-600 p-1.5 rounded-pill hover:bg-fog transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
