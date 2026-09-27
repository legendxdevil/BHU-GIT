"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { BookOpen, ShieldCheck, GitCompare, History, Sparkles } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <PageContainer
          title="Bhu-Git Platform Documentation"
          description="System architecture, domain methodology, conflict logic, and security rules."
        >
          <div className="max-w-4xl space-y-6">
            <Card variant="default" padding="lg" className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-sienna" />
                1. Core Concept — "Land Truth as Version History"
              </h2>
              <p className="text-sm text-slate leading-relaxed">
                Traditional GIS platforms overwrite existing parcel records when new survey datasets arrive.
                <strong>Bhu-Git</strong> treats incoming drone orthophotos, GNSS surveys, municipal tax GIS records, and scanned legacy khasras as <em>evidence</em>. The current official land record (V_n) is never blindly overwritten. Instead, Bhu-Git standardizes evidence, matches parcel candidates, calculates spatial/attribute discrepancies, scores evidence trust, generates an explainable harmonization proposal, and requires human reviewer authorization to commit a new version (V_n+1).
              </p>
            </Card>

            <Card variant="default" padding="lg" className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                <GitCompare className="w-6 h-6 text-sienna" />
                2. Multi-Dimensional Conflict Engine
              </h2>
              <div className="space-y-2 text-sm text-slate">
                <p>Bhu-Git checks four conflict dimensions simultaneously:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Geometry Conflict:</strong> Evaluates perimeter edge displacement (meters), polygon area delta (sq.m), and shape overlap ratio using Turf.js.</li>
                  <li><strong>Attribute Conflict:</strong> Detects mismatches in registered owner, land use classification, or deed area.</li>
                  <li><strong>Identifier Conflict:</strong> Identifies overlapping geometries registered under conflicting survey numbers.</li>
                  <li><strong>Temporal Conflict:</strong> Evaluates capture dates across legacy paper cadastrals and high-resolution drone orthophotos.</li>
                </ul>
              </div>
            </Card>

            <Card variant="default" padding="lg" className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-sienna" />
                3. Security & Concurrency Controls
              </h2>
              <p className="text-sm text-slate leading-relaxed">
                Role-based access control (RBAC) is strictly enforced server-side. Version commits require parent pointer verification (optimistic concurrency: <code>parentVersionId === currentVersionId</code>) to prevent concurrent reviewer overwrites. Active review sessions are locked via Firebase Realtime Database presence tracking.
              </p>
            </Card>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
