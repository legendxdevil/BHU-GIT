# Bhu-Git — Implementation Decision Log

This log tracks technical and architecture decisions made during the construction of Bhu-Git.

| ID | Decision | Classification | Reason | Affected Components | Status |
|---|---|---|---|---|---|
| DEC-001 | Use Next.js 14/15 App Router with TypeScript | SPECIFIED | Required by master blueprint for application routing, server-side APIs, and UI rendering | All App Routes, Components, APIs | Approved |
| DEC-002 | Use Firebase Auth, Firestore, and Realtime Database | SPECIFIED | Required by master blueprint for identity, durable storage, and live synchronization | Auth, Storage, Realtime sync | Approved |
| DEC-003 | Use Turf.js for client and server-side spatial operations | SPECIFIED | Firestore lacks native spatial queries; Turf performs GeoJSON geometry math | Spatial Engine, Conflict Detection | Approved |
| DEC-004 | Use Leaflet / React-Leaflet with OpenStreetMap tiles | SPECIFIED | Standard open-source GIS interactive map rendering stack | Map components, Parcel Explorer, Review Workspace | Approved |
| DEC-005 | Design System tokens: Ink Black (`#17191c`), Paper White (`#ffffff`), Mist Gray (`#f2f2f3`), Fog White (`#fafafb`), Blush Peach (`#fbe1d1`), Sienna Brown (`#5d2a1a`) | SPECIFIED | Strictly follow Steep-style editorial color palette, 24px card radius, 16px input radius, 9999px pill buttons | UI design system, CSS variables | Approved |
| DEC-006 | Client-side simulation fallback when Firebase env keys are unconfigured | TECHNICAL NECESSITY | Allows running the app and testing end-to-end workflows in a standalone local environment without mandatory cloud setup | Firebase Client/Admin initializers | Approved |
