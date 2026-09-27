# Bhu-Git — API Documentation

This document describes the server API endpoints provided by Bhu-Git.

---

## Endpoint Summary

### 1. Ingestion & Sources
- `POST /api/sources/upload`: Ingest new dataset file (GeoJSON, CSV, GNSS points). Standardizes attributes, creates source metadata record, and triggers conflict matching.

### 2. Parcels & Spatial Query
- `GET /api/parcels`: List parcels with optional filters (`ward`, `status`, `search`).
- `GET /api/parcels/[parcelId]`: Get full detail of a specific parcel including current GeoJSON, active version, attributes, and linked documents.

### 3. Conflict Engine
- `POST /api/conflicts/detect`: Run conflict detection between incoming source and parcel candidates. Returns flagged geometry, attribute, identifier, and temporal conflicts.
- `GET /api/conflicts`: List active conflict queue.
- `POST /api/conflicts/[conflictId]/resolve`: Resolve conflict by approving, rejecting, or saving a reviewer-modified geometry proposal.

### 4. Version Control
- `POST /api/versions/commit`: Create new official parcel version ($V_{n+1}$) referencing parent version ($V_n$). Requires `review_officer` or `admin` authorization.
- `GET /api/parcels/[parcelId]/versions`: Fetch complete immutable version history for time-travel inspection.

### 5. Document OCR
- `POST /api/documents/ocr`: Process scanned revenue record image with Tesseract.js OCR, extract field candidates, and attach to parcel evidence.

### 6. Exports
- `POST /api/exports`: Generate export payload (GeoJSON, CSV, PDF Review Summary) with security audit logging.
