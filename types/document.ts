export interface ExtractedField {
  label: string;
  key: string;
  extractedValue: string;
  confidence: number;
  verifiedValue?: string;
  isVerified?: boolean;
}

export interface LegacyDocument {
  documentId: string;
  documentTitle: string;
  documentType: "khasra" | "deed" | "tax_receipt" | "survey_sketch" | "other";
  fileUrl?: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: number;
  processingStatus: "queued" | "ocr_processing" | "extracted" | "verified" | "failed";
  rawText?: string;
  ocrConfidence?: number;
  extractedFields: ExtractedField[];
  associatedParcelId?: string | null;
  associatedSurveyNumber?: string | null;
}
