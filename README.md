# Breathe ESG Assignment

An application to ingestion, normalize, and review ESG data regarding Fuel Procurement, Electricity Bills, and Travel Details.

Users can define or edit schemas and lookup tables for different types of data. Based on these schemas, the system validates and normalizes uploaded data. The application also comes with predefined schemas for all supported data types, but users can customize or override them based on their requirements.

## Tech Stack

* **Frontend:** React, Vite
* **Backend:** Django
* **Database:** DuckDB

---

## Getting Started

### 1. Start the Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

*(The backend runs on `http://localhost:8000`)*

### 2. Start the Frontend (Vite)

```bash
cd frontend
pnpm install
pnpm run dev
```

*(The frontend runs on `http://localhost:5173`)*

---

## Usage

### 1. Schema Configuration

Navigate to the **Schemas** tab to configure validation rules for uploaded files.

Each schema supports:

* Custom column definitions
* Data types
* Required fields
* Column aliases

Supported data types:

* String
* Number
* Date
* Enum

Example:

| Column Name      | Type   | Required | Aliases                       |
| ---------------- | ------ | -------- | ----------------------------- |
| tenant_code      | String | Yes      | tenant, client_code, org_code |
| quantity         | Number | Yes      | qty, amount                   |
| transaction_date | Date   | Yes      | posting_date                  |

Aliases allow files with different column names to be processed using the same schema.

Required fields ensure critical information is always present.

---

### 2. Lookup Table Configuration

Navigate to the **Lookup Tables** tab to configure normalization rules.

Lookup tables allow different source values to be mapped to a standardized value.

Example:

| Source Value      | Canonical Value |
| ----------------- | --------------- |
| HSD               | Diesel Fuel     |
| High Speed Diesel | Diesel Fuel     |
| Diesel            | Diesel Fuel     |

Users can create and manage lookup tables according to their organization's requirements.

Examples:

* fuel_material_lookup
* unit_lookup
* facility_lookup
* country_lookup
* airport_station_lookup

---

### 3. Data Ingestion

Navigate to the **Upload** tab and upload a CSV file.

Before uploading, select:

* File Type

  * Fuel & Procurement
  * Electricity
  * Travel
* Schema
* CSV File

The uploaded file is validated against the selected schema before processing.

---

### 4. Validation & Normalization

Uploaded files are validated against the selected schema.

Validation includes:

* Required field validation
* Data type validation
* Date validation
* Enum validation
* Lookup validation

If a required field cannot be found using either:

* The canonical column name
* One of its aliases

the record is marked as invalid.

After validation, lookup tables are applied to normalize source values into a consistent representation.

Records that fail validation are rejected and displayed during review.

---

### 5. Review Workflow

Every upload creates a review session.

The Review page provides:

* Successfully processed records
* Failed records
* Validation errors
* Normalized values

Users can review uploaded data and choose to:

* Approve
* Reject

Only approved uploads are considered accepted datasets.

---

### 6. History Tracking

The History page provides a record of upload activity.

Each history entry contains:

* Date
* File Name
* File Type
* Action

Supported actions:

* Uploaded
* Approved
* Rejected

This provides traceability throughout the ingestion lifecycle.

---

## Sample Data

Sample datasets are available in the `samples/` directory.

Supported sample sources:

* Fuel & Procurement
* Electricity
* Travel

Each sample file contains both:

### Good Data

Records expected to:

* Pass validation
* Be normalized successfully
* Reach the review stage

### Bad Data

Records intentionally designed to fail validation.

Examples include:

* Missing required fields
* Invalid dates
* Invalid units
* Unknown lookup values
* Missing mappings

Rejected records are displayed during review and are not included in approved datasets.

---

## Project Workflow

```text
Upload
   ↓
Schema Validation
   ↓
Alias Resolution
   ↓
Lookup Resolution
   ↓
Review
   ↓
Approve / Reject
   ↓
History Tracking
```

---

## Documentation

Additional design documents are included in the repository:

### MODEL.md

Describes:

* Data model
* Multi-tenancy
* Scope categorization
* Source-of-truth tracking
* Unit normalization
* History tracking

### DECISIONS.md

Documents:

* Assumptions made
* Ambiguities resolved
* Design decisions
* Questions that would be asked to a PM

### TRADEOFFS.md

Documents features intentionally excluded from the implementation and explains why.

### SOURCES.md

Documents:

* Research performed
* Real-world source formats
* Sample dataset design
* Production limitations and assumptions

---
