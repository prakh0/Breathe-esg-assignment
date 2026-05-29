# SOURCES.md

# Research on Supported Data Sources

## Overview

This platform ingests ESG-related activity data from multiple enterprise systems and normalizes it into a canonical schema using configurable schemas, lookup tables, and validation rules.

The platform currently supports three data sources:

1. SAP Fuel and Procurement Data
2. Utility Electricity Data
3. Corporate Travel Data

For each source, I researched common real-world formats, identified typical data quality issues, and created representative sample datasets.

All sample datasets are included in the `/sample` directory.

---

# Sample Dataset Design

The sample datasets intentionally contain both valid and invalid records.

Each sample file is divided into:

* Good Data (expected to pass validation)
* Bad Data (expected to fail validation)

This was done to demonstrate the platform's validation, review, and error-handling capabilities.

Examples of validation failures include:

* Missing required fields
* Invalid units
* Invalid dates
* Unknown lookup values
* Malformed records
* Missing location mappings

Records that fail validation are rejected during ingestion and surfaced to the user for review.

Rejected records are not included in the final normalized dataset.

This approach better reflects real-world ESG onboarding, where incoming files often contain incomplete, inconsistent, or invalid data.

---

# 1. SAP Fuel and Procurement Data

## Real-World Format Researched

SAP data can be exported in several formats:

* CSV exports
* Flat files
* OData services
* IDocs
* BAPIs

After researching ESG reporting workflows, I found that sustainability and operations teams commonly work with CSV exports generated from SAP reporting transactions because they are easy to share and process.

For this project, CSV exports were chosen as the supported format.

---

## What I Learned

SAP exports are highly organization-specific.

Common challenges include:

* Different column names across deployments
* Internal plant codes requiring lookup tables
* Material descriptions with inconsistent naming
* ERP-specific abbreviations
* Multiple measurement units
* Missing reference data

For example, all of the following values may refer to the same fuel type:

| Source Value      |
| ----------------- |
| Diesel            |
| HSD               |
| High Speed Diesel |
| Diesel Fuel       |

These values require normalization before they can be analyzed consistently.

---

## Sample Data

A representative dataset is included in:

```text
sample/sap_fuel_procurement.csv
```

The dataset contains:

### Good Data

Examples of valid records that:

* Have all required fields
* Use supported units
* Contain known plant codes
* Pass validation successfully

These records proceed through:

* Schema mapping
* Lookup resolution
* Unit normalization
* Scope categorization

### Bad Data

Examples of invalid records that:

* Contain missing quantities
* Use unsupported units
* Reference unknown plant codes
* Contain malformed dates

These records are rejected during ingestion and displayed as validation failures.

---

## Why This Sample Was Chosen

The sample demonstrates realistic SAP data quality challenges and showcases how lookup tables and validation rules standardize incoming records.

---

## What Would Break in a Real Deployment

Potential challenges include:

* Custom SAP schemas
* Localized column names
* Missing plant lookup mappings
* Duplicate exports
* Invalid master data
* Mixed currencies
* Multiple unit systems

---

# 2. Utility Electricity Data

## Real-World Format Researched

Utility providers commonly expose electricity usage data through:

* CSV exports
* Customer portals
* Utility APIs
* PDF invoices

For this project, CSV exports were selected because they provide structured data without requiring OCR processing.

---

## What I Learned

Utility datasets frequently contain:

* Different electricity units
* Estimated consumption values
* Corrected billing periods
* Missing meter identifiers
* Inconsistent facility naming
* Variable billing cycles

Common units include:

* kWh
* MWh
* GWh

These values require normalization before downstream use.

---

## Sample Data

A representative dataset is included in:

```text
sample/utility_electricity.csv
```

The dataset contains:

### Good Data

Records that:

* Include valid facility identifiers
* Use supported electricity units
* Contain complete billing periods
* Pass validation successfully

### Bad Data

Records that:

* Use unsupported units
* Contain missing facility information
* Have invalid billing dates
* Include incomplete consumption values

These records are rejected and flagged for review.

---

## Why This Sample Was Chosen

Electricity consumption is a common ESG reporting input.

The sample demonstrates how the platform handles inconsistent units and facility mappings while enforcing validation rules.

---

## What Would Break in a Real Deployment

Potential issues include:

* Missing meter identifiers
* Utility-specific export formats
* Overlapping billing periods
* Estimated usage corrections
* Timezone inconsistencies
* Scanned PDF bills
* Missing facility mappings

---

# 3. Corporate Travel Data

## Real-World Format Researched

Corporate travel information is commonly sourced from:

* SAP Concur exports
* Travel management systems
* Expense management platforms
* CSV reports
* REST APIs

Most travel systems are designed for expense reporting rather than ESG reporting, creating additional normalization challenges.

For this project, CSV exports were selected as the supported format.

---

## What I Learned

Travel data is often fragmented across multiple activity types:

* Flights
* Rail travel
* Hotels
* Taxi bookings
* Ground transportation

Travel exports frequently contain:

* Airport codes
* Station codes
* Multiple transport types
* Missing distances
* Duplicate expense entries

Lookup tables are required to standardize many of these values.

---

## Sample Data

A representative dataset is included in:

```text
sample/corporate_travel.csv
```

The dataset contains:

### Good Data

Records that:

* Include valid origin and destination codes
* Use supported transport modes
* Contain complete travel information
* Pass validation successfully

### Bad Data

Records that:

* Reference unknown airport codes
* Contain missing destinations
* Include invalid transport types
* Have malformed travel dates

These records are rejected during validation and excluded from the normalized dataset.

---

## Why This Sample Was Chosen

The sample reflects the type of structured travel data commonly exported from travel management systems and demonstrates location normalization and validation workflows.

---

## What Would Break in a Real Deployment

Potential challenges include:

* Multi-leg journeys
* Missing airport mappings
* Missing station mappings
* Duplicate expense submissions
* Cancelled trips
* International timezone handling
* Incomplete travel records

---

# Summary

The three supported sources were selected because they represent common ESG reporting inputs and demonstrate the challenges involved in onboarding enterprise data.

Across all sources, common issues include:

* Inconsistent naming conventions
* Multiple measurement units
* Missing reference data
* Source-specific schemas
* Invalid records
* Duplicate entries

The platform addresses these challenges through:

* Schema mapping
* Lookup-table normalization
* Validation rules
* Unit standardization
* Scope categorization
* Review workflows
* Audit tracking

By including both valid and invalid sample records, the project demonstrates not only successful normalization but also the ability to identify, reject, and report problematic data before it enters the canonical dataset.
