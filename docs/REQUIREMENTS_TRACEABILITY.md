# Bhu-Git — Requirements Traceability Matrix

This document maps every requirement from the Master Blueprint specification to its implementation location and verification method.

| Req ID | Category | Requirement Description | Implementation Location | Verification Method | Status |
|---|---|---|---|---|---|
| REQ-001 | Architecture | Next.js + React App Router application structure | `app/` | `npm run build` / Route check | Planned |
| REQ-002 | UI System | Steep-style editorial design palette (#17191c, #ffffff, #f2f2f3, #fafafb, #fbe1d1, #5d2a1a) | `styles/tokens.css`, `tailwind.config.ts` | Visual & CSS Token Audit | Planned |
| REQ-003 | Auth & Roles | Firebase Auth integration with 4 roles (admin, review_officer, field_officer, viewer) | `lib/auth/`, `middleware.ts` | Integration Test & RBAC Audit | Planned |
| REQ-004 | Data Store | Firestore collections (`parcels`, `versions`, `conflicts`, `sources`, `auditLogs`) | `lib/firebase/firestore.ts` | Firestore Repositories Unit Test | Planned |
| REQ-005 | Realtime | Firebase Realtime DB (`jobs`, `conflicts`, `reviewSessions`) | `lib/firebase/realtime.ts` | Live Sync Test | Planned |
| REQ-006 | GIS Engine | Turf.js geometry math (area, overlap, boundary deviation, bbox) | `lib/geo/` | Spatial Math Unit Tests | Planned |
| REQ-007 | Interactive Map | Leaflet/React-Leaflet parcel visualization with layers & legend | `components/map/` | GIS UI Verification | Planned |
| REQ-008 | Data Ingestion | Source dataset upload, MIME/format validation & CRS normalization | `app/api/sources/upload/route.ts` | Ingestion API Test | Planned |
| REQ-009 | Conflict Detection | Multi-dimensional conflict engine (Geometry, Attribute, Identifier, Temporal) | `lib/geo/conflict.ts` | Conflict Detection Unit Tests | Planned |
| REQ-010 | Evidence Assessment | Evidence confidence scoring & historical source reliability aggregation | `lib/geo/evidence.ts` | Evidence Calculator Tests | Planned |
| REQ-011 | Review Workflow | Split-screen Review Workspace with Approve / Reject / Modify / Field Check | `app/review/`, `components/review/` | UI Review Workflow Test | Planned |
| REQ-012 | Concurrency Lock | Active reviewer presence and concurrency lock on review session | `lib/firebase/realtime.ts` | Concurrency Test | Planned |
| REQ-013 | Version Control | Parent-referenced immutable version creation & current pointer update | `app/api/versions/commit/route.ts` | Version Commit Test | Planned |
| REQ-014 | Time-Travel | Interactive history timeline allowing selection of past parcel versions | `app/history/`, `components/parcel/` | Time-Travel Interaction Test | Planned |
| REQ-015 | Legacy OCR | Tesseract.js scanned record OCR text & field extraction | `app/api/documents/ocr/route.ts` | OCR Pipeline Test | Planned |
| REQ-016 | Dashboard | Key statistics cards, spatial conflict map, activity stream | `app/dashboard/` | Dashboard Integration Test | Planned |
| REQ-017 | Export | GeoJSON, CSV & PDF Review Report generator | `app/api/exports/route.ts` | Export Generator Test | Planned |
| REQ-018 | Security | Server-side token verification, rate limiting, path traversal protection | `middleware.ts`, `lib/auth/` | Security Review Audit | Planned |
| REQ-019 | UX Completeness | Custom 404, error boundaries, skeleton loaders, empty states, ARIA labels | `app/not-found.tsx`, `components/ui/` | Accessibility & UX Audit | Planned |
