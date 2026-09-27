"use client";

import React, { useState } from "react";
import { Search, MapPin, RefreshCw, UserCheck } from "lucide-react";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { useAuth } from "@/lib/auth/auth-context";
import { NotificationCenter } from "../notifications/NotificationCenter";

interface HeaderProps {
  onSearch?: (query: string) => void;
  selectedWard?: string;
  onSelectWard?: (ward: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  selectedWard = "Ward 12",
  onSelectWard,
}) => {
  const [query, setQuery] = useState("");
  const { role } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="h-16 border-b border-mist bg-paper/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="w-80">
        <Input
          placeholder="Search parcel, survey no, or owner..."
          value={query}
          onChange={handleSearchChange}
          leftIcon={<Search className="w-4 h-4 text-slate" />}
          className="py-1.5 text-xs bg-fog border-none focus:bg-paper"
        />
      </div>

      {/* Right Tools & Context */}
      <div className="flex items-center gap-4">
        {/* Active Role Persona Badge */}
        <div className="flex items-center gap-1.5 bg-blush-light text-sienna px-3 py-1 rounded-pill border border-blush/60 text-xs font-semibold">
          <UserCheck className="w-3.5 h-3.5 text-sienna" />
          <span>Role: {role.replace("_", " ").toUpperCase()}</span>
        </div>

        {/* Ward Selector */}
        <div className="flex items-center gap-1.5 bg-fog px-3 py-1.5 rounded-pill border border-mist text-xs text-slate font-medium">
          <MapPin className="w-3.5 h-3.5 text-sienna" />
          <span>Active Ward:</span>
          <select
            value={selectedWard}
            onChange={(e) => onSelectWard && onSelectWard(e.target.value)}
            className="bg-transparent text-ink font-semibold focus:outline-none cursor-pointer"
          >
            <option value="Ward 12">Ward 12 (Central)</option>
            <option value="Ward 14">Ward 14 (North)</option>
            <option value="Ward 08">Ward 08 (South)</option>
          </select>
        </div>

        {/* Environment Mode Badge */}
        <Badge status="info" label={process.env.NEXT_PUBLIC_APP_ENV || "development"} icon={false} className="text-[10px] py-0.5 uppercase tracking-wider font-semibold" />

        {/* Sync Status Button */}
        <button
          title="Data Stream Active"
          className="text-slate hover:text-ink p-2 rounded-pill hover:bg-fog transition-colors relative"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* Realtime Notification Center */}
        <NotificationCenter />
      </div>
    </header>
  );
};
