from rest_framework.decorators import api_view
from rest_framework.response import Response
from utils.duckdb import get_connection

@api_view(["GET"])
def get_sessions(request):
    conn = get_connection()
    
    # Check if table exists
    tables = [r[0] for r in conn.execute("SHOW TABLES").fetchall()]
    if "upload_sessions" not in tables:
        return Response({"data": []})
        
    query = "SELECT id, file_type, original_filename, created_at FROM upload_sessions ORDER BY created_at DESC"
    
    try:
        df = conn.execute(query).df()
        # Convert datetime to string for JSON serialization
        for col in df.select_dtypes(include=['datetime64[ns]', 'datetime64[ns, UTC]', '<M8[ns]', 'datetime64']).columns:
            df[col] = df[col].astype(str).replace('NaT', None)
        
        # Replace NaN with None
        df = df.where(df.notnull(), None)
        
        data = df.to_dict(orient="records")
        return Response({"data": data})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
