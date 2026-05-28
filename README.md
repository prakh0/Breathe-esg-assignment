# Breathe ESG assignment

An application to ingestion, normalize, and review ESG data regarding Fuel Procurement, Electricity Bills, and Travel Details.

Users can define or edit schemas and lookup tables for different types of data. based on these schemas, the system will validate and normalize the uploaded data. This also comes with a predefined schema for all types of data but users can override it based on their needs.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Django
- **Database:** DuckDB

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

## Usage

1. **Schema Configuration:** Navigate to the **Schemas** and **Lookup Tables** tabs to configure data validation rules. Column aliases and data types must correspond to the structure of the target CSV files.
2. **Data Ingestion:** Upload the raw CSV files (Fuel, Electricity, or Travel) via the **Upload** tab.
3. **Review and Validation:** Check the **Review** tab to inspect the upload session. The interface provides a row-level breakdown of successful mappings and validation errors.
# Breathe-esg-assignment
