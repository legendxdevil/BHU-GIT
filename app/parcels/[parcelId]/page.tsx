"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ParcelHeader } from "@/components/parcel/ParcelHeader";
import { ParcelSummary } from "@/components/parcel/ParcelSummary";
import { VersionTimeline } from "@/components/parcel/VersionTimeline";
import { ParcelMap } from "@/components/map/ParcelMap";
import { getParcelById, getParcelVersions, getDocuments } from "@/lib/firebase/firestore";
import { ParcelRecord } from "@/types/parcel";
import { ParcelVersion } from "@/types/version";
import { LegacyDocument } from "@/types/document";
import { ArrowLeft, FileText, GitCompare, History, ShieldCheck } from "lucide-react";

export default function ParcelDetailPage() {
  const params = useParams();
  const parcelId = params.parcelId as string;

  const [parcel, setParcel] = useState<ParcelRecord | null>(null);
  const [versions, setVersions] = useState<ParcelVersion[]>([]);
  const [documents, setDocuments] = useState<LegacyDocument[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ParcelVersion | null>(null);

  useEffect(() => {
    async function load() {
      if (parcelId) {
        const p = await getParcelById(parcelId);
        const v = await getParcelVersions(parcelId);
        const d = await getDocuments();
        setParcel(p);
        setVersions(v);
        setDocuments(d.filter((doc) => doc.associatedParcelId === parcelId));
        if (v.length > 0) setSelectedVersion(v[0]);
      }
    }
    load();
  }, [parcelId]);

  if (!parcel) {
    return (
      <div className="flex min-h-screen bg-fog">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <PageContainer title="Parcel Record">
            <div className="p-12 text-center text-slate">Loading parcel record details...</div>
          </PageContainer>
        </div>
      </div>
    );
  }

  const activeGeo = selectedVersion ? selectedVersion.geometry : parcel.currentGeoJSON;

  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <PageContainer
          title={`Parcel Profile ${parcel.parcelNumber}`}
          description={`Full provenance, attribute ledger, and version history for ${parcel.parcelId}.`}
          action={
            <div className="flex items-center gap-3">
              <Link href="/parcels">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Explorer
                </Button>
              </Link>
              {parcel.activeConflictId && (
                <Link href={`/review?conflictId=${parcel.activeConflictId}`}>
                  <Button variant="accent" size="sm" leftIcon={<GitCompare className="w-4 h-4" />}>
                    Open Conflict Review Workspace
                  </Button>
                </Link>
              )}
            </div>
          }
        >
          <div className="space-y-6">
            <ParcelHeader parcel={parcel} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Spatial Geometry Map & Attributes */}
              <div className="lg:col-span-2 space-y-6">
                <Card variant="default" padding="none" className="h-[420px] relative overflow-hidden">
                  <ParcelMap parcels={[parcel]} selectedParcelId={parcel.parcelId} />
                </Card>

                <ParcelSummary parcel={parcel} />

                {/* Associated Scanned Legacy Documents */}
                <Card variant="default" padding="md" className="space-y-3">
                  <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2 border-b border-mist pb-3">
                    <FileText className="w-5 h-5 text-sienna" />
                    Associated Legacy OCR Evidence Documents
                  </h3>
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.documentId} className="p-4 bg-fog rounded-2xl border border-mist space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-sm text-ink">{doc.documentTitle}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-pill">
                              OCR Conf: {Math.round((doc.ocrConfidence || 0.9) * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-slate font-mono whitespace-pre-line bg-paper p-3 rounded-xl border border-mist">
                            {doc.rawText}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate">No legacy documents currently linked to this parcel.</p>
                  )}
                </Card>
              </div>

              {/* Right Column: Version Timeline & Time Travel */}
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
