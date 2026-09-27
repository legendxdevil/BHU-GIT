"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { useNotifications } from "@/lib/realtime/notification-context";
import { SOURCE_TYPES } from "@/lib/constants";
import { getSources } from "@/lib/firebase/firestore";
import { SourceRecord } from "@/types/source";
import { UploadCloud, CheckCircle2, FileCode, Layers, ShieldCheck } from "lucide-react";

export default function DataSourcesPage() {
  const { toast } = useToast();
  const { pushNotification } = useNotifications();
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [datasetName, setDatasetName] = useState("");
  const [sourceType, setSourceType] = useState<string>(SOURCE_TYPES.GNSS_SURVEY);
  const [captureDate, setCaptureDate] = useState("2026-09-01");
  const [ward, setWard] = useState("Ward 12");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    getSources().then(setSources);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName) {
      toast("error", "Dataset Name Required", "Please specify a descriptive name for this dataset.");
      return;
    }
    if (!file) {
      toast("error", "File Required", "Please select a GeoJSON, CSV, or Shapefile-derived JSON file.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("datasetName", datasetName);
      formData.append("sourceType", sourceType);
      formData.append("captureDate", captureDate);
      formData.append("coverageWard", ward);
      formData.append("uploadedBy", "officer_101");
      formData.append("uploadedByName", "Field Officer A");

      const res = await fetch("/api/sources/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      setIsUploading(false);

      if (json.success) {
        toast(
          "success",
          "Dataset Ingested & Standardized",
          `Source [${datasetName}] uploaded. Matched candidate parcels and evaluated spatial conflicts.`
        );
        pushNotification({
          title: "New Dataset Ingested",
          message: `Evidence layer [${datasetName}] ingested for ${ward}. Spatial matching executed.`,
          type: "evidence",
          priority: "high",
          actionUrl: "/data-sources",
        });
        setSources((prev) => [json.data.source, ...prev]);
        setDatasetName("");
        setFile(null);
      } else {
        toast("error", "Upload Failed", json.error?.message || "File validation failed.");
      }
    } catch (err: any) {
      setIsUploading(false);
      toast("error", "Server Error", err.message || "Unable to upload source.");
    }
  };

  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <PageContainer
          title="Heterogeneous Data Ingestion"
          description="Upload, validate, and standardize multi-source survey points, orthophotos, and revenue records."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Form Panel */}
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="border-b border-mist pb-3">
                <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-sienna" />
                  Ingest New Evidence Source
                </h3>
                <p className="text-xs text-slate mt-0.5">
                  Input datasets are standardized and matched to existing parcel version histories.
                </p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <Input
                  label="Dataset Title"
                  placeholder="e.g. Ward_12_CORS_GNSS_Survey_2026"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  required
                />

                <Select
                  label="Evidence Source Type"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  options={[
                    { label: "GNSS / CORS Ground Survey", value: SOURCE_TYPES.GNSS_SURVEY },
                    { label: "Drone Orthophoto / Imagery", value: SOURCE_TYPES.DRONE_ORTHOPHOTO },
                    { label: "Revenue Department Cadastral Map", value: SOURCE_TYPES.CADASTRAIL_MAP },
                    { label: "Municipal Property Tax GIS", value: SOURCE_TYPES.MUNICIPAL_GIS },
                    { label: "Scanned Legacy Document", value: SOURCE_TYPES.LEGACY_SCAN },
                  ]}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Capture Date"
                    type="date"
                    value={captureDate}
                    onChange={(e) => setCaptureDate(e.target.value)}
                  />

                  <Select
                    label="Target Ward"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    options={[
                      { label: "Ward 12", value: "Ward 12" },
                      { label: "Ward 14", value: "Ward 14" },
                      { label: "Ward 08", value: "Ward 08" },
                    ]}
                  />
                </div>

                {/* File Select Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate">
                    Source File (GeoJSON / CSV / JSON)
                  </label>
                  <label className="border-2 border-dashed border-mist-dark hover:border-sienna bg-fog hover:bg-blush-light p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all">
                    <FileCode className="w-8 h-8 text-sienna mb-2" />
                    <span className="text-xs font-semibold text-ink">
                      {file ? file.name : "Click to select file or drop here"}
                    </span>
                    <span className="text-[11px] text-ash mt-1">
                      Max file size: 20MB (.geojson, .csv, .json)
                    </span>
                    <input
                      type="file"
                      accept=".geojson,.csv,.json,.png,.jpg"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  isLoading={isUploading}
                  className="w-full mt-2"
                >
                  Upload & Execute Matching Engine
                </Button>
              </form>
            </Card>

            {/* Ingested Sources History Table */}
            <div className="lg:col-span-2 space-y-4">
              <Card variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between border-b border-mist pb-3">
                  <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                    <Layers className="w-5 h-5 text-sienna" />
                    Ingested Datasets & Reliability Factors
                  </h3>
                  <span className="text-xs text-slate font-medium">{sources.length} Total Sources</span>
                </div>

                <div className="space-y-3">
                  {sources.map((s) => (
                    <div
                      key={s.sourceId}
                      className="p-4 bg-fog rounded-2xl border border-mist flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-ink">{s.datasetName}</span>
                          <span className="bg-paper px-2 py-0.5 rounded-pill border border-mist text-[10px] uppercase font-semibold text-slate">
                            {s.sourceType}
                          </span>
                        </div>
                        <p className="text-xs text-slate">
                          File: {s.originalFileName} • Uploaded by {s.uploadedByName} on{" "}
                          {new Date(s.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-ash uppercase font-semibold block">
                            Historical Trust Factor
                          </span>
                          <span className="text-sm font-bold text-sienna">
                            {Math.round((s.reliabilityScore || 0.8) * 100)}%
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
