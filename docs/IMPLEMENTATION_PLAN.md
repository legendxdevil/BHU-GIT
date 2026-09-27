# Bhu-Git — Phased Implementation Plan

## Phase Overview

- **Phase 1: Foundation & Project Structure** `[~]`
- **Phase 2: UI Design Tokens & Shared Layout Components** `[ ]`
- **Phase 3: Authentication & Role-Based Access Control** `[ ]`
- **Phase 4: Data Models & Firebase Database Integration Layer** `[ ]`
- **Phase 5: Interactive GIS Map & Parcel Explorer Engine** `[ ]`
- **Phase 6: Data Ingestion & Standardization Pipeline** `[ ]`
- **Phase 7: Multi-Dimensional Conflict Detection & Evidence Scoring** `[ ]`
- **Phase 8: Human-in-the-Loop Review Workspace** `[ ]`
- **Phase 9: Version Control, Commit Engine & Time-Travel History** `[ ]`
- **Phase 10: Legacy Document Intelligence (Tesseract.js OCR)** `[ ]`
- **Phase 11: Analytics Dashboard, Activity Feed & Data Export** `[ ]`
- **Phase 12: Security Hardening, Rate Limiting & Concurrency Controls** `[ ]`
- **Phase 13: System Completeness (Metadata, 404, Offline, Accessibility)** `[ ]`
- **Phase 14: Verification, Automated Testing & End-to-End Validation** `[ ]`
- **Phase 15: Final Review & Production Release Documentation** `[ ]`

---

## Detailed Phase Breakdown

### Phase 1: Foundation & Project Structure `[~]`
- Initialize Next.js project with TypeScript and App Router.
- Configure dependencies: `framer-motion`, `firebase`, `firebase-admin`, `@turf/turf`, `leaflet`, `react-leaflet`, `tesseract.js`, `lucide-react`, `clsx`, `tailwind-merge`.
- Set up project directories and environment templates (`.env.example`).
- Write initial system tracking documentation.

### Phase 2: UI Design Tokens & Shared Layout Components `[ ]`
- Implement root `tokens.css` with exact Steep-style editorial color tokens, typography, radii (24px cards, 16px inputs, 9999px pill buttons).
- Build shared UI components (`Button`, `Card`, `Badge`, `Input`, `Modal`, `Toast`, `Table`, `Select`, `Skeleton`).
- Implement app layout shell with responsive sidebar, navigation header, role indicators, and status banners.

### Phase 3: Authentication & Role-Based Access Control `[ ]`
- Configure Firebase Auth client SDK and server-side Firebase Admin SDK.
- Create `/login` page with editorial aesthetic.
- Implement server-side role validation middleware and RBAC helper permissions (`admin`, `review_officer`, `field_officer`, `viewer`).
- Add protected route wrappers and role-aware navigation.

### Phase 4: Data Models & Firebase Database Integration Layer `[ ]`
- Define TypeScript domain types for `Parcel`, `ParcelVersion`, `Conflict`, `Source`, `ReviewSession`, `AuditLog`, `LegacyDocument`.
- Build Firestore repository functions with fallback local state adapters for offline/standalone execution.
- Build Realtime Database adapters for live job progress, presence, and lock management.
- Provide initial seed demo dataset (Ward 12 city block with synthetic multi-source conflicts).

### Phase 5: Interactive GIS Map & Parcel Explorer Engine `[ ]`
- Build React-Leaflet base map wrapper with custom tile layer support and Leaflet CSS.
- Build GeoJSON layer renderers for Parcels, incoming boundary overlays, conflict highlights, and GNSS points.
- Build interactive Map Legend, Layer Toggles, Search/Filter bar, and Parcel Profile Detail Drawer.
- Integrate Turf.js for client-side bounding box filtering, spatial query bounds, and centoid calculations.

### Phase 6: Data Ingestion & Standardization Pipeline `[ ]`
- Create `/data-sources` interface and upload API endpoint `/api/sources/upload`.
- Support GeoJSON, CSV (coordinates/attributes), and GNSS point formats.
- Validate file signatures, MIME types, structure, and CRS assumptions.
- Standardize input attributes into internal Bhu-Git schema with dataset provenance metadata.

### Phase 7: Multi-Dimensional Conflict Detection & Evidence Scoring `[ ]`
- Implement spatial candidate matching using bounding boxes and Turf overlap calculations.
- Build Multi-Dimensional Conflict Engine (`/api/conflicts/detect`):
  - Geometry Conflict (boundary deviation in meters, area difference in sq.m, shape overlap).
  - Attribute Conflict (land use, owner name, survey number mismatches).
  - Identifier & Temporal Conflict logic.
- Calculate evidence trust score based on source factor, recency, spatial agreement, and historical source reliability.
- Explainable reason generator for every flagged conflict.

### Phase 8: Human-in-the-Loop Review Workspace `[ ]`
- Implement Split-Screen Review Workspace (`/review`):
  - Left: Current parcel state & existing boundary.
  - Center: Interactive comparison map (Current vs. Incoming vs. Proposed boundary with transparency slider).
  - Right: Evidence assessment, deviation metrics, and AI explanation panel.
- Implement Reviewer Decision Actions: `APPROVE`, `REJECT`, `MODIFY` (interactive vertex edit / buffer adjust), and `REQUEST FIELD VERIFICATION`.
- Implement concurrency lock using Realtime Database to prevent concurrent reviewer edits.

### Phase 9: Version Control, Commit Engine & Time-Travel History `[ ]`
- Implement atomic version commit engine (`/api/versions/commit`) preserving previous version tree.
- Build Parcel Version History view (`/history`) with interactive Time-Travel slider.
- Render past boundary states, decision logs, reviewer notes, and evidence references upon selecting any historical version ($V_1 \rightarrow V_2 \rightarrow V_3 \rightarrow V_4$).

### Phase 10: Legacy Document Intelligence (Tesseract.js OCR) `[ ]`
- Build `/documents` interface for scanning and uploading legacy revenue records/khasra documents.
- Run Tesseract.js OCR pipeline with image preprocessing (grayscale, contrast thresholding).
- Extract field candidates (Survey No, Parcel No, Owner, Area, Ward) and map to existing parcel evidence.

### Phase 11: Analytics Dashboard, Activity Feed & Data Export `[ ]`
- Build Executive Dashboard (`/dashboard`) showing parcel stats, conflict metrics, review backlog, and live activity stream.
- Build Data Export Engine (`/api/exports`): GeoJSON, CSV, and PDF-friendly Review Reports.

### Phase 12: Security Hardening, Rate Limiting & Concurrency Controls `[ ]`
- Implement API rate-limiting middleware for upload, OCR, and version commit endpoints.
- Enforce sanitization for filenames, inputs, and spatial payloads.
- Configure Firestore & Realtime DB security rules templates.

### Phase 13: System Completeness (Metadata, 404, Offline, Accessibility) `[ ]`
- Add Next.js SEO metadata, Open Graph preview assets, Web App Manifest, robots.txt, and sitemap.
- Implement custom 404 (`not-found.tsx`), global error boundary (`error.tsx`), skeleton loading states, empty states, and offline reconnection banners.
- Add keyboard shortcuts (`R`, `A`, `X`, `M`, `F`, `H`) and accessibility ARIA labels.

### Phase 14: Verification, Automated Testing & End-to-End Validation `[ ]`
- Write unit tests for Turf.js spatial functions, conflict scoring, and validation.
- Write integration tests for API routes and version commit flow.
- Execute full end-to-end golden path verification (Upload -> Match -> Conflict -> Review -> Commit Version -> Time Travel -> Export).

### Phase 15: Final Review & Production Release Documentation `[ ]`
- Generate final requirements traceability matrix and security review summary.
- Update `/docs` in-app documentation center and setup guides.
