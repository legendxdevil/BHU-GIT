# Bhu-Git — Testing & Quality Assurance Guide

## Test Suite Architecture

The test strategy for Bhu-Git covers unit tests for math/validation, integration tests for API endpoints, and end-to-end verification for the core user journey.

### 1. Test Commands

```bash
# Type check TypeScript files
npm run typecheck

# Run linter
npm run lint

# Run unit and integration test suite
npm run test

# Run build verification
npm run build
```

---

## 2. Test Coverage Matrix

| Component | Test File | Scope |
|---|---|---|
| Spatial Math & Overlap | `lib/geo/__tests__/geo.test.ts` | Turf.js area, boundary deviation, overlap calculation |
| Conflict Engine | `lib/geo/__tests__/conflict.test.ts` | Multi-dimensional conflict detection and severity classification |
| Evidence Calculator | `lib/geo/__tests__/evidence.test.ts` | Trust score calculation and explanation generation |
| Data Ingestion & Sanitization | `lib/validation/__tests__/upload.test.ts` | File validation, GeoJSON parsing, filename safety |
| Version Commit Logic | `app/api/__tests__/version-commit.test.ts` | Parent pointer validation and atomic version creation |
