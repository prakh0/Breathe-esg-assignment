import os
import json
from utils.duckdb import get_connection

def seed_if_needed():
    # File is in /Users/shuprime/Downloads/File_upload and review/preload.json
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    preload_path = os.path.join(BASE_DIR, "preload.json")
    
    if not os.path.exists(preload_path):
        return

    try:
        with open(preload_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to load preload.json: {e}")
        return

    conn = get_connection()

    # Create tables if they don't exist
    conn.execute("""
        CREATE TABLE IF NOT EXISTS file_schemas (
            file_type VARCHAR PRIMARY KEY,
            schema_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS lookup_tables (
            name VARCHAR PRIMARY KEY,
            description TEXT,
            data_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed Schemas
    schema_mapping = {
        "fuel_procurement": "fuel",
        "electricity_bills": "electricity",
        "travel_details": "travel"
    }

    schemas = data.get("schemas", [])
    for schema_obj in schemas:
        json_key = schema_obj.get("name")
        if json_key in schema_mapping:
            file_type = schema_mapping[json_key]
            schema_str = json.dumps(schema_obj)
            conn.execute("""
                INSERT INTO file_schemas (file_type, schema_json)
                VALUES (?, ?)
                ON CONFLICT (file_type) DO NOTHING
            """, [file_type, schema_str])

    # Seed Lookups
    lookups = data.get("lookups", [])
    for lookup_obj in lookups:
        name = lookup_obj.get("name")
        description = lookup_obj.get("description", "")
        data_rows = lookup_obj.get("data", [])
        conn.execute("""
            INSERT INTO lookup_tables (name, description, data_json)
            VALUES (?, ?, ?)
            ON CONFLICT (name) DO NOTHING
        """, [name, description, json.dumps(data_rows)])

    print("DuckDB seeded successfully from preload.json")
