"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ParcelMap } from "@/components/map/ParcelMap";
import { MapLegend } from "@/components/map/MapLegend";
import { getParcels, getConflicts, getAuditLogs, getSources } from "@/lib/firebase/firestore";
import { ParcelRecord } from "@/types/parcel";
import { ParcelConflict } from "@/types/conflict";
import { AuditLogEntry } from "@/types/audit";
import { SourceRecord } from "@/types/source";
import {
  Map,
  GitCompare,
  CheckCircle2,
  Layers,
  ArrowRight,
  UploadCloud,
  FileText,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const [parcels, setParcels] = useState<ParcelRecord[]>([]);
  const [conflicts, setConflicts] = useState<ParcelConflict[]>([]);
  const [audits, setAudits] = useState<AuditLogEntry[]>([]);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [selectedWard, setSelectedWard] = useState("Ward 12");

  useEffect(() => {
    async function loadData() {
      const p = await getParcels({ ward: selectedWard });
      const c = await getConflicts();
      const a = await getAuditLogs();
      const s = await getSources();
      setParcels(p);
      setConflicts(c);
      setAudits(a);
      setSources(s);
    }
    loadData();
  }, [selectedWard]);

  const pendingCount = conflicts.filter((c) => c.status === "pending").length;
  const approvedCount = parcels.filter((p) => p.status === "approved").length;

  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header selectedWard={selectedWard} onSelectWard={setSelectedWard} />

        <PageContainer
          title="Executive Harmonization Dashboard"
          description="Real-time multi-source geospatial evidence, conflict queue, and version control metrics."
          action={
            <Link href="/data-sources">
              <Button variant="accent" size="sm" leftIcon={<UploadCloud className="w-4 h-4" />}>
                Upload New Dataset
              </Button>
            </Link>
          }
        >
          <div className="space-y-6">
            {/* 5 Core Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card variant="default" padding="sm" className="space-y-1">
                <div className="flex items-center justify-between text-slate text-xs font-semibold uppercase tracking-wider">
                  <span>Total Parcels</span>
                  <Map className="w-4 h-4 text-sienna" />
                </div>
                <div className="font-serif text-3xl font-bold text-ink">12,480</div>
                <div className="text-[11px] text-ash">{parcels.length} Active in {selectedWard}</div>
              </Card>

              <Card variant="default" padding="sm" className="space-y-1">
                <div className="flex items-center justify-between text-slate text-xs font-semibold uppercase tracking-wider">
                  <span>Pending Review</span>
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <div className="font-serif text-3xl font-bold text-amber-600">{pendingCount}</div>
                <div className="text-[11px] text-amber-700/80 font-medium">Requires Officer Decision</div>
              </Card>

              <Card variant="default" padding="sm" className="space-y-1">
                <div className="flex items-center justify-between text-slate text-xs font-semibold uppercase tracking-wider">
                  <span>Active Conflicts</span>
                  <GitCompare className="w-4 h-4 text-rose-600" />
                </div>
                <div className="font-serif text-3xl font-bold text-rose-600">{conflicts.length}</div>
                <div className="text-[11px] text-rose-700/80 font-medium">Geometry & Attribute</div>
              </Card>

              <Card variant="default" padding="sm" className="space-y-1">
                <div className="flex items-center justify-between text-slate text-xs font-semibold uppercase tracking-wider">
                  <span>Reviewed Today</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-serif text-3xl font-bold text-emerald-600">57</div>
                <div className="text-[11px] text-emerald-700/80 font-medium">Committed Versions</div>
              </Card>

              <Card variant="default" padding="sm" className="space-y-1">
                <div className="flex items-center justify-between text-slate text-xs font-semibold uppercase tracking-wider">
                  <span>Processing Jobs</span>
                  <Layers className="w-4 h-4 text-blue-600" />
                </div>
                <div className="font-serif text-3xl font-bold text-blue-600">{sources.length}</div>
                <div className="text-[11px] text-blue-700/80 font-medium">Ingested Sources</div>
              </Card>
            </div>

            {/* Main Interactive Map & Conflict Preview Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card variant="default" padding="sm" className="space-y-3">
                  <div className="flex items-center justify-between border-b border-mist pb-2">
                    <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2">
                      <Map className="w-4 h-4 text-sienna" />
                      Spatial Boundary Harmonization Canvas
                    </h3>
                    <span className="text-xs text-slate font-medium">Interactive Cadastral GIS</span>
                  </div>
                  <ParcelMap parcels={parcels} height="h-[520px]" />
                  <MapLegend />
                </Card>
              </div>

              {/* Conflict Priority Work Queue */}
              <Card variant="default" padding="md" className="space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-mist pb-3 mb-3">
                    <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-sienna" />
                      Priority Conflict Queue
                    </h3>
                    <Link href="/conflicts" className="text-xs text-sienna hover:underline font-semibold">
                      View All
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {conflicts.slice(0, 3).map((c) => (
                      <div key={c.conflictId} className="p-3 bg-fog rounded-2xl border border-mist space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-ink">Parcel {c.parcelNumber}</span>
                          <Badge severity={c.severity} />
                        </div>
                        <p className="text-slate text-[11px] line-clamp-2">
                          {c.proposal.explanationReasons[0]}
                        </p>
                        <Link href={`/review?conflictId=${c.conflictId}`} className="block pt-1">
                          <Button variant="accent" size="sm" className="w-full text-xs py-1" rightIcon={<ArrowRight className="w-3 h-3" />}>
                            Inspect & Review
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href="/conflicts">
                  <Button variant="outline" size="sm" className="w-full">
                    Open Conflict Work Center
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Bottom Row: Ingested Sources & Provenance Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="default" padding="md" className="space-y-3">
                <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2 border-b border-mist pb-3">
                  <Layers className="w-4 h-4 text-sienna" />
                  Active Ingested Data Sources
                </h3>
                <div className="space-y-2">
                  {sources.map((s) => (
                    <div key={s.sourceId} className="flex items-center justify-between p-3 bg-fog rounded-2xl text-xs border border-mist">
                      <div>
                        <div className="font-semibold text-ink">{s.datasetName}</div>
                        <div className="text-[11px] text-slate">
                          Type: {s.sourceType} • Uploaded by {s.uploadedByName}
                        </div>
                      </div>
                      <span className="bg-blush text-sienna px-2.5 py-1 rounded-pill font-bold text-[11px]">
                        Trust Score: {Math.round((s.reliabilityScore || 0.8) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="default" padding="md" className="space-y-3">
                <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2 border-b border-mist pb-3">
                  <FileText className="w-4 h-4 text-sienna" />
                  Audit Provenance Stream
                </h3>
                <div className="space-y-2">
                  {audits.map((a) => (
                    <div key={a.logId} className="p-3 bg-fog rounded-2xl text-xs space-y-1 border border-mist">
                      <div className="flex items-center justify-between font-semibold text-ink">
                        <span>{a.action}</span>
                        <span className="text-[10px] text-ash">
                          {new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-slate text-[11px]">{a.reason}</p>
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
