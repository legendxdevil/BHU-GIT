import { ReviewSession } from "@/types/review";

export interface ProcessingJobState {
  jobId: string;
  sourceId: string;
  stage: "UPLOADED" | "VALIDATING" | "STANDARDIZING" | "MATCHING" | "CONFLICT_CHECK" | "COMPLETED" | "FAILED";
  progressPercent: number;
  message: string;
  updatedAt: number;
}

// In-memory state store for Realtime Database tracking
const activeJobs: Record<string, ProcessingJobState> = {};
const reviewSessions: Record<string, ReviewSession> = {};

export async function setJobProgress(jobId: string, state: Partial<ProcessingJobState>): Promise<ProcessingJobState> {
  const existing = activeJobs[jobId] || {
    jobId,
    sourceId: "",
    stage: "UPLOADED",
    progressPercent: 0,
    message: "Initializing",
    updatedAt: Date.now(),
  };

  activeJobs[jobId] = {
    ...existing,
    ...state,
    updatedAt: Date.now(),
  };

  return activeJobs[jobId];
}

export async function getJobProgress(jobId: string): Promise<ProcessingJobState | null> {
  return activeJobs[jobId] || null;
}

export async function acquireReviewLock(params: {
  parcelId: string;
  conflictId: string;
  reviewerId: string;
  reviewerName: string;
}): Promise<{ acquired: boolean; currentSession: ReviewSession }> {
  const { parcelId, conflictId, reviewerId, reviewerName } = params;
  const existing = reviewSessions[parcelId];

  // If locked by someone else within 15 minutes
  if (
    existing &&
    existing.activeReviewerId &&
    existing.activeReviewerId !== reviewerId &&
    existing.lockedAt &&
    Date.now() - existing.lockedAt < 15 * 60 * 1000
  ) {
    return { acquired: false, currentSession: existing };
  }

  const newSession: ReviewSession = {
    parcelId,
    conflictId,
    activeReviewerId: reviewerId,
    activeReviewerName: reviewerName,
    lockedAt: Date.now(),
    updatedAt: Date.now(),
  };

  reviewSessions[parcelId] = newSession;
  return { acquired: true, currentSession: newSession };
}

export async function releaseReviewLock(parcelId: string): Promise<void> {
  if (reviewSessions[parcelId]) {
    reviewSessions[parcelId].activeReviewerId = null;
    reviewSessions[parcelId].activeReviewerName = null;
    reviewSessions[parcelId].lockedAt = null;
    reviewSessions[parcelId].updatedAt = Date.now();
  }
}
