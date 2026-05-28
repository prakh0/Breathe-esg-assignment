import os
import json
import uuid
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage

from utils.duckdb import get_connection
from .services import parse_csv, validate_schema, normalize_dataframe

@api_view(["POST"])
def upload_file(request):
    try:
        uploaded_file = request.FILES.get("file")
        file_type = request.POST.get("type")

        if not file_type:
            return Response({"error": "File type not provided"}, status=400)

        conn = get_connection()
        
        # Fetch schema from DuckDB
        schema_result = conn.execute("SELECT schema_json FROM file_schemas WHERE file_type = ?", [file_type]).fetchone()
        if not schema_result:
            return Response({"error": f"No schema defined for file type: {file_type}"}, status=400)
            
        schema = json.loads(schema_result[0])

        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=400)

        # Ensure upload directories exist
        os.makedirs("uploads", exist_ok=True)
        os.makedirs("../data", exist_ok=True)

        file_path = default_storage.save(f"uploads/{uploaded_file.name}", uploaded_file)
        full_path = os.path.join("uploads", uploaded_file.name)

        if uploaded_file.name.endswith(".csv"):
            df = parse_csv(full_path)
        else:
            return Response({"error": "Unsupported file type. Only CSV is allowed."}, status=400)

        errors = validate_schema(df, schema)
        if errors:
            return Response({"success": False, "errors": errors}, status=400)

        df = normalize_dataframe(df, schema)
        
        # Add batch tracking
        batch_id = str(uuid.uuid4())
        df["upload_batch_id"] = batch_id

        # Log session
        conn.execute('''
            CREATE TABLE IF NOT EXISTS upload_sessions (
                id VARCHAR PRIMARY KEY,
                file_type VARCHAR,
                original_filename VARCHAR,
                created_at TIMESTAMP
            )
        ''')
        conn.execute('''
            INSERT INTO upload_sessions (id, file_type, original_filename, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', [batch_id, file_type, uploaded_file.name])

        # DuckDB integration
        table_name = f"{file_type}_data"
        conn.register("temp_df", df)
        
        # Create table if it doesn't exist, then insert
        tables = [r[0] for r in conn.execute("SHOW TABLES").fetchall()]
        if table_name not in tables:
            conn.execute(f"CREATE TABLE {table_name} AS SELECT * FROM temp_df")
        else:
            # We must ensure schemas match, DuckDB INSERT by name is possible via Pandas append
            # Or INSERT INTO {table_name} SELECT * FROM temp_df by Name
            # But the columns in temp_df might be ordered differently or have missing columns.
            # DuckDB allows appending pandas df directly:
            # wait, conn.append(table_name, df) is the pandas way but it might fail if columns don't match perfectly.
            # Using INSERT with column names:
            cols = ", ".join([f'"{c}"' for c in df.columns])
            conn.execute(f"INSERT INTO {table_name} ({cols}) SELECT {cols} FROM temp_df")

        return Response({
            "message": "File uploaded successfully",
            "table": table_name,
            "rows": len(df),
            "columns": list(df.columns),
            "failed_rows": len(df[df["status"] == "failed"])
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)
