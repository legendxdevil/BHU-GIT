"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { Download, FileCode, FileSpreadsheet, FileText, ShieldCheck } from "lucide-react";

export default function ExportsPage() {
  const { toast } = useToast();
  const [exportType, setExportType] = useState("geojson");
  const [ward, setWard] = useState("Ward 12");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      const res = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exportType,
          ward,
          requestedBy: "user_officer_81",
        }),
      });

      const json = await res.json();
      setIsExporting(false);

      if (json.success) {
        toast(
          "success",
          "Export Generated Successfully",
          `Export payload generated. File name: ${json.data.fileName}. Audit log recorded.`
        );
        // Trigger simulated file download
        const blob = new Blob([JSON.stringify(json.data.payload, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = json.data.fileName;
        a.click();
      } else {
        toast("error", "Export Failed", json.error?.message || "Failed to generate export.");
      }
    } catch (err: any) {
      setIsExporting(false);
      toast("error", "Server Error", err.message || "Unable to generate export.");
    }
  };

  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <PageContainer
          title="Data Export & Report Generator"
          description="Generate GeoJSON spatial datasets, CSV records, and PDF Review Summary reports with audit provenance."
        >
          <div className="max-w-2xl space-y-6">
            <Card variant="default" padding="lg" className="space-y-6">
              <div className="border-b border-mist pb-3">
                <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                  <Download className="w-5 h-5 text-sienna" />
                  Configure Export Payload
                </h3>
                <p className="text-xs text-slate mt-0.5">
                  All exported files include current active version numbers, approval metadata, and audit log identifiers.
                </p>
              </div>

              <form onSubmit={handleExportSubmit} className="space-y-4">
                <Select
                  label="Export Format"
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  options={[
                    { label: "GeoJSON Spatial Dataset (.geojson)", value: "geojson" },
                    { label: "CSV Tabular Parcel Ledger (.csv)", value: "csv" },
                    { label: "PDF Review Summary Report (.pdf / summary)", value: "pdf" },
                  ]}
                />

                <Select
                  label="Target Ward Boundary"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  options={[
                    { label: "Ward 12 (Central)", value: "Ward 12" },
                    { label: "Ward 14 (North)", value: "Ward 14" },
                    { label: "Ward 08 (South)", value: "Ward 08" },
                    { label: "All Wards", value: "All Wards" },
                  ]}
                />

                <div className="p-4 bg-fog rounded-2xl border border-mist text-xs text-slate space-y-1">
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security Control Verified
                  </div>
                  <p>
                    Exports are logged in the immutable audit stream. Stale version candidates are automatically filtered out.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  isLoading={isExporting}
                  className="w-full mt-2"
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Generate & Download Export Package
                </Button>
              </form>
            </Card>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
