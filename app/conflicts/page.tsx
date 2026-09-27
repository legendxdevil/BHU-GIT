"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ConflictTable } from "@/components/conflict/ConflictTable";
import { ConflictCard } from "@/components/conflict/ConflictCard";
import { getConflicts } from "@/lib/firebase/firestore";
import { ParcelConflict } from "@/types/conflict";
import { GitCompare, LayoutGrid, List } from "lucide-react";

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<ParcelConflict[]>([]);
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    async function load() {
      const data = await getConflicts(status);
      let filtered = data;
      if (severity !== "all") {
        filtered = filtered.filter((c) => c.severity === severity);
      }
      setConflicts(filtered);
    }
    load();
  }, [status, severity]);

  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <PageContainer
          title="Conflict Control Center"
          description="Priority queue of flagged geometry, attribute, identifier, and temporal discrepancies."
        >
          <div className="space-y-6">
            {/* Controls Bar */}
            <Card variant="default" padding="sm" className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { label: "Pending Review Queue", value: "pending" },
                    { label: "Resolved Conflicts", value: "resolved" },
                    { label: "All Conflicts", value: "all" },
                  ]}
                  className="w-48"
                />

                <Select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  options={[
                    { label: "All Severities", value: "all" },
                    { label: "High Severity", value: "high" },
                    { label: "Medium Severity", value: "medium" },
                    { label: "Low Severity", value: "low" },
                  ]}
                  className="w-44"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-fog p-1 rounded-pill border border-mist">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-pill text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === "table" ? "bg-ink text-paper shadow-sm" : "text-slate hover:text-ink"
                  }`}
                >
                  <List className="w-3.5 h-3.5" /> Table
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-pill text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === "grid" ? "bg-ink text-paper shadow-sm" : "text-slate hover:text-ink"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Cards
                </button>
              </div>
            </Card>

            {/* View Render */}
            {viewMode === "table" ? (
              <ConflictTable conflicts={conflicts} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {conflicts.map((c) => (
                  <ConflictCard key={c.conflictId} conflict={c} />
                ))}
              </div>
            )}
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
