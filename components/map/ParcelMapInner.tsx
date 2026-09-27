"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ParcelRecord, GeoJSONPolygon } from "@/types/parcel";
import { Badge } from "../ui/Badge";
import {
  Layers,
  Eye,
  Ruler,
  AlertTriangle,
  Search,
  ExternalLink,
  Info,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

// Leaflet default icon fix
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Available Basemap Tiles
const BASEMAP_TILES = {
  street: {
    name: "Street Map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    name: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri World Imagery",
  },
  positron: {
    name: "Sleek Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; CartoDB Positron",
  },
  topo: {
    name: "Topographic",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenTopoMap",
  },
};

interface ParcelMapInnerProps {
  parcels?: ParcelRecord[];
  selectedParcelId?: string | null;
  onSelectParcel?: (parcel: ParcelRecord) => void;
  incomingGeometry?: GeoJSONPolygon | null;
  proposedGeometry?: GeoJSONPolygon | null;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showTools?: boolean;
}

// Map Controller for smooth fly-to animation
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Click listener component for measurement tool
function MeasureClickListener({
  isMeasuring,
  onAddPoint,
}: {
  isMeasuring: boolean;
  onAddPoint: (latlng: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      if (isMeasuring) {
        onAddPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

// Helper to compute polygon center for label placement
function getPolygonCenter(coords: [number, number][]): [number, number] {
  let latSum = 0;
  let lngSum = 0;
  coords.forEach(([lat, lng]) => {
    latSum += lat;
    lngSum += lng;
  });
  return [latSum / coords.length, lngSum / coords.length];
}

// Distance & Area Calculation Helpers
function calculateDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const R = 6371e3;
  const φ1 = (p1[0] * Math.PI) / 180;
  const φ2 = (p2[0] * Math.PI) / 180;
  const Δφ = ((p2[0] - p1[0]) * Math.PI) / 180;
  const Δλ = ((p2[1] - p1[1]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateMeasurePolygonArea(points: [number, number][]): number {
  if (points.length < 3) return 0;
  let area = 0;
  const numPoints = points.length;
  for (let i = 0; i < numPoints; i++) {
    const j = (i + 1) % numPoints;
    const p1 = points[i];
    const p2 = points[j];

    const x1 = (p1[1] * Math.PI * 6378137) / 180;
    const y1 = Math.log(Math.tan(((90 + p1[0]) * Math.PI) / 360)) * 6378137;
    const x2 = (p2[1] * Math.PI * 6378137) / 180;
    const y2 = Math.log(Math.tan(((90 + p2[0]) * Math.PI) / 360)) * 6378137;

    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2.0);
}

export const ParcelMapInner: React.FC<ParcelMapInnerProps> = ({
  parcels = [],
  selectedParcelId,
  onSelectParcel,
  incomingGeometry,
  proposedGeometry,
  center = [28.6022, 77.2022],
  zoom = 16,
  height = "h-[600px]",
  showTools = true,
}) => {
  const [basemapKey, setBasemapKey] = useState<keyof typeof BASEMAP_TILES>("street");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "conflict" | "pending_review">("all");
  const [showLabels, setShowLabels] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showSurveyPoints, setShowSurveyPoints] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState<number>(zoom);

  // Measurement State
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // Active Inspector Modal State
  const [inspectedParcel, setInspectedParcel] = useState<ParcelRecord | null>(null);

  // Synchronize incoming selected parcel
  useEffect(() => {
    if (selectedParcelId) {
      const found = parcels.find((p) => p.parcelId === selectedParcelId);
      if (found) {
        setInspectedParcel(found);
        const coords = found.currentGeoJSON.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
        const centerPt = getPolygonCenter(coords);
        setMapCenter(centerPt);
        setMapZoom(18);
      }
    }
  }, [selectedParcelId, parcels]);

  // Filter parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = p.parcelNumber.toLowerCase();
        const owner = (p.attributes.ownerName || "").toLowerCase();
        const addr = (p.attributes.address || "").toLowerCase();
        return num.includes(q) || owner.includes(q) || addr.includes(q);
      }
      return true;
    });
  }, [parcels, statusFilter, searchQuery]);

  const handleSelectParcelItem = (parcel: ParcelRecord) => {
    setInspectedParcel(parcel);
    if (onSelectParcel) onSelectParcel(parcel);

    const coords = parcel.currentGeoJSON.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
    const centerPt = getPolygonCenter(coords);
    setMapCenter(centerPt);
    setMapZoom(18);
  };

  // Add Point for Measurement
  const handleAddMeasurePoint = (pt: [number, number]) => {
    setMeasurePoints((prev) => [...prev, pt]);
  };

  // Calculate measurement metrics
  const measureDistanceMeters = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < measurePoints.length - 1; i++) {
      dist += calculateDistanceMeters(measurePoints[i], measurePoints[i + 1]);
    }
    return dist;
  }, [measurePoints]);

  const measureAreaSqM = useMemo(() => {
    return calculateMeasurePolygonArea(measurePoints);
  }, [measurePoints]);

  const activeBasemap = BASEMAP_TILES[basemapKey];

  return (
    <div className="w-full space-y-3">
      {/* Clean Toolbar Bar OUTSIDE the Map (Above Map Canvas) */}
      {showTools && (
        <div className="bg-paper p-3 rounded-card border border-mist shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Fly-To Search Input */}
          <div className="flex items-center gap-2 bg-fog px-3 py-1.5 rounded-pill border border-mist w-full sm:w-72">
            <Search className="w-4 h-4 text-sienna shrink-0" />
            <input
              type="text"
              placeholder="Fly to survey no. or owner (e.g. 42/3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-ink placeholder:text-slate focus:outline-none w-full font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate hover:text-ink font-bold">
                ✕
              </button>
            )}
          </div>

          {/* Middle: Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate uppercase tracking-wider mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter("all")}
              className={clsx(
                "px-2.5 py-1 rounded-pill font-semibold transition-all text-[11px]",
                statusFilter === "all" ? "bg-ink text-paper" : "bg-fog text-slate hover:text-ink"
              )}
            >
              All ({parcels.length})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={clsx(
                "px-2.5 py-1 rounded-pill font-semibold transition-all text-[11px] flex items-center gap-1",
                statusFilter === "approved" ? "bg-emerald-600 text-paper" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Approved
            </button>
            <button
              onClick={() => setStatusFilter("conflict")}
              className={clsx(
                "px-2.5 py-1 rounded-pill font-semibold transition-all text-[11px] flex items-center gap-1",
                statusFilter === "conflict" ? "bg-rose-600 text-paper" : "bg-rose-50 text-rose-700 border border-rose-200"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Conflicts
            </button>
            <button
              onClick={() => setStatusFilter("pending_review")}
              className={clsx(
                "px-2.5 py-1 rounded-pill font-semibold transition-all text-[11px] flex items-center gap-1",
                statusFilter === "pending_review" ? "bg-amber-600 text-paper" : "bg-amber-50 text-amber-700 border border-amber-200"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Pending
            </button>
          </div>

          {/* Right: Basemap Selector & Measurement Tool */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Basemap Mode Selector Dropdown */}
            <div className="flex items-center gap-1 bg-fog px-2.5 py-1 rounded-pill border border-mist text-[11px]">
              <Layers className="w-3.5 h-3.5 text-sienna" />
              <select
                value={basemapKey}
                onChange={(e) => setBasemapKey(e.target.value as any)}
                className="bg-transparent font-semibold text-ink focus:outline-none cursor-pointer"
              >
                {(Object.keys(BASEMAP_TILES) as Array<keyof typeof BASEMAP_TILES>).map((k) => (
                  <option key={k} value={k}>
                    {BASEMAP_TILES[k].name}
                  </option>
                ))}
              </select>
            </div>

            {/* Layer Toggles Compact Dropdown */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate px-2">
              <label className="flex items-center gap-1 cursor-pointer hover:text-ink">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="accent-sienna rounded cursor-pointer"
                />
                <span>Labels</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-ink">
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={(e) => setShowHotspots(e.target.checked)}
                  className="accent-sienna rounded cursor-pointer"
                />
                <span>Hotspots</span>
              </label>
            </div>

            {/* Measure Tool Button */}
            <button
              onClick={() => {
                setIsMeasuring(!isMeasuring);
                if (isMeasuring) setMeasurePoints([]);
              }}
              className={clsx(
                "px-3 py-1 rounded-pill font-semibold text-xs flex items-center gap-1.5 transition-all border",
                isMeasuring
                  ? "bg-rose-600 text-paper border-rose-700 ring-2 ring-rose-300"
                  : "bg-paper text-sienna border-sienna/40 hover:bg-blush-light"
              )}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>{isMeasuring ? "Stop Measuring" : "Ruler Tool"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Measurement Tool Active Banner Overlay */}
      {isMeasuring && (
        <div className="bg-ink text-paper p-3 rounded-2xl shadow-md border border-slate/30 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-blush flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-blush" />
              Measurement Mode Active:
            </span>
            <span className="text-slate-300">Click points on map.</span>
            {measurePoints.length > 0 && (
              <span className="font-semibold text-emerald-400">
                Points: {measurePoints.length} • Length:{" "}
                {measureDistanceMeters > 1000
                  ? `${(measureDistanceMeters / 1000).toFixed(2)} km`
                  : `${Math.round(measureDistanceMeters)} m`}
                {measurePoints.length >= 3 && (
                  <span className="text-sienna-light ml-2">
                    • Area: {Math.round(measureAreaSqM).toLocaleString()} m² ({(measureAreaSqM * 0.000247105).toFixed(3)} acres)
                  </span>
                )}
              </span>
            )}
          </div>
          <button
            onClick={() => setMeasurePoints([])}
            className="text-xs text-ash hover:text-paper font-semibold underline ml-4"
          >
            Clear Points
          </button>
        </div>
      )}

      {/* 100% Unobscured Leaflet Map Canvas */}
      <div className={clsx("w-full relative rounded-card overflow-hidden border border-mist shadow-editorial", height)}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer attribution={activeBasemap.attribution} url={activeBasemap.url} />
          <MapViewController center={mapCenter} zoom={mapZoom} />
          <MeasureClickListener isMeasuring={isMeasuring} onAddPoint={handleAddMeasurePoint} />

          {/* Cadastral Parcels Layer */}
          {filteredParcels.map((parcel) => {
            const coords = parcel.currentGeoJSON.coordinates[0].map(
              ([lng, lat]) => [lat, lng] as [number, number]
            );
            const polygonCenter = getPolygonCenter(coords);
            const isSelected = parcel.parcelId === selectedParcelId || inspectedParcel?.parcelId === parcel.parcelId;

            let strokeColor = "#10b981"; // Approved Green
            let fillColor = "#10b981";

            if (parcel.status === "pending_review") {
              strokeColor = "#f59e0b"; // Pending Amber
              fillColor = "#f59e0b";
            } else if (parcel.status === "conflict") {
              strokeColor = "#ef4444"; // Conflict Red
              fillColor = "#ef4444";
            }

            return (
              <React.Fragment key={parcel.parcelId}>
                <Polygon
                  positions={coords}
                  pathOptions={{
                    color: isSelected ? "#17191c" : strokeColor,
                    weight: isSelected ? 3.5 : 2,
                    fillColor,
                    fillOpacity: isSelected ? 0.55 : 0.28,
                    dashArray: isSelected ? "4, 4" : undefined,
                  }}
                  eventHandlers={{
                    click: () => handleSelectParcelItem(parcel),
                  }}
                >
                  {/* Parcel Label Tooltip on Map */}
                  {showLabels && (
                    <Tooltip permanent direction="center" className="bg-paper/90 font-serif font-bold text-[10px] text-ink px-1.5 py-0.5 rounded shadow border border-mist">
                      {parcel.parcelNumber} ({parcel.attributes.ownerName?.split(" ")[0]})
                    </Tooltip>
                  )}

                  {/* Interactive Click Popup */}
                  <Popup className="rounded-card overflow-hidden">
                    <div className="space-y-2 p-1 text-xs w-52">
                      <div className="font-serif font-bold text-sm text-ink flex items-center justify-between border-b border-mist pb-1">
                        <span>Parcel {parcel.parcelNumber}</span>
                        <Badge status={parcel.status} />
                      </div>
                      <div className="space-y-1 text-slate text-[11px]">
                        <p>
                          <span className="font-semibold text-ink">Owner:</span> {parcel.attributes.ownerName || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold text-ink">Land Use:</span> {parcel.attributes.landUse || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold text-ink">Calculated Area:</span> {parcel.attributes.calculatedAreaSqM} m²
                        </p>
                        <p>
                          <span className="font-semibold text-ink">Deed Area:</span> {parcel.attributes.deedAreaSqM} m²
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectParcelItem(parcel)}
                        className="w-full bg-sienna text-paper py-1.5 rounded-pill font-semibold text-xs hover:bg-sienna-dark transition-colors flex items-center justify-center gap-1 mt-1"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Inspect Land Record</span>
                      </button>
                    </div>
                  </Popup>
                </Polygon>

                {/* Overlap Hotspot Pulsing Highlight for Conflicts */}
                {showHotspots && parcel.status === "conflict" && (
                  <CircleMarker
                    center={polygonCenter}
                    radius={14}
                    pathOptions={{
                      color: "#ef4444",
                      fillColor: "#f43f5e",
                      fillOpacity: 0.4,
                      weight: 2,
                    }}
                  >
                    <Tooltip direction="top" className="bg-rose-600 text-paper font-bold text-[10px] px-2 py-0.5 rounded">
                      ⚠️ Conflict Zone ({parcel.parcelNumber})
                    </Tooltip>
                  </CircleMarker>
                )}

                {/* High-Precision GNSS Ground Survey Point Markers */}
                {showSurveyPoints && (
                  <CircleMarker
                    center={coords[0]}
                    radius={4}
                    pathOptions={{
                      color: "#5d2a1a",
                      fillColor: "#fbe1d1",
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                  >
                    <Tooltip direction="bottom" className="text-[9px] font-mono">
                      GNSS Pin #{parcel.parcelNumber}-P1
                    </Tooltip>
                  </CircleMarker>
                )}
              </React.Fragment>
            );
          })}

          {/* Measurement Tool Line & Points Rendering */}
          {measurePoints.length > 0 && (
            <>
              <Polyline positions={measurePoints} pathOptions={{ color: "#ef4444", weight: 3, dashArray: "5, 5" }} />
              {measurePoints.length >= 3 && (
                <Polygon positions={measurePoints} pathOptions={{ color: "#f43f5e", fillColor: "#f43f5e", fillOpacity: 0.25 }} />
              )}
              {measurePoints.map((pt, idx) => (
                <CircleMarker
                  key={idx}
                  center={pt}
                  radius={6}
                  pathOptions={{ color: "#ffffff", fillColor: "#ef4444", fillOpacity: 1, weight: 2 }}
                >
                  <Tooltip permanent direction="top" className="bg-ink text-paper text-[9px] font-mono px-1">
                    P{idx + 1}
                  </Tooltip>
                </CircleMarker>
              ))}
            </>
          )}

          {/* Incoming Comparison Overlay */}
          {incomingGeometry && incomingGeometry.coordinates[0] && (
            <Polygon
              positions={incomingGeometry.coordinates[0].map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: "#2563eb",
                weight: 2.5,
                dashArray: "6, 6",
                fillColor: "#3b82f6",
                fillOpacity: 0.25,
              }}
            />
          )}

          {/* Proposed Harmonized Overlay */}
          {proposedGeometry && proposedGeometry.coordinates[0] && (
            <Polygon
              positions={proposedGeometry.coordinates[0].map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: "#5d2a1a",
                weight: 3.5,
                fillColor: "#fbe1d1",
                fillOpacity: 0.4,
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Parcel Details Inspector Drawer (Positioned Below Map cleanly when clicked) */}
      {inspectedParcel && (
        <div className="bg-paper border border-mist rounded-2xl p-4 shadow-editorial space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between border-b border-mist pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-base text-ink">
                  Parcel {inspectedParcel.parcelNumber}
                </h4>
                <Badge status={inspectedParcel.status} />
              </div>
              <p className="text-xs text-slate">{inspectedParcel.attributes.address}</p>
            </div>
            <button
              onClick={() => setInspectedParcel(null)}
              className="text-slate hover:text-ink font-bold text-sm p-1 rounded-lg hover:bg-fog"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-fog rounded-xl border border-mist">
              <span className="text-[10px] text-ash uppercase font-semibold block">Owner Name</span>
              <span className="font-bold text-ink">{inspectedParcel.attributes.ownerName || "Unrecorded"}</span>
            </div>
            <div className="p-2.5 bg-fog rounded-xl border border-mist">
              <span className="text-[10px] text-ash uppercase font-semibold block">Land Use</span>
              <span className="font-bold text-sienna">{inspectedParcel.attributes.landUse}</span>
            </div>
            <div className="p-2.5 bg-fog rounded-xl border border-mist">
              <span className="text-[10px] text-ash uppercase font-semibold block">Deed Registered Area</span>
              <span className="font-bold text-ink">{inspectedParcel.attributes.deedAreaSqM} m²</span>
            </div>
            <div className="p-2.5 bg-fog rounded-xl border border-mist">
              <span className="text-[10px] text-ash uppercase font-semibold block">Calculated GIS Area</span>
              <span className="font-bold text-emerald-700">{inspectedParcel.attributes.calculatedAreaSqM} m²</span>
            </div>
          </div>

          {/* Conflict Warning callout if conflict exists */}
          {inspectedParcel.status === "conflict" && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-rose-800 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Active Boundary Overlap Conflict Detected</span>
              </div>
              <Link
                href={`/conflicts`}
                className="text-rose-700 font-bold hover:underline flex items-center gap-0.5 text-[11px]"
              >
                <span>Resolve Conflict</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <Link
              href={`/parcels/${inspectedParcel.parcelId}`}
              className="bg-ink text-paper px-4 py-2 rounded-pill font-semibold text-xs hover:bg-slate transition-colors text-center"
            >
              Full Master Record
            </Link>
            <Link
              href={`/history`}
              className="bg-blush-light text-sienna border border-sienna/30 px-4 py-2 rounded-pill font-semibold text-xs hover:bg-blush transition-colors text-center"
            >
              Version Timeline
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
