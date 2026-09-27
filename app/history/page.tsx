"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { VersionTimeline } from "@/components/parcel/VersionTimeline";
import { ParcelMap } from "@/components/map/ParcelMap";
import { getParcels, getParcelVersions } from "@/lib/firebase/firestore";
import { ParcelRecord } from "@/types/parcel";
import { ParcelVersion } from "@/types/version";
import { History, Clock, GitBranch } from "lucide-react";

export default function HistoryPage() {
  const [parcels, setParcels] = useState<ParcelRecord[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string>("P-1003");
  const [versions, setVersions] = useState<ParcelVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ParcelVersion | null>(null);

  useEffect(() => {
    getParcels().then((data) => {
      setParcels(data);
    });
  }, []);

  useEffect(() => {
    if (selectedParcelId) {
      getParcelVersions(selectedParcelId).then((v) => {
        setVersions(v);
        if (v.length > 0) setSelectedVersion(v[0]);
      });
    }
  }, [selectedParcelId]);

  const activeParcel = parcels.find((p) => p.parcelId === selectedParcelId);

  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <PageContainer
          title="Parcel Version Control & Time Travel"
          description="Traverse complete immutable land truth histories ($V_1 \\rightarrow V_2 \\rightarrow V_3 \\rightarrow V_4$) with decision provenance."
        >
          <div className="space-y-6">
            {/* Parcel Selector Bar */}
            <Card variant="default" padding="sm" className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-sienna" /> Select Parcel Lineage:
              </span>
              <Select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                options={parcels.map((p) => ({
                  label: `Parcel ${p.parcelNumber} (${p.parcelId} - ${p.ward})`,
                  value: p.parcelId,
                }))}
                className="max-w-md"
              />
            </Card>

            {/* Split Screen Map & Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card variant="default" padding="none" className="h-[480px] relative overflow-hidden">
                  {activeParcel && (
                    <ParcelMap
                      parcels={[
                        {
                          ...activeParcel,
                          currentGeoJSON: selectedVersion ? selectedVersion.geometry : activeParcel.currentGeoJSON,
                        },
                      ]}
                      selectedParcelId={selectedParcelId}
                    />
                  )}
                </Card>

                {selectedVersion && (
                  <Card variant="default" padding="md" className="space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-mist pb-2">
                      <span className="font-serif font-bold text-sm text-ink">
                        Active Time-Travel View: Version {selectedVersion.versionId}
                      </span>
                      <span className="text-slate font-medium">
                        Committed on {new Date(selectedVersion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-slate pt-1">
                      <div>
                        <span className="text-[10px] text-ash uppercase font-semibold block">Decision Reason</span>
                        <span className="font-semibold text-ink">{selectedVersion.reason}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-ash uppercase font-semibold block">Authorized Officer</span>
                        <span className="font-semibold text-sienna">{selectedVersion.reviewerName}</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Timeline Tree */}
              <div>
                <VersionTimeline
                  versions={versions}
                  selectedVersionId={selectedVersion?.versionId}
                  onSelectVersion={setSelectedVersion}
                />
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
