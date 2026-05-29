# ESG Data Ingestion Platform – Data Model

## Overview

This platform is designed to ingest ESG-related activity data from multiple enterprise sources, validate the data, normalize it into a consistent structure, and provide review and audit workflows.

The platform currently supports three data categories:

* Fuel Data
* Utility Data
* Transport Data

Users upload files, select the appropriate file type and schema, review the processed data, and approve or reject it before it becomes part of the normalized dataset.

The platform focuses on:

* Multi-tenancy
* Schema-driven ingestion
* User-defined lookup tables
* Validation and rejection of bad data
* Scope 1, Scope 2, and Scope 3 categorization
* Review workflows
* Audit history
* Source traceability
* Unit normalization

The platform does not calculate emissions. Its responsibility is to onboard, validate, normalize, and track ESG activity data.

---

# Design Principles

## 1. Validation Before Normalization

All uploaded records are validated before normalization.

Records containing invalid values are rejected and excluded from the final dataset.

Examples:

* Missing required fields
* Invalid dates
* Invalid units
* Unknown lookup values
* Incorrect data types

This prevents low-quality data from entering the system.

---

## 2. Schema-Driven Ingestion

Before uploading a file, users must select a schema.

The schema defines:

* Expected fields
* Data types
* Validation rules

This ensures files are interpreted correctly and reduces ingestion errors.

---

## 3. User-Controlled Normalization

Normalization is performed through lookup tables.

Users can create and manage lookup tables according to their organization's requirements.

This makes the platform flexible without requiring code changes.

---

## 4. Human Review

Uploaded data is reviewed before approval.

Users can inspect processed data and decide whether to:

* Approve
* Reject

This adds a quality-control layer before records are accepted.

---

## 5. Complete Traceability

Every record can be traced back to:

* Original uploaded file
* File type
* Schema used
* Review decision
* History records

This ensures transparency throughout the ingestion lifecycle.

---

# High-Level Data Flow

```text
Upload
   ↓
Validation
   ↓
Schema Mapping
   ↓
Lookup Resolution
   ↓
Review
   ↓
Approve / Reject
   ↓
Normalized Dataset
   ↓
History Tracking
```

---

# Core Entities

## Tenant

Represents an organization using the platform.

### Fields

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| name       | STRING    |
| created_at | TIMESTAMP |

### Why

Supports multi-tenancy by ensuring all uploaded data belongs to a specific organization.

---

## Upload

Represents a file uploaded by a user.

Before uploading, the user selects:

* File Type
* Schema
* File

### Fields

| Field       | Type      |
| ----------- | --------- |
| id          | UUID      |
| file_name   | STRING    |
| file_type   | ENUM      |
| schema_id   | UUID      |
| uploaded_at | TIMESTAMP |
| uploaded_by | STRING    |

### Supported File Types

| File Type | Description                              |
| --------- | ---------------------------------------- |
| Fuel      | Fuel consumption and procurement data    |
| Utility   | Electricity consumption data             |
| Transport | Corporate travel and transportation data |

### Why

The selected file type determines which validation, lookup, and normalization rules are applied.

---

## SchemaDefinition

Defines the expected structure of uploaded files.

Each schema contains a set of fields and data types.

### Fields

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| name       | STRING    |
| file_type  | STRING    |
| created_at | TIMESTAMP |

### Supported Data Types

| Type   |
| ------ |
| string |
| number |
| date   |
| enum   |

### Example

| Field Name   | Data Type |
| ------------ | --------- |
| fuel_type    | string    |
| quantity     | number    |
| posting_date | date      |
| unit         | enum      |

### Why

Schemas ensure uploaded files conform to expected formats before processing begins.

---

## LookupTable

Stores normalization rules.

Users can create lookup tables according to their own requirements.

Examples:

* fuel_material_lookup
* facility_lookup
* unit_lookup
* country_lookup
* airport_station_lookup

### Fields

| Field       | Type      |
| ----------- | --------- |
| id          | UUID      |
| name        | STRING    |
| description | STRING    |
| created_at  | TIMESTAMP |

### Why

Different organizations use different naming conventions.

Lookup tables allow source values to be standardized without modifying application code.

---

## LookupEntry

Stores individual mappings inside a lookup table.

### Fields

| Field           | Type   |
| --------------- | ------ |
| id              | UUID   |
| lookup_table_id | UUID   |
| source_value    | STRING |
| canonical_value | STRING |

### Example

| Source Value      | Canonical Value |
| ----------------- | --------------- |
| HSD               | Diesel Fuel     |
| High Speed Diesel | Diesel Fuel     |
| Diesel            | Diesel Fuel     |

### Why

Ensures inconsistent values are normalized into a common representation.

---

## Review

Represents the review process for uploaded datasets.

After validation and normalization, records are submitted for review.

### Fields

| Field       | Type      |
| ----------- | --------- |
| id          | UUID      |
| upload_id   | UUID      |
| status      | STRING    |
| reviewed_by | STRING    |
| reviewed_at | TIMESTAMP |

### Review Status

| Status   |
| -------- |
| Pending  |
| Approved |
| Rejected |

### Why

Provides human verification before records are accepted into the normalized dataset.

---

## NormalizedRecord

Stores validated and approved records.

### Fields

| Field           | Type      |
| --------------- | --------- |
| id              | UUID      |
| upload_id       | UUID      |
| activity_type   | STRING    |
| scope           | STRING    |
| quantity        | NUMBER    |
| normalized_unit | STRING    |
| facility        | STRING    |
| country         | STRING    |
| created_at      | TIMESTAMP |

### Why

Provides a standardized representation of ESG activity data regardless of source format.

---

## History

Tracks important actions performed on uploaded datasets.

### Fields

| Field     | Type      |
| --------- | --------- |
| id        | UUID      |
| upload_id | UUID      |
| date      | TIMESTAMP |
| file_name | STRING    |
| file_type | STRING    |
| action    | STRING    |

### Supported Actions

| Action   | Description                    |
| -------- | ------------------------------ |
| Uploaded | File uploaded successfully     |
| Approved | Dataset approved during review |
| Rejected | Dataset rejected during review |

### Why

Provides visibility into the lifecycle of uploaded datasets and supports auditability.

---

# Multi-Tenancy

The platform supports multiple organizations through tenant ownership.

Each tenant owns:

```text
Tenant
 ├── Uploads
 ├── Schemas
 ├── Lookup Tables
 ├── Reviews
 ├── History
 └── Normalized Records
```

This ensures data remains logically isolated between organizations.

---

# Scope Categorization

The platform supports Scope 1, Scope 2, and Scope 3 categorization.

Scope is stored as metadata on normalized records.

| Activity Type | Scope   |
| ------------- | ------- |
| Fuel          | Scope 1 |
| Utility       | Scope 2 |
| Transport     | Scope 3 |

The platform stores scope information but does not calculate emissions.

---

# Unit Normalization

Different source files may use different units.

Examples:

| Source Unit | Normalized Unit |
| ----------- | --------------- |
| GAL         | Liters          |
| MWh         | kWh             |
| Miles       | Kilometers      |

Lookup tables and normalization rules convert source values into a consistent representation.

---

# Source-of-Truth Tracking

Every normalized record can be traced back to:

* Original uploaded file
* File type
* Selected schema
* Review decision
* History entries

Relationship:

```text
Upload
   ↓
Review
   ↓
History
   ↓
Normalized Record
```

This allows users to determine:

* Which file produced a record
* When it was uploaded
* Whether it was approved or rejected
* Which schema was used

---

# Validation Strategy

Validation occurs before normalization.

Supported validations include:

* Required field validation
* Data type validation
* Date validation
* Enum validation
* Lookup validation

Records that fail validation are rejected and excluded from the normalized dataset.

This ensures only valid records proceed through the review workflow.

---

# Why This Model

The model separates:

1. Upload
2. Validation
3. Normalization
4. Review
5. History

This separation provides:

* Better traceability
* Easier debugging
* Improved data quality
* Flexible normalization
* Support for multiple source formats

The design focuses on the core challenge of ESG data onboarding: converting inconsistent enterprise data into standardized and reviewable records.

---

# Summary

The platform is built around the following core entities:

1. Tenant
2. Upload
3. SchemaDefinition
4. LookupTable
5. LookupEntry
6. Review
7. NormalizedRecord
8. History

Together these entities support:

* Multi-tenancy
* Schema-driven ingestion
* User-defined lookup tables
* Validation workflows
* Scope categorization
* Unit normalization
* Review and approval processes
* Source traceability
* Audit history

while remaining independent of emissions-calculation logic.
