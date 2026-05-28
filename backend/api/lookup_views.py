import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from utils.duckdb import get_connection

def _ensure_lookup_tables(conn):
    tables = [r[0] for r in conn.execute("SHOW TABLES").fetchall()]
    if "lookup_tables" not in tables:
        conn.execute('''
            CREATE TABLE lookup_tables (
                name VARCHAR PRIMARY KEY,
                description VARCHAR,
                data_json VARCHAR
            )
        ''')

@api_view(["GET", "POST"])
def manage_lookups(request):
    conn = get_connection()
    _ensure_lookup_tables(conn)
    
    if request.method == "GET":
        try:
            df = conn.execute("SELECT name, description FROM lookup_tables").df()
            return Response(df.to_dict(orient="records"))
        except Exception as e:
            return Response({"error": str(e)}, status=500)
            
    elif request.method == "POST":
        name = request.data.get("name")
        description = request.data.get("description", "")
        data = request.data.get("data", []) # List of dicts {key, value, aliases: []}
        
        if not name:
            return Response({"error": "Name is required"}, status=400)
            
        data_json = json.dumps(data)
        try:
            conn.execute('''
                INSERT INTO lookup_tables (name, description, data_json)
                VALUES (?, ?, ?)
                ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, data_json = EXCLUDED.data_json
            ''', [name, description, data_json])
            return Response({"message": f"Lookup table '{name}' saved successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

@api_view(["GET"])
def get_lookup(request, name):
    conn = get_connection()
    _ensure_lookup_tables(conn)
    
    try:
        result = conn.execute("SELECT name, description, data_json FROM lookup_tables WHERE name = ?", [name]).fetchone()
        if not result:
            return Response({"error": "Lookup not found"}, status=404)
            
        return Response({
            "name": result[0],
            "description": result[1],
            "data": json.loads(result[2])
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)
