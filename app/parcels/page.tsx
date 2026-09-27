"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ParcelMap } from "@/components/map/ParcelMap";
import { MapLegend } from "@/components/map/MapLegend";
import { getParcels } from "@/lib/firebase/firestore";
import { ParcelRecord } from "@/types/parcel";
import { Map, Search, Eye, ArrowRight, MapPin } from "lucide-react";

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<ParcelRecord[]>([]);
  const [search, setSearch] = useState("");
  const [ward, setWard] = useState("Ward 12");
  const [status, setStatus] = useState("all");
  const [selectedParcel, setSelectedParcel] = useState<ParcelRecord | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getParcels({ ward, status, search });
      setParcels(data);
      if (data.length > 0 && !selectedParcel) {
        setSelectedParcel(data[0]);
      }
    }
    load();
  }, [ward, status, search]);

  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onSearch={setSearch} selectedWard={ward} onSelectWard={setWard} />

        <PageContainer
          title="Parcel Explorer"
          description="Browse, filter, and inspect version-controlled urban land truth records."
        >
          <div className="space-y-6">
            {/* Filter Bar */}
            <Card variant="default" padding="sm" className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Search parcel ID, survey number, or owner name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate" />}
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  options={[
                    { label: "Ward 12 (Central)", value: "Ward 12" },
                    { label: "Ward 14 (North)", value: "Ward 14" },
                    { label: "Ward 08 (South)", value: "Ward 08" },
                    { label: "All Wards", value: "All Wards" },
                  ]}
                  className="w-40"
                />

                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { label: "All Statuses", value: "all" },
                    { label: "Approved Only", value: "approved" },
                    { label: "Pending Review", value: "pending_review" },
                    { label: "Conflict Flagged", value: "conflict" },
                  ]}
                  className="w-40"
                />
              </div>
            </Card>

            {/* Split Screen Map & Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive GIS Map */}
              <div className="lg:col-span-2 space-y-4">
                <Card variant="default" padding="sm" className="space-y-3">
                  <div className="flex items-center justify-between border-b border-mist pb-2">
                    <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2">
                      <Map className="w-4 h-4 text-sienna" />
                      Interactive Ward Land Map
                    </h3>
                    <span className="text-xs text-slate font-medium">GIS Cadastral Layer</span>
                  </div>
                  <ParcelMap
                    parcels={parcels}
                    selectedParcelId={selectedParcel?.parcelId}
                    onSelectParcel={setSelectedParcel}
                    height="h-[550px]"
                  />
                  <MapLegend />
                </Card>
              </div>

              {/* Selected Parcel Detail Sidebar Card */}
              <Card variant="default" padding="md" className="space-y-4 flex flex-col justify-between">
                {selectedParcel ? (
                  <div className="space-y-4">
                    <div className="border-b border-mist pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-ink">
                          Parcel {selectedParcel.parcelNumber}
                        </h3>
                        <p className="text-xs text-slate mt-0.5">{selectedParcel.ward}</p>
                      </div>
                      <Badge status={selectedParcel.status} />
                    </div>

                    <div className="p-3 bg-fog rounded-2xl text-xs space-y-2 border border-mist">
                      <div className="flex justify-between text-slate">
                        <span>Parcel ID:</span>
                        <span className="font-mono font-semibold text-ink">{selectedParcel.parcelId}</span>
                      </div>
                      <div className="flex justify-between text-slate">
                        <span>Survey Number:</span>
                        <span className="font-semibold text-ink">{selectedParcel.attributes.surveyNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate">
                        <span>Owner:</span>
                        <span className="font-semibold text-ink">{selectedParcel.attributes.ownerName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-slate">
                        <span>Land Use:</span>
                        <span className="font-semibold text-ink">{selectedParcel.attributes.landUse || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-slate">
                        <span>Calculated Area:</span>
                        <span className="font-semibold text-sienna font-bold">
                          {selectedParcel.attributes.calculatedAreaSqM} sq.m
                        </span>
                      </div>
                      <div className="flex justify-between text-slate">
                        <span>Active Version:</span>
                        <span className="font-semibold text-ink">{selectedParcel.currentVersionId}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate text-xs">
                    Select a parcel on the map or from the list below to inspect its record details.
                  </div>
                )}

                {selectedParcel && (
                  <Link href={`/parcels/${selectedParcel.parcelId}`}>
                    <Button variant="accent" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Open Full Parcel Profile & Timeline
                    </Button>
                  </Link>
                )}
              </Card>
            </div>

            {/* Parcels Data Table */}
            <div className="overflow-x-auto bg-paper border border-mist rounded-card shadow-card">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-fog border-b border-mist text-slate font-semibold uppercase tracking-wider">
                    <th className="p-4">Parcel ID</th>
                    <th className="p-4">Survey No</th>
                    <th className="p-4">Ward</th>
                    <th className="p-4">Registered Owner</th>
                    <th className="p-4">Land Use</th>
                    <th className="p-4">Area (Sq.M)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist">
                  {parcels.map((p) => (
                    <tr
                      key={p.parcelId}
                      onClick={() => setSelectedParcel(p)}
                      className={`hover:bg-fog/60 transition-colors cursor-pointer ${
                        selectedParcel?.parcelId === p.parcelId ? "bg-blush-light/50" : ""
                      }`}
                    >
                      <td className="p-4 font-mono font-semibold text-ink">{p.parcelId}</td>
                      <td className="p-4 font-serif font-bold text-sm text-ink">{p.parcelNumber}</td>
                      <td className="p-4 text-slate">{p.ward}</td>
                      <td className="p-4 font-medium text-ink">{p.attributes.ownerName || "Unrecorded"}</td>
                      <td className="p-4 text-slate">{p.attributes.landUse || "N/A"}</td>
                      <td className="p-4 font-semibold text-ink">{p.attributes.calculatedAreaSqM} sq.m</td>
                      <td className="p-4">
                        <Badge status={p.status} />
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/parcels/${p.parcelId}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3 h-3" />}>
                            Profile
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
