# Bhu-Git — Detailed Architecture, Logic & Methodology

> **Project:** Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data for Urban Land Record Management  
> **Core Concept:** Treat every parcel as a versioned "land truth" record. Incoming datasets are evidence; the system compares, evaluates, proposes a harmonized update, and only creates a new official version after human review.

---

# 1. Project Overview

Bhu-Git is a web-based urban land record harmonization platform.

The main problem is not simply "storing land records." The real problem is that one parcel may appear differently across multiple sources:

- Drone / orthophoto imagery
- ORI / aerial imagery
- DSM / DTM
- Existing cadastral maps
- Revenue records
- Municipal GIS
- Utility datasets
- GNSS / CORS survey points
- Ground-truth observations
- Scanned legacy documents

These sources may disagree on:

- Parcel boundary
- Parcel area
- Building footprint
- Ownership / attribute values
- Survey identifiers
- Road / utility relationships
- Coordinate reference system
- Geometry quality
- Record version or date

Bhu-Git does **not** blindly replace the old record.

Instead, it follows:

```text
SOURCE DATA
    ↓
INGEST
    ↓
STANDARDIZE
    ↓
MATCH TO PARCEL
    ↓
DETECT CONFLICTS
    ↓
COMPARE EVIDENCE
    ↓
GENERATE PROPOSED HARMONIZATION
    ↓
EXPLAIN WHY
    ↓
HUMAN REVIEW
    ↓
APPROVE / REJECT / MODIFY
    ↓
CREATE NEW VERSION
    ↓
KEEP OLD VERSION
```

This creates a traceable history of how the parcel record changed.

---

# 2. Core Philosophy — "Land Truth as Version History"

Traditional GIS workflow often behaves like:

```text
Old boundary
    ↓
Edit
    ↓
Overwrite
    ↓
New boundary
```

Bhu-Git behaves like:

```text
V1 — Existing cadastral record
 ↓
V2 — Survey evidence reviewed
 ↓
V3 — Municipal update reviewed
 ↓
V4 — Harmonized record approved
```

Each version stores:

- Parent version
- Geometry
- Attributes
- Source
- Confidence / evidence assessment
- Reviewer
- Decision
- Timestamp
- Reason / notes

The important idea is:

> **The current record is not the only truth we preserve. The history of evidence and decisions is also valuable.**

---

# 3. Technology Stack

## 3.1 Frontend

### Next.js + React

Used for:

- Application routing
- Pages
- UI components
- Server-side / client-side rendering where appropriate
- API routes
- Authentication-aware screens
- Dashboard
- GIS explorer
- Review interface

Suggested routing structure:

```text
/app
  /login
  /dashboard
  /data-sources
  /processing
  /parcels
  /parcels/[parcelId]
  /conflicts
  /review
  /history
  /documents
  /knowledge-graph
  /exports
  /api
```

---

## 3.2 Animation

### Framer Motion

Used for:

- Page transitions
- Card entrance
- Conflict panel reveal
- Version history transitions
- Map comparison transitions
- Review approval feedback
- Loading / processing states

Animations should communicate state changes rather than become decoration.

---

## 3.3 Authentication

### Firebase Authentication

Used for:

- Login
- Session management
- Identity
- Role-based access

Suggested roles:

```text
admin
review_officer
field_officer
viewer
```

Role permissions:

| Role | View | Upload | Review | Approve | Admin |
|---|---:|---:|---:|---:|---:|
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Field Officer | ✅ | ✅ | ✅ | ❌ | ❌ |
| Review Officer | ✅ | ✅ | ✅ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3.4 Main Database

### Firebase Firestore

Used for:

- Parcels
- Versions
- Conflicts
- Data source metadata
- Review decisions
- Audit logs
- User profiles
- Document metadata
- Processing jobs

Firestore is treated as the system-of-record for application data.

---

## 3.5 Realtime Layer

### Firebase Realtime Database

Used for:

- Live processing status
- Review room status
- Active reviewer presence
- Live conflict state
- Upload progress
- Collaboration indicators

Example:

```text
realtime/
  jobs/{jobId}
  conflicts/{conflictId}
  reviewSessions/{parcelId}
```

---

## 3.6 Map

### OpenStreetMap + Leaflet / React-Leaflet

Used for:

- Base map
- Parcel visualization
- Boundary comparison
- Building footprints
- Field points
- Conflict overlays
- Spatial context

---

## 3.7 Geospatial Processing

### Turf.js

Because Firestore is not a native geospatial database, common geometry operations are performed in application code.

Examples:

```text
Intersection
Area
Distance
Buffer
BBox
Within
Overlap
Difference
Centroid
Line / polygon relationships
```

Conceptually:

```text
PostGIS-style operation
        ↓
Application-layer Turf.js function
```

Important:

> Turf.js is a geometry-processing library, not a direct replacement for a geospatial database at very large scale.

Therefore the MVP should focus on manageable datasets and indexed candidate selection before geometry processing.

---

## 3.8 OCR

### Tesseract.js

Used for scanned legacy records.

Pipeline:

```text
Scanned document
      ↓
Image preprocessing
      ↓
OCR
      ↓
Extracted text
      ↓
Field detection
      ↓
Parcel / owner / survey number candidates
      ↓
Human verification
      ↓
Link to parcel evidence
```

OCR output is treated as **evidence**, not automatically as an authoritative land record.

---

# 4. High-Level Architecture

```text
┌──────────────────────────────────────────────┐
│              NEXT.JS + REACT UI              │
│                                              │
│ Dashboard | Map | Parcel | Review | History │
└───────────────────────┬──────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│          NEXT.JS API / SERVER LOGIC           │
│                                              │
│ Auth | Validation | Matching | GIS | Review  │
│ Versioning | Conflict Detection | Export    │
└───────────────┬───────────────────┬──────────┘
                │                   │
                ▼                   ▼
       ┌────────────────┐   ┌─────────────────┐
       │   FIRESTORE    │   │ REALTIME DB     │
       │                │   │                 │
       │ parcels        │   │ jobs            │
       │ versions       │   │ live review     │
       │ conflicts      │   │ progress        │
       │ documents      │   │ presence        │
       │ audits         │   │ status          │
       └────────────────┘   └─────────────────┘
                │
                ▼
       ┌─────────────────────┐
       │ APPLICATION GIS     │
       │                     │
       │ GeoJSON + Turf.js   │
       └─────────────────────┘
                │
                ▼
       ┌─────────────────────┐
       │ OPENSTREETMAP MAP   │
       └─────────────────────┘
```

---

# 5. End-to-End Methodology

Bhu-Git's methodology is divided into ten stages.

---

## Stage 1 — Data Ingestion

### Objective

Bring heterogeneous data into one processing pipeline.

### Inputs

```text
GeoJSON
CSV
Shapefile-derived GeoJSON
Survey point data
JSON
Images
Scanned documents
Attribute tables
```

### Required metadata

Every uploaded dataset should store:

```text
sourceId
sourceType
datasetName
uploadedBy
uploadedAt
captureDate
coordinateReferenceSystem
coverage
fileType
processingStatus
```

Example:

```json
{
  "sourceType": "GNSS_SURVEY",
  "datasetName": "Ward_12_Survey_2026",
  "captureDate": "2026-08-12",
  "uploadedBy": "officer_101",
  "status": "processing"
}
```

### Why metadata matters

The system should know not only **what geometry arrived**, but also:

> "Where did this evidence come from, when was it created, and who uploaded it?"

---

# 6. Stage 2 — Standardization

Different datasets can use different:

- Coordinate systems
- Geometry formats
- Property names
- Units
- Identifier formats
- Date formats

The standardization layer converts them into an internal representation.

### Internal geometry representation

Use GeoJSON-like objects.

Example:

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [77.2012, 28.6012],
      [77.2021, 28.6012],
      [77.2021, 28.6021],
      [77.2012, 28.6021],
      [77.2012, 28.6012]
    ]
  ]
}
```

### Internal attribute representation

```json
{
  "parcelNumber": "P-1024",
  "ward": "12",
  "zone": "Residential",
  "ownerName": "Example Person",
  "landUse": "Residential"
}
```

### Standardization rule

Do not process every source directly in its original schema.

Instead:

```text
Source A ─┐
Source B ─┼──> Standard Internal Model
Source C ─┤
Source D ─┘
```

This reduces downstream complexity.

---

# 7. Stage 3 — Parcel Matching

Before conflict detection, the incoming evidence must be associated with the correct parcel.

Possible matching signals:

```text
1. Parcel ID
2. Survey number
3. Nearby coordinates
4. Geometry overlap
5. Address
6. Building relation
7. OCR-extracted identifiers
```

### Matching approach

Use a layered strategy.

```text
Exact identifier match
        ↓
If unavailable:
Spatial candidate search
        ↓
Geometry comparison
        ↓
Attribute similarity
        ↓
Candidate score
        ↓
Human review if ambiguous
```

### Example

Incoming GNSS survey:

```text
Survey Number = 42/3
```

Existing parcel:

```text
Survey Number = 42/3
```

The system can directly link them.

If the identifier is missing:

```text
Find parcels near survey geometry
        ↓
Calculate spatial similarity
        ↓
Return candidate parcels
```

---

# 8. Stage 4 — Conflict Detection

This is one of the most important modules.

Do not define "conflict" as only:

```text
intersects = false
```

Instead, check multiple dimensions.

---

## 8.1 Geometry Conflict

Compare:

- Overlap
- Boundary distance
- Area difference
- Shape difference
- Containment
- Displacement

Conceptual flow:

```text
Existing Geometry
        +
Incoming Geometry
        ↓
Geometry comparison
        ↓
┌──────────────┬──────────────┬──────────────┐
│ Overlap      │ Area Diff    │ Boundary     │
│              │              │ deviation    │
└──────────────┴──────────────┴──────────────┘
        ↓
Geometry conflict score
```

---

## 8.2 Attribute Conflict

Example:

```text
Revenue Record:
Land Use = Residential

Municipal GIS:
Land Use = Commercial
```

The system flags:

```text
ATTRIBUTE_CONFLICT
```

---

## 8.3 Identifier Conflict

Example:

```text
Same geometry
Different survey numbers
```

Flag:

```text
IDENTIFIER_CONFLICT
```

---

## 8.4 Temporal Conflict

Example:

```text
Source A captured: 2022
Source B captured: 2026
```

A newer dataset does not automatically overwrite an older one.

Instead:

```text
Older evidence
      +
Newer evidence
      ↓
Temporal comparison
      ↓
Review
```

---

# 9. Stage 5 — Evidence & Trust Evaluation

Bhu-Git should not blindly declare a source "correct."

Instead it creates an **evidence assessment**.

Suggested factors:

```text
Source reliability
+
Capture recency
+
Spatial quality
+
Identifier match
+
Historical review outcome
+
Reviewer input
```

Conceptual scoring:

```text
Evidence Score =
    Source Factor
  + Recency Factor
  + Spatial Agreement
  + Attribute Agreement
  + Historical Reliability
```

The exact formula should remain configurable.

Example conceptual scale:

```text
0.00 — Very weak evidence
0.25 — Weak
0.50 — Moderate
0.75 — Strong
1.00 — Very strong
```

### Important distinction

The evidence score means:

> "How strongly does this evidence support the proposed change?"

It does **not** mean:

> "This parcel is legally 92% correct."

The system must keep this distinction clear.

---

# 10. Historical Source Reliability

One of the interesting Bhu-Git ideas is learning from previous review decisions.

Example:

```text
GNSS Source A
10 previous reviews
9 accepted
1 modified
```

This can become a historical reliability signal.

Another source:

```text
Legacy OCR
20 previous uses
7 accepted
13 corrected
```

Its evidence should naturally be treated more cautiously.

### Methodology

```text
Historical decisions
       ↓
Aggregate source outcomes
       ↓
Reliability statistics
       ↓
Future evidence score
```

The system should never hide the underlying statistics.

For example:

```text
Source reliability: 0.84

Based on:
21 reviewed records
18 accepted
3 modified
```

This makes the score explainable.

---

# 11. Stage 6 — Proposed Harmonization

After comparing evidence, the system generates a **proposal**.

It should answer:

```text
What should change?
Why should it change?
Which sources support the change?
What conflicts remain?
```

Example:

```text
CURRENT:
Area = 1240 sq.m

PROPOSED:
Area = 1261 sq.m

Change:
+21 sq.m

Evidence:
- GNSS survey
- Recent orthophoto
- Municipal GIS

Conflict:
Revenue boundary differs by 1.7 m on eastern edge
```

The system should show the proposal visually on the map.

---

# 12. Boundary Harmonization Logic

Boundary adjustment should not mean averaging arbitrary coordinates.

Avoid:

```text
Point A
+
Point B
÷ 2
```

for every boundary point.

Instead use evidence-aware geometry comparison.

Conceptually:

```text
Existing boundary
      ↓
Incoming survey boundary
      ↓
Identify corresponding edges / vertices
      ↓
Measure displacement
      ↓
Detect significant deviations
      ↓
Generate proposed geometry
      ↓
Mark changed segments
      ↓
Human review
```

### Visual representation

```text
Current boundary     ─────────
Incoming boundary    - - - - -
Proposed boundary    ═════════
```

Changed edges should be highlighted.

---

# 13. Stage 7 — Human-in-the-Loop Review

This is a mandatory safety and governance layer.

The AI/system should propose.

The authorized reviewer decides.

### Review screen should contain

```text
LEFT:
Current parcel

CENTER:
Comparison map

RIGHT:
Proposed change + evidence
```

### Reviewer actions

```text
APPROVE
REJECT
MODIFY
REQUEST FIELD VERIFICATION
```

Every action creates an audit entry.

---

# 14. Stage 8 — Version Commit

When a proposal is approved:

```text
Current Version V3
        ↓
Approved Proposal
        ↓
Create V4
        ↓
V3 remains preserved
```

New version:

```json
{
  "versionId": "V4",
  "parentVersionId": "V3",
  "source": ["GNSS-12", "ORI-2026"],
  "decision": "approved",
  "reviewerId": "user-81"
}
```

This is the core Bhu-Git mechanism.

---

# 15. Stage 9 — Audit & Provenance

Every meaningful change should answer:

```text
Who?
What?
When?
Why?
Based on which evidence?
Which version came before it?
```

Audit event example:

```json
{
  "parcelId": "P-1024",
  "action": "VERSION_CREATED",
  "fromVersion": "V3",
  "toVersion": "V4",
  "reviewerId": "user-81",
  "reason": "GNSS-confirmed eastern boundary adjustment",
  "timestamp": 1780000000000
}
```

---

# 16. Stage 10 — Export

The system can prepare:

```text
GeoJSON
CSV
PDF review report
Parcel history report
Conflict report
Harmonized record
```

Export should indicate:

```text
current version
approval status
source references
last reviewer
last update
```

---

# 17. Firestore Data Model

Recommended structure:

```text
firestore/
│
├── users/{uid}
│
├── parcels/{parcelId}
│     ├── currentVersionId
│     ├── status
│     ├── parcelNumber
│     ├── ward
│     ├── currentGeoJSON
│     ├── updatedAt
│     └── ...
│
├── parcels/{parcelId}/versions/{versionId}
│     ├── parentVersionId
│     ├── geometry
│     ├── attributes
│     ├── sourceIds
│     ├── evidenceSummary
│     ├── confidence
│     ├── decision
│     ├── reviewerId
│     ├── reason
│     └── createdAt
│
├── conflicts/{conflictId}
│     ├── parcelId
│     ├── conflictType
│     ├── sourceA
│     ├── sourceB
│     ├── measurements
│     ├── severity
│     ├── status
│     ├── assignedTo
│     └── createdAt
│
├── sources/{sourceId}
│     ├── name
│     ├── sourceType
│     ├── captureDate
│     ├── uploadedBy
│     ├── metadata
│     └── processingStatus
│
├── documents/{documentId}
│
└── auditLogs/{logId}
```

---

# 18. Firestore Parcel Example

```json
{
  "parcelId": "P-1024",
  "parcelNumber": "42/3",
  "status": "pending_review",
  "currentVersionId": "V3",
  "ward": "12",
  "currentGeoJSON": {
    "type": "Polygon",
    "coordinates": []
  },
  "updatedAt": 1780000000000
}
```

---

# 19. Version Document Example

```json
{
  "versionId": "V3",
  "parentVersionId": "V2",
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  },
  "attributes": {
    "landUse": "Residential"
  },
  "sourceIds": [
    "cadastral-2019",
    "gnss-2026"
  ],
  "confidence": 0.84,
  "decision": "approved",
  "reviewerId": "reviewer-81",
  "reason": "Boundary adjusted after GNSS review",
  "createdAt": 1780000000000
}
```

---

# 20. Conflict Data Model

```json
{
  "conflictId": "C-884",
  "parcelId": "P-1024",
  "conflictType": "GEOMETRY",
  "sourceA": "cadastral-2019",
  "sourceB": "gnss-2026",
  "measurements": {
    "areaDifferenceSqM": 21,
    "maxBoundaryDeviationM": 1.7
  },
  "severity": "medium",
  "status": "pending",
  "assignedTo": "reviewer-81",
  "createdAt": 1780000000000
}
```

---

# 21. Realtime Database Design

Firestore stores durable application state.

Realtime Database stores rapidly changing temporary state.

```text
realtime/
│
├── jobs/
│    └── {jobId}
│          ├── stage
│          ├── progress
│          └── message
│
├── conflicts/
│    └── {conflictId}
│          ├── status
│          └── reviewer
│
└── reviewSessions/
     └── {parcelId}
           ├── activeReviewer
           ├── viewers
           └── locked
```

---

# 22. Next.js API Responsibilities

Suggested API structure:

```text
/app/api/
│
├── auth/
│
├── parcels/
│    ├── route.ts
│    └── [parcelId]/route.ts
│
├── sources/
│    ├── upload/route.ts
│    └── [sourceId]/process/route.ts
│
├── conflicts/
│    ├── detect/route.ts
│    ├── [conflictId]/route.ts
│    └── [conflictId]/resolve/route.ts
│
├── reviews/
│    ├── route.ts
│    └── [reviewId]/decision/route.ts
│
├── versions/
│    └── commit/route.ts
│
├── documents/
│    └── ocr/route.ts
│
└── exports/
     └── route.ts
```

---

# 23. Upload Processing Logic

Conceptual sequence:

```text
POST /api/sources/upload
        ↓
Authenticate user
        ↓
Validate role
        ↓
Validate file
        ↓
Create source record
        ↓
Normalize metadata
        ↓
Parse geometry / attributes
        ↓
Standardize
        ↓
Find candidate parcels
        ↓
Run conflict detection
        ↓
Create conflicts
        ↓
Create review task
        ↓
Realtime status update
```

---

# 24. Conflict Detection Logic

Pseudo-methodology:

```text
INPUT:
Existing parcel geometry
Incoming geometry
Source metadata
Parcel attributes
Incoming attributes

STEP 1:
Validate geometry

STEP 2:
Check identifier match

STEP 3:
Calculate candidate spatial relationship

STEP 4:
Measure area difference

STEP 5:
Measure boundary deviation

STEP 6:
Compare relevant attributes

STEP 7:
Check temporal metadata

STEP 8:
Combine results into conflict record

STEP 9:
Assign severity

STEP 10:
Send to review queue
```

---

# 25. Conflict Severity

Suggested rule system:

```text
LOW
  Small geometry deviation
  Non-critical metadata mismatch

MEDIUM
  Meaningful boundary deviation
  Area mismatch
  Multiple sources disagree

HIGH
  Major geometry disagreement
  Identifier conflict
  Significant unresolved evidence conflict
```

Severity is a workflow aid.

It should not be presented as a legal conclusion.

---

# 26. Proposed Decision Logic

Conceptually:

```text
IF no meaningful conflict
    ↓
    mark evidence as compatible
    ↓
    allow routine review

IF conflict exists
    ↓
    compare evidence
    ↓
    create harmonization proposal
    ↓
    require authorized review

IF evidence is ambiguous
    ↓
    request field verification

IF reviewer rejects
    ↓
    preserve old version
    ↓
    close proposal

IF reviewer modifies
    ↓
    save reviewer-edited geometry
    ↓
    create approved version
```

---

# 27. Field Verification Logic

Some conflicts should not be solved purely in software.

Example:

```text
Revenue map ──┐
Drone map ────┼── disagreement
GNSS ─────────┘
```

If evidence remains inconclusive:

```text
SYSTEM:
"Field verification recommended."
```

Then:

```text
Field officer
    ↓
Collects GNSS / ground truth
    ↓
Uploads evidence
    ↓
System re-runs comparison
    ↓
Reviewer decides
```

---

# 28. Legacy Document OCR Methodology

The Legacy Document screen should work like:

```text
Upload scan
     ↓
Image preprocessing
     ↓
Tesseract OCR
     ↓
Extract text
     ↓
Detect likely fields
     ↓
Examples:
  Survey No.
  Parcel No.
  Owner
  Area
  Ward
     ↓
Match candidates
     ↓
Reviewer verifies
     ↓
Attach document as evidence
```

### OCR rule

Never automatically replace structured records solely from OCR text.

OCR is evidence.

---

# 29. Knowledge Graph — Optional / Phase 2

Bhu-Git can later represent relationships such as:

```text
Parcel P1024
   │
   ├── locatedIn → Ward 12
   ├── linkedTo → Survey 42/3
   ├── hasBuilding → B991
   ├── supportedBy → GNSS-2026
   ├── supportedBy → ORI-2026
   └── reviewedBy → Officer 81
```

This helps users understand connected information.

For the MVP, a full graph database is not necessary.

It can be represented initially using Firestore relationships.

---

# 30. Dashboard Logic

The dashboard should answer five questions immediately:

```text
How many parcels?
How many pending?
How many conflicts?
How many reviewed today?
How much data is processing?
```

Suggested cards:

```text
12,480 Parcels
324 Pending Review
81 Conflicts
57 Reviewed Today
4 Processing Jobs
```

Map:

```text
Green  → approved
Peach/Amber → pending review
Red    → conflict
```

The exact status colors should remain consistent throughout the product.

---

# 31. Parcel Explorer Logic

Main map screen:

```text
Map
 │
 ├── Search parcel
 ├── Filter status
 ├── Filter ward
 ├── Filter source
 ├── Toggle evidence
 └── Click parcel
         ↓
    Parcel Profile
```

Selecting a parcel should open:

```text
Parcel ID
Current Status
Current Version
Area
Key Attributes
Conflict Summary
Evidence Count
Version History
```

---

# 32. Conflict Center Logic

The Conflict Center is a work queue.

Example table:

```text
Parcel | Conflict | Severity | Sources | Status | Assigned
P1024  | Geometry | Medium   | GNSS/ORI| Pending| Officer A
P1492  | Attribute| Low      | Rev/Muni| Pending| Officer B
P1720  | ID       | High     | Rev/GIS | Open   | Officer C
```

Clicking a row opens the comparison workspace.

---

# 33. Review Workspace

Recommended layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Parcel P-1024                           Conflict: Medium    │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│   CURRENT MAP        │      EVIDENCE / PROPOSAL             │
│                      │                                      │
│ Existing boundary   │  Proposed change                      │
│ Incoming boundary   │  Area difference                     │
│ Proposed boundary   │  Boundary deviation                  │
│                      │  Source evidence                     │
│                      │  Confidence/evidence summary         │
│                      │                                      │
├──────────────────────┴──────────────────────────────────────┤
│ Reject | Request Field Check | Modify | Approve            │
└─────────────────────────────────────────────────────────────┘
```

---

# 34. Version History Logic

Version list:

```text
V4  Approved  2026-09-17  Reviewer A
V3  Approved  2026-09-02  Reviewer B
V2  Modified  2026-08-21  Reviewer A
V1  Imported  2026-07-10  System
```

Clicking any version:

```text
V1 → V2 → V3 → V4
```

The map updates to show the selected geometry.

---

# 35. Time Travel Feature

This is a signature Bhu-Git interaction.

Example:

```text
[ V1 ] [ V2 ] [ V3 ] [ V4 ]
                    ▲
                 selected
```

When selecting V2:

```text
Map = V2 geometry
Attributes = V2 attributes
Evidence = V2 evidence
Decision = V2 decision
```

The user can visually understand:

> "How did this parcel become its current state?"

---

# 36. UI / Visual Design System

The visual direction follows the uploaded Steep-style reference:

> editorial, warm, minimal, spacious, near-monochrome, with a restrained peach accent.

Primary colors:

```text
Ink Black       #17191c
Paper White     #ffffff
Mist Gray       #f2f2f3
Fog White       #fafafb
Slate Gray      #777b86
Ash Gray        #979799
Smoke Gray      #a3a6af
Blush Peach     #fbe1d1
Sienna Brown    #5d2a1a
```

The source style reference defines these colors and their roles. fileciteturn0file0L12-L21

---

# 37. UI Rules

## Background

```text
Main canvas       → #ffffff
Card surface      → #f2f2f3
Section alternate → #fafafb
Accent card       → #fbe1d1
```

## Text

```text
Primary → #17191c
Muted   → #777b86
Tertiary→ #979799
Disabled→ #a3a6af
```

## Accent

```text
Peach  → #fbe1d1
Brown  → #5d2a1a
```

The reference describes the peach/brown pair as the principal chromatic accent and otherwise keeps the system largely achromatic. fileciteturn0file0L14-L21

---

# 38. Typography

Use:

```text
Display / H1 / H2:
Signifier or fallback serif

Body / UI:
Söhne or Inter/system sans fallback
```

Suggested hierarchy:

```text
Display       90px
Heading Large 64px
Heading       44px
Heading Small 26px
Subheading    22px
Body Large    20px
Body          17px
Caption       15px
```

The reference uses regular-weight serif display headings and Söhne-style sans-serif UI/body hierarchy. fileciteturn0file0L24-L39

---

# 39. Component Style

Cards:

```text
Radius = 24px
```

Inputs:

```text
Radius = 16px
```

Buttons:

```text
Radius = 9999px
```

Use subtle elevation only where necessary.

The style reference explicitly uses 24px cards, 16px inputs and fully rounded pill buttons. fileciteturn0file0L81-L89

---

# 40. Product Status Colors

The visual palette is intentionally restricted, but a GIS/review product still requires status semantics.

Recommended approach:

```text
Approved:
Use neutral/green-leaning visual cue sparingly in the map or iconography.

Pending:
Use warm amber-like visual cue sparingly.

Conflict:
Use red-like visual cue sparingly.

Base UI:
Remain monochrome + peach.
```

Do not turn every card into a colorful dashboard.

The editorial palette should remain the dominant visual language.

---

# 41. Frontend Component Structure

Suggested:

```text
/components
│
├── ui/
│    ├── Button.tsx
│    ├── Card.tsx
│    ├── Badge.tsx
│    ├── Modal.tsx
│    └── Input.tsx
│
├── map/
│    ├── ParcelMap.tsx
│    ├── ParcelLayer.tsx
│    ├── ConflictLayer.tsx
│    ├── EvidenceLayer.tsx
│    └── MapLegend.tsx
│
├── parcel/
│    ├── ParcelHeader.tsx
│    ├── ParcelSummary.tsx
│    ├── ParcelEvidence.tsx
│    └── VersionTimeline.tsx
│
├── conflict/
│    ├── ConflictCard.tsx
│    ├── ConflictTable.tsx
│    └── ConflictComparison.tsx
│
├── review/
│    ├── ReviewPanel.tsx
│    ├── DecisionButtons.tsx
│    └── EvidencePanel.tsx
│
└── dashboard/
     ├── StatCard.tsx
     ├── ActivityFeed.tsx
     └── ProcessingCard.tsx
```

---

# 42. Firebase Utility Structure

```text
/lib
│
├── firebase-client.ts
├── firebase-admin.ts
├── firestore.ts
├── realtime.ts
├── auth.ts
└── permissions.ts
```

GIS helpers:

```text
/lib/geo
│
├── area.ts
├── overlap.ts
├── distance.ts
├── difference.ts
├── normalize.ts
└── conflict.ts
```

---

# 43. Security Methodology

Security must exist at two layers.

## Layer 1 — Firebase Rules

Restrict direct data access.

Example concept:

```text
Viewer:
read only

Officer:
read + create processing requests

Reviewer:
read + review + approve

Admin:
full management
```

## Layer 2 — Next.js Server Validation

Never trust the frontend role alone.

Every sensitive API route should:

```text
Verify Firebase token
      ↓
Read role / claims
      ↓
Check permission
      ↓
Validate request
      ↓
Perform operation
```

---

# 44. API Security Rule

Never do:

```text
if (frontendRole === "admin")
```

as the sole authorization mechanism.

Instead:

```text
Firebase token
      ↓
server verification
      ↓
verified claims
      ↓
authorization
```

---

# 45. Error Handling Methodology

Every pipeline stage needs explicit status.

Suggested:

```text
QUEUED
PROCESSING
COMPLETED
FAILED
REQUIRES_REVIEW
```

Example:

```text
Upload
  ↓
Processing
  ↓
Geometry parsing FAILED
```

The user should see:

```text
"Geometry parsing failed."

not:

```text
"500 Internal Server Error"
```

Technical logs can still preserve the original error.

---

# 46. Processing Status Flow

```text
UPLOADED
    ↓
VALIDATING
    ↓
STANDARDIZING
    ↓
MATCHING
    ↓
CONFLICT_CHECK
    ↓
PROPOSAL_GENERATED
    ↓
REVIEW_REQUIRED
    ↓
APPROVED / REJECTED / FIELD_CHECK
```

Realtime DB should broadcast these states to the UI.

---

# 47. Complete User Journey

## Officer

```text
Login
 ↓
Dashboard
 ↓
Upload dataset
 ↓
Processing screen
 ↓
System finds parcel matches
 ↓
Conflicts detected
 ↓
Conflict center
 ↓
Open parcel
 ↓
Compare evidence
 ↓
Review
 ↓
Approve / Modify / Reject
```

## Reviewer

```text
Login
 ↓
Review queue
 ↓
Open high-priority conflict
 ↓
Inspect current vs incoming
 ↓
Read evidence explanation
 ↓
Check history
 ↓
Approve / Modify / Reject
 ↓
Version committed
```

## Admin

```text
Dashboard
 ↓
Data sources
 ↓
Processing monitoring
 ↓
User / role management
 ↓
Audit logs
 ↓
Exports
```

---

# 48. MVP Methodology

Do not attempt to implement every advanced idea in the first version.

The strongest MVP should prove the core loop:

```text
Upload
 ↓
Compare
 ↓
Detect Conflict
 ↓
Explain
 ↓
Human Review
 ↓
Commit Version
 ↓
Time Travel
```

## MVP Features

### Must Have

```text
Firebase Auth
Firestore
Realtime DB
Next.js routing
OpenStreetMap map
Parcel GeoJSON
Turf geometry comparison
Conflict detection
Review screen
Version history
Audit logs
```

### Good to Have

```text
OCR
Source reliability statistics
Advanced filters
PDF report
Knowledge graph view
```

### Phase 2 / Future

```text
Advanced ML matching
GNN-based topology reasoning
Large-scale automated inference
Federated learning
Blockchain-style immutable provenance
Full digital twin
Predictive dispute analytics
```

---

# 49. Recommended MVP Demo Dataset

For a hackathon demo, use a small synthetic but realistic city block.

Example:

```text
Ward: 12

Parcels:
P1001
P1002
P1003
P1004
P1005
P1006
```

Sources:

```text
Cadastral 2019
Municipal GIS 2024
Drone/ORI 2026
GNSS Survey 2026
Legacy scanned record
```

Intentionally create:

```text
Parcel P1003:
- Cadastral boundary differs from GNSS
- Municipal land-use field differs from revenue record
```

This creates a visible conflict.

---

# 50. Ideal Hackathon Demo

## Step 1

Open Dashboard.

Show:

```text
6 parcels
2 conflicts
1 pending review
```

## Step 2

Open Parcel P1003.

Show the current geometry.

## Step 3

Upload GNSS survey.

Realtime status:

```text
Uploading → Processing → Matched
```

## Step 4

System detects:

```text
Boundary deviation: 1.7 m
Area difference: 21 sq.m
```

## Step 5

Conflict screen opens.

Three layers are visible:

```text
Current
Incoming
Proposed
```

## Step 6

Evidence panel explains:

```text
GNSS survey supports the proposed eastern boundary adjustment.
Existing cadastral geometry remains preserved as V2.
```

## Step 7

Reviewer clicks:

```text
APPROVE
```

## Step 8

System creates:

```text
V3
```

## Step 9

Timeline becomes:

```text
V1 → V2 → V3
```

## Step 10

Click V2.

The old boundary returns.

Click V3.

The approved boundary returns.

This single interaction demonstrates the central Bhu-Git idea.

---

# 51. Why This Architecture Works for the Hackathon

The architecture gives a clear separation of responsibilities.

```text
React
  = presentation

Next.js
  = application logic / API

Firebase Auth
  = identity

Firestore
  = durable application data

Realtime DB
  = live state

Turf.js
  = geometry processing

OpenStreetMap
  = map context

Tesseract.js
  = legacy document evidence
```

This makes the system understandable to judges and manageable for the team.

---

# 52. Important Technical Limitations

## Firebase is not a GIS database

Firestore does not provide full native spatial querying.

Therefore:

```text
Large spatial operations
        ↓
Need candidate reduction first
        ↓
Then Turf.js geometry processing
```

For the prototype this is reasonable.

For production-scale workloads with very large spatial datasets, a dedicated spatial database or geospatial processing service may eventually be required.

---

# 53. Candidate Reduction Strategy

Do not compare every incoming polygon against every parcel.

Bad:

```text
100,000 incoming features
×
100,000 parcels
```

Instead:

```text
Incoming geometry
      ↓
Bounding box / geographic partition
      ↓
Small candidate set
      ↓
Turf geometry comparison
```

This is an important optimization for Firebase-based architecture.

---

# 54. Data Validation

Before geometry analysis:

```text
Check geometry type
Check coordinates
Check polygon closure
Check empty geometry
Check invalid values
Check expected CRS metadata
Check required attributes
```

Invalid data should go to:

```text
VALIDATION_FAILED
```

rather than entering the conflict engine.

---

# 55. Version Commit Rules

A new version should be created only when:

```text
1. Proposal exists
2. Reviewer is authorized
3. Decision = approved
4. Geometry is valid
5. Parent version still matches current version
```

The fifth condition prevents accidental overwrites from concurrent reviewers.

Conceptually:

```text
Expected current version = V3

If Firestore still says V3:
    create V4

Else:
    stop and ask reviewer to refresh
```

---

# 56. Audit Rules

Audit logs should be immutable from the normal UI flow.

Track:

```text
LOGIN
UPLOAD
PROCESS_START
PROCESS_COMPLETE
CONFLICT_CREATED
REVIEW_OPENED
PROPOSAL_MODIFIED
APPROVED
REJECTED
FIELD_CHECK_REQUESTED
VERSION_CREATED
EXPORT_CREATED
```

---

# 57. Suggested File Structure

```text
bhu-git/
│
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── parcels/
│   ├── conflicts/
│   ├── review/
│   ├── history/
│   ├── documents/
│   ├── exports/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── map/
│   ├── parcel/
│   ├── conflict/
│   ├── review/
│   └── dashboard/
│
├── lib/
│   ├── firebase/
│   ├── geo/
│   ├── auth/
│   └── validation/
│
├── types/
│   ├── parcel.ts
│   ├── source.ts
│   ├── conflict.ts
│   └── version.ts
│
├── data/
│   └── demo/
│
└── public/
```

---

# 58. Important Domain Rule

The platform should distinguish three concepts:

```text
SOURCE RECORD
    ↓
SYSTEM PROPOSAL
    ↓
APPROVED VERSION
```

They are not the same.

Example:

```text
GNSS says boundary = X

System proposes boundary = Y

Reviewer approves boundary = Z
```

All three should remain traceable.

This is much stronger than treating AI output as the final record.

---

# 59. Explainability Model

Every proposal should have an explanation panel.

Example:

```text
WHY IS THIS CHANGE PROPOSED?

1. GNSS survey differs from current boundary.
2. Maximum boundary deviation = 1.7 m.
3. Area difference = 21 sq.m.
4. Recent ORI supports the same edge movement.
5. Previous reviewed records from this source show strong agreement.

REMAINING CONFLICT:
Revenue record boundary differs on the eastern edge.

RECOMMENDATION:
Human review required.
```

The wording should stay factual and evidence-based.

---

# 60. Design Principle for AI/ML

The first MVP does not need a mysterious black-box AI.

A transparent rules + scoring engine can demonstrate the core intelligence:

```text
geometry comparison
+
attribute matching
+
source metadata
+
historical evidence
+
human review
```

Later, machine learning can improve:

```text
parcel matching
boundary correspondence
source reliability
conflict prioritization
document field extraction
```

This gives the team a working foundation without overengineering the first demo.

---

# 61. Recommended Architecture Decision

For the hackathon:

```text
Frontend
Next.js + React

Animation
Framer Motion

Auth
Firebase Auth

Database
Firestore

Realtime
Firebase Realtime DB

Map
OpenStreetMap + React-Leaflet

Geometry
Turf.js

OCR
Tesseract.js

Backend
Next.js API routes / server logic
```

This stack is coherent for the MVP.

---

# 62. Final System Flow

```text
                  DATA SOURCES
                       │
        ┌──────────────┼───────────────┐
        │              │               │
      GNSS           ORI           Revenue
        │              │               │
        └──────────────┼───────────────┘
                       ↓
                INGEST / VALIDATE
                       ↓
                  STANDARDIZE
                       ↓
                  MATCH PARCEL
                       ↓
               CONFLICT DETECTION
                       ↓
              EVIDENCE EVALUATION
                       ↓
             HARMONIZATION PROPOSAL
                       ↓
                 EXPLANATION
                       ↓
                HUMAN REVIEW
                 /    |     \
             Reject Modify  Approve
               │       │       │
               │       │       ↓
               │       │   CREATE VERSION
               │       │       │
               │       └───────┘
               │               ↓
               │         AUDIT + HISTORY
               │               ↓
               └────────→ CURRENT RECORD
                               ↓
                         TIME TRAVEL
                               ↓
                            EXPORT
```

---

# 63. One-Line Project Definition

> **Bhu-Git is a version-controlled geospatial evidence and review platform that harmonizes conflicting urban land records without destroying their history.**

---

# 64. The Core Demo Story

The entire product should revolve around one simple story:

```text
"Different sources disagree."

        ↓

"Bhu-Git detects the disagreement."

        ↓

"It shows the evidence."

        ↓

"It proposes a change."

        ↓

"A human reviews it."

        ↓

"The approved change becomes a new version."

        ↓

"The old version is still available."

        ↓

"Every decision remains traceable."
```

That is the strongest and clearest expression of the Bhu-Git concept.


---

# 65. Production-Ready Web Application Essentials

The core architecture above explains the product logic. This section covers the "basic but important" engineering and UX pieces required to make the Next.js application feel complete rather than like a prototype.

---

# 66. Next.js Metadata & SEO

Every public-facing page should have appropriate metadata.

For the application, the page title should clearly identify the product and current section.

Suggested title pattern:

```text
Bhu-Git — Dashboard
Bhu-Git — Parcel Explorer
Bhu-Git — Conflict Center
Bhu-Git — Review Parcel P-1024
Bhu-Git — Version History
Bhu-Git — Legacy Documents
```

For the root/public page:

```text
Bhu-Git — Version-Controlled Urban Land Records
```

Recommended metadata:

```text
title
description
keywords where appropriate
applicationName
authors
creator
robots
metadataBase
openGraph
twitter
icons
```

For authenticated/internal pages, search indexing should generally be disabled:

```text
robots:
  index: false
  follow: false
```

This prevents internal land-record screens from being treated like public search content.

---

# 67. Next.js Metadata Example

Suggested App Router approach:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bhu-Git — Dashboard",
  description:
    "Geospatial evidence, conflict review, and version-controlled urban land records.",
  applicationName: "Bhu-Git",
  robots: {
    index: false,
    follow: false,
  },
};
```

For the public landing page, use an indexable metadata configuration if the team chooses to expose the project publicly.

---

# 68. Open Graph / Social Preview

When someone shares a public Bhu-Git URL, the preview should have:

```text
Title:
Bhu-Git — Version-Controlled Urban Land Records

Description:
Harmonize multi-source geospatial evidence with transparent human review and parcel version history.

Image:
Bhu-Git OG preview
```

Recommended asset:

```text
/public/og/bhu-git-og.png
```

The OG graphic should follow the product palette:

```text
#17191c
#ffffff
#f2f2f3
#fbe1d1
#5d2a1a
```

---

# 69. Favicon & App Icons

Include:

```text
/public/favicon.ico
/public/icon.svg
/public/apple-icon.png
/public/android-chrome-192.png
/public/android-chrome-512.png
```

The icon should be simple enough to remain recognizable at small sizes.

Possible Bhu-Git visual motif:

```text
Parcel polygon
+
version node / timeline
```

---

# 70. Web App Manifest

Add:

```text
/app/manifest.ts
```

Recommended concepts:

```json
{
  "name": "Bhu-Git",
  "short_name": "Bhu-Git",
  "description": "Version-controlled urban land record harmonization platform",
  "display": "standalone",
  "theme_color": "#17191c",
  "background_color": "#ffffff"
}
```

The application is primarily a desktop GIS workflow, but the manifest makes the product more installable and complete.

---

# 71. Robots.txt

Add:

```text
/app/robots.ts
```

For an authenticated/internal app:

```text
User-agent: *
Disallow: /
```

For a public landing page plus private application, allow the public pages and block application routes.

Example conceptual policy:

```text
Allow:
/
/about
/docs

Disallow:
/dashboard
/parcels
/review
/conflicts
/api
```

---

# 72. Sitemap

If public pages exist, add:

```text
/app/sitemap.ts
```

Only include public pages.

Do NOT put private parcel routes or sensitive record URLs into the sitemap.

---

# 73. Documentation Section

A proper project should have a documentation area.

Suggested route:

```text
/docs
```

Suggested documentation structure:

```text
/docs
  /getting-started
  /architecture
  /data-model
  /geospatial-logic
  /conflict-detection
  /review-workflow
  /versioning
  /roles-permissions
  /api
  /deployment
  /faq
```

The documentation should explain the system to:

```text
Judges
Developers
Project teammates
GIS reviewers
Future maintainers
```

---

# 74. In-App Help

Important workflows should provide contextual help.

Example:

```text
Confidence
ⓘ
How strongly the available evidence supports this proposal.
It is not a legal probability or a guarantee of correctness.
```

Another example:

```text
Boundary deviation
ⓘ
Maximum measured spatial difference between compared geometries.
```

Help should explain terminology without overwhelming the user.

---

# 75. Custom 404 Page

Create:

```text
/app/not-found.tsx
```

Suggested message:

```text
Page not found.

The page you're looking for doesn't exist or may have moved.

[Back to Dashboard]
```

For a parcel route:

```text
Parcel not found.

This parcel may have been removed from the demo dataset or the identifier is invalid.

[Open Parcel Explorer]
```

The 404 page should use the normal Bhu-Git visual system rather than looking like a browser error.

---

# 76. Global Error Page

Create:

```text
/app/error.tsx
```

Use it for recoverable UI errors.

Suggested pattern:

```text
Something went wrong.

The system could not load this view.

[Try again]
```

Do not expose:

```text
stack traces
Firebase internals
database IDs
secret values
server error details
```

in the user interface.

---

# 77. Global Loading State

Add appropriate loading boundaries.

Example:

```text
/app/dashboard/loading.tsx
/app/parcels/loading.tsx
/app/review/loading.tsx
```

Use skeleton UI for:

```text
Stat cards
Map panel
Parcel summary
Conflict table
Timeline
```

Avoid a single generic spinner for the entire page.

---

# 78. Empty States

Every data-driven screen needs an empty state.

Examples:

### No conflicts

```text
No active conflicts.

All currently indexed conflicts have been resolved.
```

### No parcels

```text
No parcels found.

Try changing your ward or search filters.
```

### No version history

```text
No additional versions yet.

This parcel currently has only its imported base record.
```

### No documents

```text
No legacy documents linked to this parcel.
```

---

# 79. Offline / Network Error State

Firebase-backed screens should handle network loss.

Example:

```text
Connection interrupted.

Your current screen may contain stale data.
We'll reconnect automatically.
```

For review actions:

```text
Review action not submitted.

Please reconnect before approving or rejecting this proposal.
```

Never show a fake "Approved" state before the server confirms the write.

---

# 80. Form Validation

All input forms require validation.

Examples:

```text
Parcel ID cannot be empty
File type must be supported
Geometry must be valid
Required metadata must be present
Source type must be selected
Capture date must be valid
```

Client-side validation improves UX.

Server-side validation remains mandatory.

---

# 81. File Upload Validation

Before processing:

```text
Check extension
Check MIME type
Check maximum size
Check file integrity
Check expected content
Check geometry structure where applicable
```

Possible statuses:

```text
VALID
INVALID_FORMAT
TOO_LARGE
CORRUPTED
UNSUPPORTED_SCHEMA
INVALID_GEOMETRY
```

---

# 82. Environment Variables

Never hardcode secrets.

Example:

```text
.env.local
```

Variables may include:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY

NEXT_PUBLIC_MAP_TILE_URL
NEXT_PUBLIC_APP_URL
```

Important:

```text
NEXT_PUBLIC_*
```

variables can reach the browser.

Private Firebase Admin credentials must NOT use the public prefix.

---

# 83. Firebase Admin Isolation

Client-side Firebase:

```text
firebase-client.ts
```

Server-side Admin SDK:

```text
firebase-admin.ts
```

Do not import server-only credentials into client components.

Conceptual boundary:

```text
Browser
  ↓
Firebase Client SDK

Server
  ↓
Firebase Admin SDK
```

---

# 84. API Response Standards

Keep API responses predictable.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Validation failure:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_GEOMETRY",
    "message": "The uploaded polygon is invalid."
  }
}
```

Conflict detection:

```json
{
  "success": true,
  "data": {
    "conflict": true,
    "conflictId": "C-884"
  }
}
```

---

# 85. API Documentation

Document important endpoints.

Example:

```text
POST /api/sources/upload
GET  /api/parcels
GET  /api/parcels/:parcelId
POST /api/conflicts/detect
GET  /api/conflicts/:conflictId
POST /api/conflicts/:conflictId/resolve
POST /api/versions/commit
POST /api/documents/ocr
GET  /api/exports/:id
```

For a larger version of the project, the team can maintain an OpenAPI specification.

Suggested file:

```text
/docs/api/openapi.yaml
```

---

# 86. Accessibility

Bhu-Git is an administrative/public-service style workflow, so accessibility should be considered from the beginning.

Minimum checklist:

```text
Keyboard navigation
Visible focus states
Semantic buttons
Labels for inputs
ARIA labels for icon-only controls
Readable contrast
Error messages associated with fields
Do not rely only on color for conflict status
```

Example:

Bad:

```text
red polygon = conflict
```

Better:

```text
red polygon + Conflict label + icon
```

This also helps map users who have difficulty distinguishing colors.

---

# 87. Responsive Design

Primary target:

```text
Desktop / laptop
```

because GIS review needs a large map.

Still support:

```text
Tablet
Mobile
```

Responsive priority:

### Desktop

```text
Map + evidence panel + controls
```

### Tablet

```text
Map
bottom / side evidence drawer
```

### Mobile

```text
Parcel summary
↓
Map
↓
Evidence drawer
↓
Review actions
```

The complete review workspace should not become unusably cramped on small screens.

---

# 88. Keyboard Shortcuts

Optional productivity feature for reviewers:

```text
R → Open review
A → Approve
X → Reject
M → Modify
F → Field verification
H → History
Esc → Close panel
```

Shortcuts should never trigger destructive actions without an additional confirmation where appropriate.

---

# 89. Confirmation Dialogs

Actions affecting record workflow should provide clear confirmation.

Example:

```text
Approve Proposal?

This will create a new approved parcel version.

Current version: V3
New version: V4

[Cancel] [Approve]
```

Reject:

```text
Reject Proposal?

The current parcel version will remain unchanged.

Reason:
[________________]

[Cancel] [Reject proposal]
```

---

# 90. Unsaved Changes Protection

If a reviewer manually modifies geometry or attributes:

```text
Unsaved changes detected.

Leave without saving?
```

Actions:

```text
Stay
Discard
Save draft
```

This prevents accidental loss during map editing.

---

# 91. Draft Review State

For complex reviews, support:

```text
draft_review
```

Example:

```text
Reviewer opens P1024
↓
Moves proposed boundary
↓
Adds note
↓
Saves draft
↓
Returns later
↓
Continues review
```

Only approved actions create the official new version.

---

# 92. Concurrency / Review Locking

Two reviewers should not unknowingly approve different changes for the same parcel.

Use:

```text
reviewSessions/{parcelId}
```

Realtime state:

```text
activeReviewer
locked
startedAt
```

Behavior:

```text
Reviewer A opens parcel
        ↓
Parcel review state becomes active
        ↓
Reviewer B sees:
"Currently being reviewed by Officer A"
```

Admin users may have an override process.

---

# 93. Audit-Friendly UI

Every important record should show provenance.

Example:

```text
Last updated:
17 Sep 2026

Updated by:
Review Officer A

Source:
GNSS-12

Decision:
Approved

Version:
V4
```

A small "View audit trail" action can open the detailed log.

---

# 94. Data Freshness

For map and dashboard data, show timestamps where useful.

Example:

```text
Last synced:
10:42 AM

Source captured:
12 Aug 2026
```

Do not imply that a dataset is current merely because it is displayed.

---

# 95. Time Handling

Store timestamps consistently in UTC at the backend/database layer.

Display them in the user's expected local timezone.

Use one standard for dates:

```text
17 Sep 2026
```

and precise timestamps where auditability matters:

```text
17 Sep 2026, 10:42 AM
```

---

# 96. Logging

Maintain structured logs for server operations.

Log events such as:

```text
AUTH_FAILURE
UPLOAD_STARTED
UPLOAD_FAILED
GEOMETRY_PARSE_FAILED
MATCH_COMPLETED
CONFLICT_CREATED
VERSION_COMMIT_FAILED
VERSION_CREATED
EXPORT_CREATED
```

Never log:

```text
Passwords
Private keys
Firebase private credentials
Sensitive document contents unless explicitly required
```

---

# 97. Monitoring

At minimum, track:

```text
API error rate
Failed uploads
Failed processing jobs
Average processing duration
Review backlog
Version commit failures
Realtime connection problems
```

For the hackathon, simple server logs are sufficient.

For production, connect a proper application monitoring platform.

---

# 98. Performance Strategy

Because Firestore is not a native spatial database, performance depends strongly on reducing the number of geometry comparisons.

Use:

```text
Ward / zone filtering
Bounding boxes
Geographic partitioning
Metadata filtering
Parcel IDs
Then Turf.js operations
```

Pipeline:

```text
Huge dataset
   ↓
cheap filtering
   ↓
candidate parcels
   ↓
Turf geometry operations
```

Do not run expensive polygon comparisons across the entire dataset unnecessarily.

---

# 99. Map Performance

For many parcels:

```text
Do not render every polygon at maximum detail immediately.
```

Use:

```text
Viewport filtering
Simplified geometry where suitable
Progressive loading
Layer toggles
Cluster points
```

Potential layers:

```text
Parcels
Buildings
Conflicts
GNSS points
Evidence
Roads
Utilities
```

Allow users to toggle layers.

---

# 100. GIS Map Legend

Every map with multiple statuses should have a legend.

Example:

```text
━━ Approved parcel
━━ Pending review
━━ Conflict
● GNSS point
◼ Building
- - Incoming boundary
══ Proposed boundary
```

Never force users to guess what line styles or colors mean.

---

# 101. Map Interaction Rules

Supported interactions:

```text
Pan
Zoom
Parcel click
Layer toggle
Boundary inspection
Evidence toggle
Fit to parcel
Reset map
```

For review:

```text
Show current
Show incoming
Show proposed
Compare
```

A transparency slider can be useful:

```text
Current  ◀────●────▶  Incoming
```

---

# 102. Data Table UX

Tables should support:

```text
Search
Filter
Sort
Pagination
Status chips
Clickable parcel IDs
```

Avoid huge tables without pagination.

For mobile, convert wide tables into stacked cards where practical.

---

# 103. Search

Global search should support:

```text
Parcel ID
Survey number
Ward
Address
Owner/record field where authorized
```

Search flow:

```text
Search
 ↓
Candidate results
 ↓
Parcel profile
```

Avoid fuzzy matching over sensitive fields unless the authorization model allows it.

---

# 104. Filter System

Recommended filters:

```text
Status
Ward
Source
Conflict type
Severity
Reviewer
Date range
Processing state
```

Allow:

```text
Clear all
Save view (optional)
```

---

# 105. Notifications

Use lightweight in-app notifications for:

```text
Upload completed
Conflict detected
Review assigned
Review approved
Field verification requested
Export ready
Processing failed
```

Avoid excessive toast notifications.

Important notifications should remain visible in an activity center.

---

# 106. Activity Feed

Dashboard activity example:

```text
10:42
GNSS dataset uploaded for Ward 12

10:45
17 parcel candidates matched

10:46
3 geometry conflicts detected

11:02
P1024 approved → V4 created
```

This makes the workflow visible and helps the demo.

---

# 107. Role-Aware Navigation

Navigation should respond to permissions.

Viewer:

```text
Dashboard
Parcel Explorer
History
```

Officer:

```text
Dashboard
Data Sources
Parcels
Conflicts
Reviews
History
Documents
```

Admin:

```text
Everything
+
Users
Audit
System
```

Do not simply hide a page and assume that provides security. Server authorization remains required.

---

# 108. Login Experience

Login screen:

```text
Bhu-Git

Urban land records, with a traceable history.

Email
Password

[Sign in]

Forgot password
```

After authentication:

```text
Firebase session
↓
Fetch verified claims
↓
Load role-aware application
```

Do not allow users to select a privileged role and automatically gain its permissions.

A visible role label can be shown after authentication:

```text
Signed in as
Review Officer
```

---

# 109. First-Time User Experience

Optional first-run tour:

```text
1. Data sources
2. Parcel map
3. Conflicts
4. Review
5. Version history
```

Keep it dismissible.

---

# 110. Security Headers & Browser Hardening

For production deployment, consider:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Frame protections
HTTPS
```

The exact headers should be tuned to the map, Firebase, and deployment environment.

---

# 111. Rate Limiting

Sensitive or expensive endpoints should be protected.

Especially:

```text
Upload
OCR
Conflict detection
Export
Login-related operations
```

Reason:

```text
Prevent abuse
Control expensive processing
Protect Firebase resources
```

For the hackathon, basic throttling can be enough.

---

# 112. Backup & Recovery

Important Firestore data should have a backup strategy for production.

Protect:

```text
parcels
versions
conflicts
audit logs
source metadata
```

The key principle is:

> Version history is part of the product's value, so it should not be treated as disposable data.

---

# 113. Test Strategy

Testing should cover four layers.

## Unit Tests

Test:

```text
Geometry calculations
Conflict rules
Scoring
Validators
Permission helpers
```

## Integration Tests

Test:

```text
API → Firestore
API → Realtime DB
Auth → protected route
Version commit flow
```

## UI Tests

Test:

```text
Login
Parcel search
Map selection
Conflict opening
Review action
Version history
```

## End-to-End Test

Golden path:

```text
Login
→ upload dataset
→ process
→ conflict appears
→ open parcel
→ approve
→ V4 created
→ history updates
```

---

# 114. Test Data

Keep a deterministic demo dataset:

```text
/data/demo/parcels.json
/data/demo/sources.json
/data/demo/conflicts.json
```

It should contain:

```text
Clean parcel
Geometry conflict
Attribute conflict
Identifier conflict
Multiple versions
Legacy document
```

This makes the hackathon demo repeatable.

---

# 115. Seed / Reset Strategy

For a demo environment, add a safe reset mechanism.

Conceptual action:

```text
Reset Demo Data
```

This should only exist in:

```text
development/demo environment
```

and never be exposed to ordinary production users.

---

# 116. CI/CD

Recommended basic pipeline:

```text
git push
 ↓
lint
 ↓
typecheck
 ↓
unit tests
 ↓
build
 ↓
deployment
```

Suggested scripts:

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

---

# 117. Git Branching

Because Bhu-Git is itself inspired by version control, the engineering repository should also remain organized.

Suggested:

```text
main
develop
feature/*
fix/*
```

Example:

```text
feature/conflict-review-ui
feature/parcel-history
fix/geometry-validation
```

Commit messages should describe the actual change.

---

# 118. Code Quality Rules

Use:

```text
TypeScript
Strict typing
Reusable components
Small utility functions
Server/client boundary clarity
Centralized constants
Consistent naming
```

Avoid:

```text
giant page components
duplicated Firebase code
hardcoded permissions
magic numbers
hidden geometry assumptions
```

---

# 119. Shared Constants

Create:

```text
/lib/constants.ts
```

For:

```text
roles
statuses
conflict types
severity levels
source types
version decisions
```

Example:

```ts
export const CONFLICT_TYPES = {
  GEOMETRY: "GEOMETRY",
  ATTRIBUTE: "ATTRIBUTE",
  IDENTIFIER: "IDENTIFIER",
  TEMPORAL: "TEMPORAL",
} as const;
```

This prevents spelling inconsistencies across the app.

---

# 120. TypeScript Domain Types

Suggested:

```text
/types
  parcel.ts
  version.ts
  source.ts
  conflict.ts
  review.ts
  audit.ts
  document.ts
  user.ts
```

Example:

```ts
export type ParcelStatus =
  | "approved"
  | "pending_review"
  | "conflict";
```

Strong domain types reduce accidental invalid states.

---

# 121. Design Token File

Keep the visual system centralized.

Example:

```text
/styles/tokens.css
```

Core colors from the provided style reference:

```css
:root {
  --ink: #17191c;
  --paper: #ffffff;
  --mist: #f2f2f3;
  --fog: #fafafb;
  --slate: #777b86;
  --ash: #979799;
  --smoke: #a3a6af;
  --blush: #fbe1d1;
  --sienna: #5d2a1a;
}
```

The reference specifically defines these palette roles and keeps peach as a restrained chromatic accent. fileciteturn0file0L12-L21

---

# 122. Visual Consistency Rules

Keep:

```text
24px cards
16px inputs
9999px pill buttons
4px spacing base
generous section spacing
hairline borders
minimal shadows
```

The reference defines 24px content-card radii, 16px input radii, fully rounded buttons, and a 4px spacing system. fileciteturn0file0L55-L89

---

# 123. Do Not Over-Color the GIS Interface

The base product should remain:

```text
White
Black
Gray
Peach
Brown
```

Map status colors can exist as semantic overlays, but the application chrome should stay restrained.

This preserves the editorial visual identity.

---

# 124. Documentation of Business Rules

Every important automated rule should have a plain-language explanation.

Example:

```text
Rule:
A boundary deviation above the configured review threshold creates a geometry conflict.

Why:
The system wants a reviewer to inspect materially different evidence rather than silently replacing the existing record.
```

This is useful for both judges and future developers.

---

# 125. Configuration Instead of Hardcoding

Do not hardcode every threshold.

Possible config:

```json
{
  "boundaryDeviationReviewM": 1.5,
  "areaDifferenceReviewPercent": 2,
  "candidateSearchRadiusM": 50
}
```

The values shown above are examples for configuration design, not legal or domain-certified thresholds.

The actual thresholds should be decided using validated domain requirements and test data.

---

# 126. Explainable Conflict Rules

The conflict engine should return both a decision and reasons.

Example:

```json
{
  "isConflict": true,
  "type": "GEOMETRY",
  "reasons": [
    "Boundary deviation exceeds configured review threshold",
    "Area differs from current record",
    "Incoming survey overlaps parcel candidate"
  ]
}
```

This makes the UI and debugging much easier.

---

# 127. AI/ML Boundary

Keep a clear architecture boundary.

Phase 1:

```text
Deterministic GIS + rules
```

Phase 2:

```text
ML-assisted matching
ML-assisted ranking
Document understanding
Topology suggestions
```

Phase 3:

```text
Advanced spatial intelligence
```

AI should enhance the evidence workflow, not hide how a decision was produced.

---

# 128. Legal / Governance Boundary

The application should clearly separate:

```text
Imported source
System proposal
Reviewer decision
Approved application version
```

Do not phrase an automated output as a legal ruling.

A reviewer approval in the demo should be described as an application workflow event unless the underlying governmental process formally grants that authority.

---

# 129. Accessibility of Map Information

Because a map can contain visual-only information, important details should also appear in text.

Example:

```text
Conflict:
Geometry conflict

Maximum boundary deviation:
1.7 m

Area difference:
21 sq.m

Sources:
Cadastral 2019, GNSS 2026
```

This ensures the core evidence is not communicated only through map colors.

---

# 130. Print / PDF-Friendly Review Report

A review report can include:

```text
Parcel ID
Current version
Proposed version
Conflict type
Source list
Measurements
Map snapshot
Reviewer
Decision
Reason
Timestamp
Audit reference
```

This is useful for a review record or demonstration artifact.

---

# 131. Export Naming Convention

Use predictable file names.

Examples:

```text
BhuGit_P1024_V4.geojson
BhuGit_P1024_Review_Report.pdf
BhuGit_Ward12_Conflicts.csv
BhuGit_Parcel_History_P1024.pdf
```

---

# 132. Route Protection

Routes requiring authentication should enforce authentication on the server side.

Protected examples:

```text
/dashboard
/parcels
/conflicts
/review
/history
/documents
/exports
/admin
```

Public examples:

```text
/
/about
/docs
```

Whether `/docs` is public can be chosen according to deployment needs.

---

# 133. Authorization Matrix

Maintain one central permission matrix:

```text
Permission
  ↓
role
  ↓
allowed action
```

Example:

```text
VIEW_PARCEL
UPLOAD_SOURCE
OPEN_REVIEW
MODIFY_PROPOSAL
APPROVE_PROPOSAL
REJECT_PROPOSAL
MANAGE_USERS
VIEW_AUDIT
EXPORT_DATA
```

This is more scalable than checking role names throughout the codebase.

---

# 134. Production Checklist

Before calling the application "complete", verify:

```text
[ ] Authentication works
[ ] Role permissions work
[ ] Protected routes are protected
[ ] API authorization is server-side
[ ] Firestore rules are configured
[ ] Realtime rules are configured
[ ] Geometry validation works
[ ] Conflict detection works
[ ] Review actions are audited
[ ] Version commit is atomic enough for concurrency model
[ ] 404 page exists
[ ] Global error page exists
[ ] Loading states exist
[ ] Empty states exist
[ ] Network-error states exist
[ ] Metadata exists
[ ] Favicon exists
[ ] Manifest exists
[ ] Robots policy exists
[ ] Sitemap exists for public content
[ ] Documentation exists
[ ] Forms validate
[ ] Upload validation exists
[ ] Accessibility basics covered
[ ] Responsive layouts covered
[ ] Test suite covers golden path
[ ] Demo data can be reset
[ ] Environment variables are separated
[ ] Secrets are not committed
[ ] Production deployment is reproducible
```

---

# 135. Final Master Architecture

```text
                         ┌───────────────────────┐
                         │      USER / OFFICER   │
                         └───────────┬───────────┘
                                     │
                                     ▼
                 ┌────────────────────────────────────┐
                 │       NEXT.JS + REACT FRONTEND      │
                 │                                    │
                 │ Dashboard / Map / Review / History│
                 │ Docs / Upload / Conflicts / Admin │
                 └──────────────────┬─────────────────┘
                                    │
                       Authenticated requests
                                    │
                                    ▼
                 ┌────────────────────────────────────┐
                 │        NEXT.JS SERVER / API         │
                 │                                    │
                 │ Auth validation                    │
                 │ Input validation                   │
                 │ Parcel matching                    │
                 │ Conflict engine                    │
                 │ Version commit                     │
                 │ OCR orchestration                  │
                 │ Export                             │
                 └──────────┬──────────────┬──────────┘
                            │              │
                            ▼              ▼
                 ┌────────────────┐  ┌─────────────────┐
                 │   FIRESTORE    │  │  REALTIME DB    │
                 │                │  │                 │
                 │ parcels        │  │ jobs            │
                 │ versions       │  │ live review     │
                 │ conflicts      │  │ progress        │
                 │ sources        │  │ presence        │
                 │ audit logs     │  │ status          │
                 └───────┬────────┘  └─────────────────┘
                         │
                         ▼
                ┌────────────────────┐
                │     GIS ENGINE     │
                │                    │
                │ GeoJSON + Turf.js  │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ OPENSTREETMAP      │
                │ + LEAFLET          │
                └────────────────────┘

Supporting layers:
──────────────────────────────────────────────────────────

Firebase Auth
   ↓
roles + access control

Tesseract.js
   ↓
legacy document evidence

Metadata / SEO
   ↓
public pages + sharing

Docs
   ↓
developers + reviewers + judges

Testing / CI/CD
   ↓
reliable delivery

Monitoring / logs
   ↓
operational visibility
```

---

# 136. Definition of "Done"

Bhu-Git is not complete merely because:

```text
the map loads
```

It is complete when the full journey works:

```text
USER AUTHENTICATES
      ↓
UPLOADS SOURCE
      ↓
SYSTEM VALIDATES
      ↓
DATA IS STANDARDIZED
      ↓
PARCEL IS MATCHED
      ↓
CONFLICT IS DETECTED
      ↓
EVIDENCE IS SHOWN
      ↓
PROPOSAL IS GENERATED
      ↓
REVIEWER INSPECTS
      ↓
REVIEWER APPROVES / REJECTS / MODIFIES
      ↓
VERSION IS CREATED
      ↓
AUDIT TRAIL IS SAVED
      ↓
HISTORY CAN BE REVISITED
      ↓
REPORT CAN BE EXPORTED
```

And around this core flow:

```text
metadata
404
error handling
loading
empty states
security
permissions
accessibility
documentation
testing
deployment
monitoring
responsive design
```

are what make it a complete product rather than only a functional demo.

---

# 137. Final Project Blueprint

## Product

```text
Bhu-Git
Version-Controlled Urban Land Record Harmonization
```

## Frontend

```text
Next.js
React
Framer Motion
Leaflet / React-Leaflet
```

## Backend

```text
Next.js API Routes / server logic
Firebase Admin SDK
```

## Data

```text
Firestore
Realtime Database
GeoJSON
```

## GIS

```text
Turf.js
OpenStreetMap
```

## Document Intelligence

```text
Tesseract.js
```

## Security

```text
Firebase Auth
Custom claims
Firestore rules
Realtime DB rules
Server-side authorization
Environment secrets
```

## Product Completeness

```text
Metadata
SEO
OG image
Favicon
Manifest
Robots
Sitemap
Docs
404
Error pages
Loading states
Empty states
Network states
Accessibility
Responsive design
Notifications
Audit logs
Testing
CI/CD
Monitoring
Backups
```

## Core Idea

```text
Evidence
   ↓
Intelligent comparison
   ↓
Explainable proposal
   ↓
Human decision
   ↓
Versioned land record
```

> **Bhu-Git should feel like a trustworthy land-record workspace first, and an AI/GIS demo second.**


---

# 138. Production Security & Abuse-Prevention Layer

The application handles land-record data, user identities, review decisions, source metadata, and potentially sensitive scanned documents. Security therefore needs to be designed as a first-class system layer rather than added only before deployment.

Security goals:

```text
Protect credentials
Protect APIs
Prevent automated abuse
Prevent unauthorized record changes
Prevent accidental secret commits
Protect uploaded files
Protect audit history
Limit data exposure
```

---

# 139. Authentication Brute-Force Protection

Firebase Authentication handles authentication infrastructure, but the application should still design for abusive login behavior.

Recommended controls:

```text
Login attempt throttling
Account / IP abuse detection where appropriate
Progressive backoff
Temporary blocking for repeated failures
Password reset abuse protection
Suspicious activity monitoring
```

For example:

```text
1 failed attempt
    ↓
normal retry

multiple failures
    ↓
short delay / throttle

many repeated failures
    ↓
temporary block / additional verification
```

Never implement unlimited login attempts from the client.

The UI should show a generic message such as:

```text
Unable to sign in.

Please check your credentials and try again.
```

Avoid revealing whether a particular email account exists.

---

# 140. API Rate Limiting

Rate limiting must apply to expensive or abuse-prone endpoints.

High-priority endpoints:

```text
POST /api/auth/*
POST /api/sources/upload
POST /api/documents/ocr
POST /api/conflicts/detect
POST /api/versions/commit
POST /api/exports
POST /api/reviews/*
```

Conceptual policy:

```text
Normal read APIs
    → higher request allowance

Upload / OCR
    → lower allowance

Conflict processing
    → controlled allowance

Version commit
    → strict allowance

Authentication
    → strictest abuse protection
```

Important:

> Rate limiting is not a substitute for authorization.

---

# 141. Upload Abuse Prevention

File uploads are one of the largest attack surfaces.

Validate:

```text
Maximum file size
Maximum number of files per request
Allowed extensions
Allowed MIME types
Actual file signature / content where practical
Expected schema
Geometry structure
Document type
Filename length
Filename characters
```

Example conceptual limits:

```text
Maximum file size      = configurable
Maximum files/request = configurable
Maximum OCR page count = configurable
Maximum geometry count = configurable
```

The numbers should be configurable and based on deployment capacity rather than treated as universal values.

---

# 142. Never Trust File Extensions

Do not rely only on:

```text
filename.endsWith(".json")
```

A malicious file can use a harmless extension.

Validation should combine:

```text
Extension
+
MIME type
+
File content
+
Parser validation
```

If validation fails:

```text
UPLOAD_REJECTED
```

---

# 143. Filename Sanitization

Never use a raw uploaded filename as a storage path.

Bad:

```text
/uploads/${originalFilename}
```

Safer concept:

```text
generated ID
+
validated extension
```

Example:

```text
source_8f21c7.geojson
```

Store the original filename only as metadata if required.

---

# 144. Path Traversal Protection

Never allow user-controlled input to directly construct server filesystem paths.

Reject patterns / behavior associated with:

```text
../
..\ 
absolute filesystem paths
unexpected path separators
```

The system should generate storage destinations itself.

---

# 145. Storage Separation

Uploaded files should not be mixed casually with executable application files.

Conceptual structure:

```text
application code
    ≠
user uploads
```

Uploaded documents should be stored in a controlled storage system or isolated object storage area.

For the Firebase architecture, Firebase Storage can be considered for large uploaded files while Firestore stores metadata and workflow state.

---

# 146. Never Put Secrets in Frontend Code

Never place private credentials in:

```text
React components
client-side JavaScript
public folder
GeoJSON
Firestore public documents
API responses
URL query parameters
```

Examples of secrets that must remain server-side:

```text
Firebase Admin private key
service account credentials
server signing secrets
private API tokens
database credentials
third-party secret keys
```

Public Firebase configuration is different from privileged Admin credentials; the security boundary is enforced through Firebase rules and server-side authorization.

---

# 147. Environment Variables

Use:

```text
.env.local
.env.development.local
.env.production.local
```

Never commit actual production secrets.

Example:

```text
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

Only values intentionally exposed to the browser should use:

```text
NEXT_PUBLIC_
```

---

# 148. `.gitignore` Security

The repository should include a strong `.gitignore`.

At minimum:

```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.pem
*.key
service-account*.json
firebase-adminsdk*.json
credentials*.json
secrets/
```

Do not rely on `.gitignore` alone.

A secret already committed to Git remains part of repository history unless properly removed and rotated.

---

# 149. Secret Scanning

Add automated secret scanning to the repository.

The goal is to detect accidental commits such as:

```text
API keys
private keys
service-account JSON
tokens
passwords
JWT secrets
cloud credentials
```

Possible workflow:

```text
git commit / pull request
        ↓
secret scan
        ↓
secret detected?
   ┌────┴────┐
  YES        NO
   ↓          ↓
BLOCK       CONTINUE
```

The exact scanner can be chosen later according to the repository and CI provider.

---

# 150. Secret Rotation Policy

If a secret is accidentally exposed:

```text
DO NOT just delete the file.
```

Use:

```text
1. Revoke / rotate the exposed secret
2. Remove it from active configuration
3. Remove accidental repository exposure where necessary
4. Verify replacement secret
5. Audit affected systems
```

The most important response is **rotation/revocation**, not merely hiding the file again.

---

# 151. Pre-Commit Safety Checks

Before code is pushed:

```text
lint
typecheck
tests
secret scan
```

Suggested sequence:

```text
developer commit
      ↓
pre-commit checks
      ↓
secret scan
      ↓
pass?
```

The check should fail when obvious credentials are found.

---

# 152. CI Security Gate

Production CI should include:

```text
Dependency audit
Secret scanning
Lint
Typecheck
Tests
Build
```

Pipeline:

```text
Pull Request
    ↓
Lint
    ↓
Typecheck
    ↓
Unit / integration tests
    ↓
Secret scan
    ↓
Dependency/security scan
    ↓
Build
    ↓
Deploy
```

Deployment should be blocked when critical security checks fail.

---

# 153. Dependency Security

Third-party packages are part of the attack surface.

Regularly inspect:

```text
npm audit
```

and keep dependencies reasonably current.

High-risk areas include packages handling:

```text
uploads
OCR
parsing
archives
images
HTML
authentication
network requests
```

Do not blindly update every dependency in production without testing compatibility.

---

# 154. API Authorization

Every sensitive API route should follow:

```text
Request
  ↓
Authenticate
  ↓
Verify token server-side
  ↓
Resolve role / permissions
  ↓
Validate input
  ↓
Perform operation
```

Never rely only on:

```text
hidden frontend button
```

or:

```text
frontend role variable
```

to protect an operation.

---

# 155. Object-Level Authorization

A valid logged-in user does not automatically have permission to access every parcel.

Authorization should consider:

```text
User
+
Role
+
Resource
+
Action
+
Scope
```

Example:

```text
Can this reviewer:
  VIEW parcel P1024?
  EDIT proposal P1024?
  APPROVE proposal P1024?
  EXPORT P1024?
```

This prevents ID-based access attacks.

---

# 156. IDOR Prevention

Do not assume that knowing:

```text
/api/parcels/P1024
```

means a user may access it.

Server-side code should verify authorization for the requested parcel.

Conceptually:

```text
GET /api/parcels/P1024
        ↓
who is requesting?
        ↓
what is their role?
        ↓
are they allowed to view P1024?
```

The same applies to:

```text
conflict IDs
version IDs
document IDs
export IDs
review IDs
```

---

# 157. Version Commit Security

Creating an approved parcel version is a sensitive action.

Before commit:

```text
Authenticate reviewer
        ↓
Verify approval permission
        ↓
Load current parcel
        ↓
Verify expected parent version
        ↓
Validate proposed geometry
        ↓
Validate decision
        ↓
Create version
        ↓
Update currentVersionId
        ↓
Create audit record
```

Do not allow a client to simply send:

```json
{
  "decision": "approved"
}
```

and trust it.

---

# 158. Concurrent Approval Protection

Two reviewers may work on the same parcel.

Protect against:

```text
Reviewer A approves V3 → V4
Reviewer B approves an older V3 → V4
```

Use an optimistic concurrency check:

```text
Expected parent = V3

Firestore current = V3
    ↓
commit allowed

Firestore current = V4
    ↓
commit rejected
```

The reviewer must refresh/reconcile before continuing.

---

# 159. Audit Log Integrity

Important audit events should not be casually editable from the application UI.

Record:

```text
actor
action
resource
previous state
new state / decision
timestamp
reason
request context where appropriate
```

Example:

```json
{
  "actorId": "reviewer-81",
  "action": "APPROVE_PROPOSAL",
  "resourceId": "P1024",
  "fromVersion": "V3",
  "newVersion": "V4",
  "reason": "Boundary proposal reviewed and approved",
  "timestamp": 1780000000000
}
```

---

# 160. Sensitive Data Minimization

Do not collect data simply because the database can store it.

Store only what the workflow requires.

For example:

```text
Needed:
parcel ID
reviewer ID
source metadata
decision
geometry
required attributes

Avoid unnecessary:
personal profile information
unrelated user data
duplicate document contents
sensitive data not required for the workflow
```

This reduces breach impact and simplifies governance.

---

# 161. Sensitive Data in Logs

Never log:

```text
passwords
private keys
access tokens
full authentication tokens
service credentials
raw document contents unless required
```

Prefer:

```text
request ID
user ID
resource ID
operation name
safe error code
```

Example:

```text
VERSION_COMMIT_FAILED
parcel=P1024
request=req_81c2
reason=STALE_PARENT_VERSION
```

---

# 162. Error Message Security

Production users should not receive:

```text
stack traces
SQL/internal query details
Firebase internal object details
filesystem paths
private environment values
dependency errors with sensitive context
```

Show:

```text
A safe user-facing message
```

Log detailed diagnostics server-side.

---

# 163. XSS Prevention

User-controlled text may come from:

```text
OCR output
legacy documents
parcel attributes
notes
uploaded metadata
```

Do not inject untrusted HTML directly.

Avoid unnecessary use of:

```text
dangerouslySetInnerHTML
```

If rich content is genuinely required, sanitize it using a suitable trusted sanitizer.

---

# 164. CSRF / Request Integrity

For cookie-based authenticated endpoints, use appropriate CSRF protections and origin checks where applicable.

For token-based API access, still validate:

```text
origin
authorization
request method
payload
```

Sensitive state-changing operations should not be accessible through unsafe GET routes.

Bad:

```text
GET /api/approve?parcel=P1024
```

Better:

```text
POST /api/conflicts/C884/resolve
```

with verified authorization and request body.

---

# 165. SSRF Consideration

If the application ever accepts a URL and fetches remote content:

```text
URL → server fetch
```

protect against server-side request forgery.

Validate:

```text
allowed schemes
allowed destinations
private/internal network access
redirect behavior
response size
timeout
```

For the current MVP, prefer direct file upload instead of arbitrary server-side URL fetching.

---

# 166. OCR Safety

Tesseract.js should process only validated files.

Controls:

```text
Maximum file size
Maximum image resolution
Maximum pages
Timeout
Memory limits where applicable
Supported formats
```

A malformed document should not be allowed to consume unlimited processing resources.

---

# 167. Geometry Processing Safety

Turf.js operations can become expensive with very complex polygons.

Protect the geometry engine with:

```text
Maximum feature count
Maximum coordinate count
Maximum geometry size
Input validation
Operation timeout / worker isolation where required
Candidate reduction
```

Do not allow a single upload to trigger unlimited geometry comparisons.

---

# 168. Realtime Database Security

Realtime DB should never be treated as public scratch space.

Protect paths such as:

```text
/jobs/*
/conflicts/*
/reviewSessions/*
```

based on:

```text
authenticated user
role
resource ownership / scope
```

Do not let arbitrary clients write:

```text
conflicts/{id}/status = approved
```

without server-validated permissions.

---

# 169. Firestore Security Rules

Rules should enforce baseline access control.

Conceptual:

```text
Unauthenticated
    → no private record access

Viewer
    → read permitted records

Officer
    → allowed workflow writes

Reviewer
    → review/decision writes

Admin
    → administrative operations
```

Security rules should be tested explicitly.

Never use permissive development rules in production.

Avoid:

```text
allow read, write: if true;
```

in production.

---

# 170. Firebase Configuration Separation

Maintain separate environments where practical:

```text
Development
Staging
Production
```

Avoid:

```text
local development
   ↓
directly connected to production parcel records
```

The demo environment should use:

```text
synthetic / test dataset
```

rather than real sensitive records wherever possible.

---

# 171. Production Data Safeguard

Add a clear environment marker:

```text
DEVELOPMENT
STAGING
PRODUCTION
```

This can be visible in the admin interface.

Example:

```text
Bhu-Git
STAGING
```

This reduces accidental actions against the wrong environment.

---

# 172. Dangerous Admin Actions

Administrative actions require extra confirmation.

Examples:

```text
Delete user
Disable user
Bulk export
Reset demo data
Change role
Remove source
Rollback version
```

For high-impact operations:

```text
Confirmation
+
reason
+
audit log
```

---

# 173. Bulk Operation Safety

Bulk imports and updates should support:

```text
Dry run / preview
Validation summary
Error count
Conflict count
Review count
Commit only after validation
```

Example:

```text
Preview import

10,000 features
9,814 valid
186 invalid
322 candidate conflicts

[Cancel] [Import valid records]
```

Do not silently partially modify the system without reporting what happened.

---

# 174. Export Security

Exports can contain large amounts of data.

Control:

```text
Who can export
What they can export
How much they can export
When the export expires
Where it is stored
Who created it
```

Possible pattern:

```text
Request export
    ↓
Authorization check
    ↓
Generate
    ↓
Audit event
    ↓
Time-limited download
```

Do not expose permanent public download URLs for sensitive exports.

---

# 175. Document Access Control

Legacy documents may contain sensitive information.

Every document request should verify:

```text
authenticated user
+
resource permission
```

Do not expose documents through predictable public URLs.

---

# 176. Browser Security

Recommended production browser protections include:

```text
HTTPS
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Frame / clickjacking protection
```

These should be configured in a way compatible with:

```text
Next.js
Firebase
OpenStreetMap tiles
```

---

# 177. Secure Headers Checklist

Example conceptual set:

```text
Content-Security-Policy
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
Frame restrictions
Strict-Transport-Security (when HTTPS deployment is correctly established)
```

Do not copy a strict CSP blindly; map tile domains, Firebase, fonts and other required services must be explicitly accounted for.

---

# 178. Abuse Monitoring

Track security-relevant events:

```text
Repeated login failures
Rejected uploads
Rate-limit triggers
Permission denials
Suspicious export volume
Repeated conflict-processing failures
Unexpected admin actions
```

Use these events to identify abnormal behavior.

---

# 179. Security Incident Response

If a security incident occurs:

```text
1. Identify the incident
2. Contain affected access
3. Rotate exposed credentials
4. Preserve relevant logs
5. Identify impacted resources
6. Patch the root cause
7. Verify systems
8. Document the incident
```

Keep this process separate from normal application troubleshooting.

---

# 180. Production Secret Checklist

Before deployment:

```text
[ ] No secrets in source code
[ ] No secrets in public/
[ ] No production credentials in demo data
[ ] .env files are ignored
[ ] Service-account files are ignored
[ ] Secret scanning enabled
[ ] CI secrets stored in deployment secret manager
[ ] Firebase Admin credentials server-only
[ ] Exposed development keys reviewed
[ ] Production secrets rotated before launch if they were previously shared
```

---

# 181. "API Key Accidentally Pasted in Code" Rule

Team rule:

> **Never paste a production credential directly into source code, screenshots, README files, Markdown documentation, GitHub issues, chat logs, or demo videos.**

If a credential is accidentally pasted:

```text
Treat it as compromised.
Rotate/revoke it immediately.
Then remove the exposed copy.
```

Deleting the line alone is not sufficient.

---

# 182. Pull Request Security Checklist

Every PR should verify:

```text
[ ] No hardcoded credentials
[ ] No secrets in logs
[ ] No unauthenticated sensitive API
[ ] No missing authorization check
[ ] Upload limits preserved
[ ] File validation preserved
[ ] Security rules updated if data model changed
[ ] Audit events added for sensitive actions
[ ] Tests added for authorization-sensitive logic
[ ] No accidental production config committed
```

---

# 183. Security Testing Cases

At minimum test:

```text
Unauthenticated user opens private route
Viewer attempts approve
Officer attempts admin operation
User accesses another parcel by changing ID
Untrusted file uploaded
Oversized file uploaded
Invalid geometry uploaded
Repeated API requests
Repeated login failures
Export requested without permission
Stale version approved
Direct write attempted against protected Firebase path
```

Expected behavior should be explicit:

```text
Unauthorized → rejected
Invalid input → rejected
Abuse threshold → throttled / blocked
Stale write → rejected and reconciled
```

---

# 184. Security Architecture Summary

```text
                 INTERNET
                     │
                     ▼
          ┌─────────────────────┐
          │ HTTPS / Edge Layer  │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ Next.js Application │
          │                     │
          │ Auth verification   │
          │ Authorization       │
          │ Validation          │
          │ Rate limiting       │
          │ Abuse checks        │
          └──────────┬──────────┘
                     │
          ┌──────────┼──────────────┐
          ▼          ▼              ▼
      Firestore   Realtime DB   Storage
          │          │              │
          └──────────┼──────────────┘
                     │
                     ▼
            Audit / Monitoring

Supporting controls:
────────────────────────────────────────
Secret scanning
Dependency scanning
Environment separation
CI/CD security gates
Backups
Credential rotation
Secure headers
Upload limits
Concurrency protection
```

---

# 185. Security Definition of Done

Security work is considered complete for the MVP only when:

```text
[ ] Authentication works
[ ] Sensitive routes require authentication
[ ] Server validates authorization
[ ] Role permissions work
[ ] Object-level authorization is implemented
[ ] Firebase rules are not permissive
[ ] Firestore rules tested
[ ] Realtime DB rules tested
[ ] Upload size limits exist
[ ] File type/content validation exists
[ ] OCR processing limits exist
[ ] Geometry complexity limits exist
[ ] API rate limiting exists
[ ] Login abuse protection is addressed
[ ] Secrets are environment-managed
[ ] .env files are ignored
[ ] Secret scanning exists
[ ] Dependency scanning exists
[ ] Production secrets never live in client code
[ ] Errors do not expose internals
[ ] Audit trail exists
[ ] Sensitive exports are protected
[ ] Document access is authorized
[ ] Concurrency protection exists
[ ] Production/staging/demo environments are separated
```

---

# 186. Team Rule — Security Before Demo

Before showing Bhu-Git publicly:

```text
CHECK SOURCE CODE
        ↓
CHECK .env / secrets
        ↓
CHECK Firebase rules
        ↓
CHECK API authorization
        ↓
CHECK upload limits
        ↓
CHECK demo data
        ↓
CHECK browser-visible network requests
        ↓
CHECK exported files
        ↓
CHECK Git history
```

The demo should use synthetic credentials and synthetic land records whenever possible.

---

# 187. Final Engineering Principle

Bhu-Git follows this security principle:

> **No client-side button, hidden route, or UI restriction is treated as security. Every sensitive action is authenticated, authorized, validated, rate-limited where appropriate, audited, and protected against accidental credential exposure.**
