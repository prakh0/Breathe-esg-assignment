import pandas as pd

def parse_csv(file_path: str) -> pd.DataFrame:
    """Parse CSV file into pandas DataFrame."""
    return pd.read_csv(file_path)

def validate_schema(df: pd.DataFrame, schema: dict) -> list:
    """Validate DataFrame against provided schema."""
    errors = []
    dataframe_columns = [col.lower().strip() for col in df.columns]

    for column in schema.get("columns", []):
        expected_name = column.get("name", "").lower().strip()
        if not expected_name:
            continue

        aliases = [
            alias.lower().strip()
            for alias in column.get("aliases", [])
            if alias.strip()
        ]
        valid_names = [expected_name, *aliases]
        found = any(name in dataframe_columns for name in valid_names)

        if not found:
            errors.append(f"Missing required column: {expected_name}")

    return errors

import uuid

def normalize_dataframe(df: pd.DataFrame, schema: dict) -> pd.DataFrame:
    """Normalize DataFrame columns based on schema and validate row by row."""
    normalized_df = df.copy()
    column_mapping = {}

    for column in schema.get("columns", []):
        canonical_name = column.get("name", "").strip()
        if not canonical_name:
            continue

        aliases = column.get("aliases", [])
        possible_names = [canonical_name, *aliases]

        for df_column in df.columns:
            if df_column.strip().lower() in [name.strip().lower() for name in possible_names]:
                column_mapping[df_column] = canonical_name
                break

    normalized_df = normalized_df.rename(columns=column_mapping)
    
    # Initialize tracking columns
    normalized_df["id"] = [str(uuid.uuid4()) for _ in range(len(normalized_df))]
    normalized_df["status"] = "pending"
    normalized_df["error_message"] = None

    import json
    from utils.duckdb import get_connection

    lookup_cache = {}
    conn = get_connection()
    tables = [r[0] for r in conn.execute("SHOW TABLES").fetchall()]
    has_lookups = "lookup_tables" in tables

    for column in schema.get("columns", []):
        if column.get("type") == "lookup" and has_lookups:
            lookup_name = column.get("lookupName")
            if lookup_name and lookup_name not in lookup_cache:
                result = conn.execute("SELECT data_json FROM lookup_tables WHERE name = ?", [lookup_name]).fetchone()
                if result:
                    lookup_cache[lookup_name] = json.loads(result[0])

    # We use a row-based validation to track errors precisely
    def validate_row(row):
        errors = []
        for column in schema.get("columns", []):
            col_name = column.get("name")
            if col_name not in row.index:
                continue
                
            val = row[col_name]
            if pd.isna(val):
                continue

            col_type = column.get("type", "string")
            try:
                if col_type == "number":
                    row[col_name] = float(str(val).replace(",", ""))
                elif col_type == "date":
                    date_format = column.get("dateFormat")
                    if date_format:
                        # Simple format mapping (this is basic, can be expanded)
                        # Pandas to_datetime can infer if format is not strict
                        row[col_name] = pd.to_datetime(val, format=date_format, errors='raise')
                    else:
                        row[col_name] = pd.to_datetime(val, errors='raise')
                elif col_type == "enum":
                    enum_values = [v.lower().strip() for v in column.get("enumValues", [])]
                    if str(val).lower().strip() not in enum_values:
                        errors.append(f"Invalid value '{val}' for enum {col_name}")
                elif col_type == "lookup":
                    lookup_name = column.get("lookupName")
                    if lookup_name in lookup_cache:
                        lookup_data = lookup_cache[lookup_name]
                        val_str = str(val).lower().strip()
                        matched_value = None
                        for row_data in lookup_data:
                            if val_str == str(row_data.get("key", "")).lower().strip():
                                matched_value = row_data.get("value")
                                break
                            aliases = [str(a).lower().strip() for a in row_data.get("aliases", [])]
                            if val_str in aliases:
                                matched_value = row_data.get("value")
                                break
                        if matched_value is not None:
                            row[col_name] = matched_value
                        else:
                            errors.append(f"Value '{val}' not found in lookup '{lookup_name}'")
                    else:
                        errors.append(f"Lookup table '{lookup_name}' not found")
            except Exception as e:
                errors.append(f"Format error in {col_name}: {str(val)}")

        if errors:
            row["status"] = "failed"
            row["error_message"] = " | ".join(errors)
        return row

    normalized_df = normalized_df.apply(validate_row, axis=1)
    return normalized_df
