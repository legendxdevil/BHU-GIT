# Bhu-Git — Security Review & Controls Log

## Executive Security Summary

Bhu-Git handles sensitive urban land records, spatial boundaries, and revenue documentation. Security is implemented across all application layers (Network, Auth, API, Database, Operations) following a zero-trust model.

---

## 1. Credentials & Secrets Management
- **Rule:** Zero hardcoded private keys or passwords in source code, client bundles, or repository.
- **Controls:**
  - Firebase Admin SDK credentials strictly restricted to server environments via process environment variables (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
  - Browser-exposed keys limited exclusively to non-privileged `NEXT_PUBLIC_` Firebase client variables.
  - `.env.local` included in `.gitignore`.

---

## 2. Authentication & Server Authorization (RBAC)
- **Roles:** `admin`, `review_officer`, `field_officer`, `viewer`.
- **Controls:**
  - Every API route verifies the incoming Firebase ID token server-side via `firebase-admin` or secure verification adapter.
  - Client-side role variables are treated strictly as presentation hints; server endpoints re-verify permissions before writing or reading sensitive collections.

---

## 3. Data Integrity & Concurrency
- **Controls:**
  - Atomic Version Commit requires parent version match (`parentVersionId === currentVersionId`). Stale commits are rejected with a `409 Conflict`.
  - Realtime lock (`reviewSessions/{parcelId}`) prevents concurrent reviewer modifications on the same parcel.

---

## 4. Input & Upload Security
- **Controls:**
  - File uploads validated for MIME type, extension, size limits, and structural JSON/GeoJSON schema.
  - Filenames sanitized with generated random UUIDs (`source_[uuid].[ext]`) to prevent path traversal (`../`) attacks.
  - OCR inputs restricted to image formats (`image/jpeg`, `image/png`) with page/resolution caps.

---

## 5. Rate Limiting & Abuse Prevention
- **Controls:**
  - In-memory rate limiting applied to `/api/sources/upload`, `/api/documents/ocr`, `/api/versions/commit`, and `/api/conflicts/detect`.
