# Design Decisions, Assumptions, and Open Questions

The assignment intentionally leaves several implementation details unspecified. This document records the assumptions made during development, the decisions taken, the reasoning behind them, and the questions that would be discussed with a Product Manager (PM) in a real-world project.

---

## 1. Canonical Schema vs Source-Specific Storage

### Ambiguity

The assignment does not specify whether uploaded data should remain in source-specific formats or be transformed into a common structure.

### What I Chose

All valid records are transformed into a canonical schema after ingestion.

### Why

The supported data sources use different:

* Column names
* Units
* Naming conventions
* Data structures

A canonical schema simplifies:

* Validation
* Review workflows
* Data analysis
* Future reporting

### What I Would Ask The PM

* Should customers be allowed to extend the canonical schema with custom fields?
* Are there mandatory fields that must exist for every data source?

---

## 2. Manual Schema Definitions vs Automatic Schema Detection

### Ambiguity

The assignment does not define how uploaded files should be mapped to the canonical schema.

### What I Chose

Users must create or select a schema before uploading a file.

### Why

Different organizations often use different column names for the same concept.

Examples:

| Source A  | Source B             |
| --------- | -------------------- |
| Fuel Type | Material Description |
| Quantity  | Qty                  |
| Plant     | Facility             |

Requiring predefined schemas ensures deterministic mappings and reduces transformation errors.

### What I Would Ask The PM

* Should schema definitions be tenant-specific or globally shared?
* Should the platform eventually support automatic schema detection and mapping suggestions?

---

## 3. Invalid Data Handling

### Ambiguity

The assignment does not specify how malformed or incomplete records should be handled.

### What I Chose

Records that fail validation are rejected and excluded from the normalized dataset.

### Why

Accepting invalid records would reduce trust in the resulting dataset and make downstream processing unreliable.

The platform surfaces validation errors so users can review and correct problematic records.

### What I Would Ask The PM

* Should users be allowed to override validation failures?
* Should rejected records be editable and resubmitted?
* Should partially valid files be accepted or completely rejected?

---

## 4. Scope Categorization

### Ambiguity

The assignment requires support for Scope 1, Scope 2, and Scope 3 categorization but does not define categorization rules.

### What I Chose

Scope values are assigned using predefined mappings.

Examples:

| Activity Type | Scope   |
| ------------- | ------- |
| Fuel          | Scope 1 |
| Electricity   | Scope 2 |
| Travel        | Scope 3 |
| Procurement   | Scope 3 |

### Why

This approach provides consistent categorization while keeping the implementation simple.

The platform stores scope metadata but does not calculate emissions.

### What I Would Ask The PM

* Should scope mappings be configurable by customers?
* Which ESG reporting framework should be considered the source of truth?

---

## 5. Lookup-Based Normalization

### Ambiguity

The assignment does not specify how inconsistent source values should be standardized.

### What I Chose

Normalization is performed through configurable lookup tables.

Examples:

| Source Value      | Canonical Value |
| ----------------- | --------------- |
| HSD               | Diesel Fuel     |
| High Speed Diesel | Diesel Fuel     |
| Diesel            | Diesel Fuel     |

### Why

Lookup tables provide a transparent and maintainable way to standardize values without modifying application code.

### What I Would Ask The PM

* Should lookup tables be shared globally?
* Should each tenant maintain its own normalization rules?
* Who owns and approves lookup-table changes?

---

## 6. Audit Trail Design

### Ambiguity

The assignment requires tracking whether records were edited but does not define how edits should be stored.

### What I Chose

All modifications are recorded in an audit log.

### Why

An audit trail provides:

* Accountability
* Change tracking
* Review history
* Compliance support

It allows users to identify what changed, who changed it, and when the change occurred.

### What I Would Ask The PM

* How long should audit records be retained?
* Should deleted records remain recoverable?
* Are there compliance requirements around audit retention?

---

## 7. Multi-Tenancy Strategy

### Ambiguity

The assignment requires multi-tenancy but does not specify the isolation model.

### What I Chose

Each major entity is associated with a tenant identifier.

### Why

This provides logical separation between organizations while keeping the architecture simple and scalable.

### What I Would Ask The PM

* Is logical isolation sufficient?
* Are there security or compliance requirements requiring physical tenant separation?

---

## 8. Duplicate Upload Handling

### Ambiguity

The assignment does not define how duplicate uploads should be managed.

### What I Chose

Duplicate detection was not implemented.

Each upload is treated as an independent ingestion event.

### Why

The primary focus of the project is ingestion, normalization, validation, and traceability.

Duplicate management introduces additional requirements around versioning and record ownership.

### What I Would Ask The PM

* Should duplicate files be automatically detected?
* Should duplicate uploads create a new dataset version or be rejected?

---

# Source-Specific Decisions

---

## SAP Fuel and Procurement Data

### What I Chose To Handle

The implementation supports:

* CSV exports
* Fuel consumption records
* Procurement activity records
* Plant codes
* Quantities
* Units
* Material descriptions

### What I Ignored

The implementation does not support:

* IDocs
* BAPIs
* OData integrations
* Deeply nested SAP structures
* Purchase approval workflows
* Custom SAP modules

### Why

CSV exports are commonly used by sustainability teams and are sufficient to demonstrate normalization, validation, and lookup-table resolution.

### What I Would Ask The PM

* Which SAP export format is most commonly used by customers?
* Is API-based SAP integration required in future releases?

---

## Utility Electricity Data

### What I Chose To Handle

The implementation supports:

* CSV exports
* Meter-based consumption records
* Billing periods
* Electricity usage values
* Unit normalization

### What I Ignored

The implementation does not support:

* PDF invoice parsing
* OCR extraction
* Utility APIs
* Smart-meter streaming data
* Tariff calculations

### Why

Structured CSV data provides enough complexity to demonstrate validation, normalization, and review workflows.

### What I Would Ask The PM

* Do customers primarily provide utility data through CSVs or PDF bills?
* Is OCR support a future requirement?

---

## Corporate Travel Data

### What I Chose To Handle

The implementation supports:

* Flight records
* Rail travel records
* Origin and destination mappings
* Distance-based travel activities

### What I Ignored

The implementation does not support:

* Hotel stays
* Expense reimbursement workflows
* Loyalty programs
* Booking approvals
* Real-time travel APIs

### Why

The goal is to demonstrate ingestion and normalization of travel-related ESG activities rather than complete travel-management functionality.

### What I Would Ask The PM

* Should hotel data be included in future versions?
* Which travel providers are expected to be supported?

---

# Additional Questions For The PM

If a Product Manager were available, I would seek clarification on the following:

1. Should schemas be tenant-specific or globally shared?

2. Should lookup tables be centrally managed or customizable per tenant?

3. Should users be allowed to override validation failures?

4. How should duplicate uploads be handled?

5. Should scope categorization rules be configurable?

6. Is emissions calculation expected in a future phase of the project?

7. What retention policy should apply to rejected records and audit logs?

8. Should automatic schema detection be supported in future releases?

9. Are API-based integrations a priority over file uploads?

10. What level of tenant isolation is required for production deployments?

---

# Summary

The primary design goal was to build a transparent and auditable ESG data onboarding platform.

The key decisions were:

* Transforming data into a canonical schema
* Requiring predefined schemas
* Rejecting invalid records
* Using lookup-table-based normalization
* Storing Scope 1/2/3 classifications
* Maintaining a complete audit trail
* Supporting multi-tenant data ownership

These decisions prioritize predictability, traceability, and data quality while keeping the implementation focused on the assignment's core objective: ingesting and normalizing ESG data from heterogeneous enterprise sources.
