"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useNotifications } from "@/lib/realtime/notification-context";
import { getDocuments } from "@/lib/firebase/firestore";
import { LegacyDocument } from "@/types/document";
import { FileText, Sparkles, UploadCloud, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DocumentsPage() {
  const { toast } = useToast();
  const { pushNotification } = useNotifications();
  const [documents, setDocuments] = useState<LegacyDocument[]>([]);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<any>("khasra");
  const [parcelId, setParcelId] = useState("P-1003");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getDocuments().then(setDocuments);
  }, []);

  const handleOCRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast("error", "Title Required", "Please enter a document title.");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("title", title);
      formData.append("docType", docType);
      formData.append("parcelId", parcelId);

      const res = await fetch("/api/documents/ocr", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      setIsProcessing(false);

      if (json.success) {
        toast(
          "success",
          "OCR Extraction Complete",
          `Tesseract.js extracted text and fields for [${title}] with ${Math.round((json.data.document.ocrConfidence || 0.9) * 100)}% confidence.`
        );
        pushNotification({
          title: "OCR Document Extracted",
          message: `Legacy record [${title}] processed for Parcel ${parcelId}.`,
          type: "ocr",
          priority: "medium",
          actionUrl: "/documents",
          parcelId,
        });
        setDocuments((prev) => [json.data.document, ...prev]);
        setTitle("");
        setFile(null);
      } else {
        toast("error", "OCR Failed", json.error?.message || "OCR engine error.");
      }
    } catch (err: any) {
      setIsProcessing(false);
      toast("error", "Server Error", err.message || "Failed to process document.");
    }
  };

  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <PageContainer
          title="Legacy Document OCR & Field Extraction"
          description="Transform scanned revenue records, khasras, and title deeds into structured evidence using Tesseract.js."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* OCR Document Scanner Form */}
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="border-b border-mist pb-3">
                <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sienna" />
                  Scan New Revenue Document
                </h3>
                <p className="text-xs text-slate mt-0.5">
                  OCR outputs are stored as evidence items and matched to parcel records.
                </p>
              </div>

              <form onSubmit={handleOCRSubmit} className="space-y-4">
                <Input
                  label="Document Title"
                  placeholder="e.g. Khasra Record Ward 12 - Survey 42/3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <Select
                  label="Document Classification"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  options={[
                    { label: "Khasra / Revenue Record", value: "khasra" },
                    { label: "Registered Title Deed", value: "deed" },
                    { label: "Property Tax Receipt", value: "tax_receipt" },
                    { label: "Field Survey Sketch", value: "survey_sketch" },
                  ]}
                />

                <Select
                  label="Target Parcel Association"
                  value={parcelId}
                  onChange={(e) => setParcelId(e.target.value)}
                  options={[
                    { label: "Parcel P-1003 (Survey 42/3)", value: "P-1003" },
                    { label: "Parcel P-1001 (Survey 42/1)", value: "P-1001" },
                    { label: "Parcel P-1004 (Survey 42/4)", value: "P-1004" },
                  ]}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate">
                    Document Image / Scan
                  </label>
                  <label className="border-2 border-dashed border-mist-dark hover:border-sienna bg-fog hover:bg-blush-light p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all">
                    <UploadCloud className="w-8 h-8 text-sienna mb-2" />
                    <span className="text-xs font-semibold text-ink">
                      {file ? file.name : "Click to select scanned image"}
                    </span>
                    <span className="text-[11px] text-ash mt-1">
                      Formats: .png, .jpg, .jpeg, .webp
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    />
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  isLoading={isProcessing}
                  className="w-full mt-2"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Execute Tesseract.js OCR
                </Button>
              </form>
            </Card>

            {/* Extracted Documents List */}
            <div className="lg:col-span-2 space-y-4">
              <Card variant="default" padding="md" className="space-y-4">
                <div className="flex items-center justify-between border-b border-mist pb-3">
                  <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sienna" />
                    Processed OCR Document Repository
                  </h3>
                  <span className="text-xs text-slate font-medium">{documents.length} Total Documents</span>
                </div>

                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.documentId} className="p-4 bg-fog rounded-2xl border border-mist space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-serif font-bold text-sm text-ink">{doc.documentTitle}</h4>
                          <span className="text-xs text-slate">
                            Associated with Parcel {doc.associatedParcelId} ({doc.associatedSurveyNumber})
                          </span>
                        </div>
                        <Badge status="approved" label={`OCR Conf: ${Math.round((doc.ocrConfidence || 0.9) * 100)}%`} />
                      </div>

                      <div className="p-3 bg-paper rounded-xl border border-mist font-mono text-xs text-slate whitespace-pre-line">
                        {doc.rawText}
                      </div>

                      {/* Extracted Fields */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                        {doc.extractedFields.map((f, idx) => (
                          <div key={idx} className="p-2 bg-paper rounded-lg border border-mist">
                            <span className="text-[10px] text-ash uppercase font-semibold block">{f.label}</span>
                            <span className="font-semibold text-ink">{f.extractedValue}</span>
                          </div>
                        ))}
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
