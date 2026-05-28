import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from utils.duckdb import get_connection

@api_view(["GET", "POST"])
def manage_schema(request, file_type):
    conn = get_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS file_schemas (
            file_type VARCHAR PRIMARY KEY,
            schema_json VARCHAR
        )
    ''')

    if request.method == "GET":
        try:
            result = conn.execute("SELECT schema_json FROM file_schemas WHERE file_type = ?", [file_type]).fetchone()
            if result:
                schema_data = json.loads(result[0])
                return Response(schema_data)
            else:
                return Response({"error": "Schema not found for this file type"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    elif request.method == "POST":
        try:
            schema_data = request.data
            schema_json = json.dumps(schema_data)
            conn.execute('''
                INSERT INTO file_schemas (file_type, schema_json)
                VALUES (?, ?)
                ON CONFLICT (file_type) DO UPDATE SET schema_json = EXCLUDED.schema_json
            ''', [file_type, schema_json])
            return Response({"message": "Schema saved successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
