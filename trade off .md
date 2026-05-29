# Deliberately Excluded Features

This project focuses on ESG data ingestion, normalization, review, and auditability. Several features commonly found in production ESG platforms were intentionally not implemented in order to keep the scope manageable and focus on the core data engineering challenges.

---

## 1. Emissions Calculation Engine

### Not Built

The platform does not calculate CO₂e emissions or manage emission factors.

Examples of excluded functionality:

* Emission factor databases
* Country-specific emission factors
* Automatic CO₂e calculations
* GHG Protocol calculations

### Why

The primary goal of this project is to normalize heterogeneous ESG activity data from multiple sources into a canonical schema.

Emission calculations depend on:

* Reporting framework
* Geography
* Emission factor source
* Customer-specific business rules

Building a reliable emissions engine would significantly increase complexity and distract from the ingestion and normalization challenges that are the focus of this assignment.

### Future Improvement

Add an emissions calculation service that consumes normalized records and applies configurable emission factors.

---

## 2. OCR-Based PDF Processing

### Not Built

The platform does not automatically extract data from scanned utility bills or PDF documents.

Examples:

* Scanned electricity bills
* Invoice PDFs
* Image-based reports

### Why

PDF extraction requires:

* OCR pipelines
* Document classification
* Provider-specific parsing logic
* Error handling for low-quality scans

The assignment focuses on data ingestion and normalization rather than document processing challenges.

For this reason, only structured datasets such as CSV exports are supported.

### Future Improvement

Introduce OCR processing using tools such as Tesseract or cloud document AI services and feed extracted data into the existing normalization pipeline.

---

## 3. Real-Time Streaming Ingestion

### Not Built

The platform processes uploaded datasets in batches rather than ingesting data continuously through streaming systems.

Examples of excluded functionality:

* Kafka-based ingestion
* Event-driven pipelines
* Real-time utility meter feeds
* Live travel booking integrations

### Why

Most ESG reporting workflows operate on periodic datasets such as:

* Monthly utility reports
* Quarterly procurement exports
* Travel reports
* Manual spreadsheet uploads

Batch processing significantly simplifies the architecture while still addressing the most common ESG onboarding use cases.

### Future Improvement

Introduce a streaming ingestion layer for organizations that require near real-time ESG data processing.



## 4. Automatic Schema Detection

### Not Built

The platform does not automatically infer the structure of uploaded files.

Before uploading data, users must create or select a schema definition that maps source columns to canonical fields.

Examples:

- SAP Fuel Schema
- Utility Electricity Schema
- Corporate Travel Schema

Users must perform an initial schema setup before uploading files.

This increases onboarding effort but improves data quality and transformation accuracy.

### Why

Real-world ESG datasets use highly inconsistent column names and structures.

For example, the same field may appear as:

| Source A | Source B | Source C |
|-----------|-----------|-----------|
| Fuel Type | Material Description | Product Name |

Automatic schema inference would require:

- Column matching algorithms
- Heuristic field detection
- Confidence scoring
- Manual correction workflows

Instead, the platform requires users to predefine schemas, ensuring deterministic and predictable transformations.

This significantly reduces ingestion errors and makes the normalization process transparent.

### Future Improvement

Introduce schema suggestion and auto-mapping features that recommend mappings while still allowing user review and approval.

---

# Summary

The project deliberately prioritizes:

* Data ingestion
* Defining Schema 
* Lookup-based normalization
* Scope categorization
* Review workflows
* Auditability
* Source traceability

over advanced capabilities such as emissions calculations, OCR document extraction, and real-time streaming. These features can be added later without requiring major changes to the core data model.
