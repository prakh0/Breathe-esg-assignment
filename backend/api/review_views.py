import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from utils.duckdb import get_connection

@api_view(["GET"])
def get_records(request, file_type):
    conn = get_connection()
    table_name = f"{file_type}_data"
    
    # Check if table exists
    tables = [r[0] for r in conn.execute("SHOW TABLES").fetchall()]
    if table_name not in tables:
        return Response({"data": [], "total": 0})
        
    status = request.GET.get("status")
    batch_id = request.GET.get("batch_id")
    limit = int(request.GET.get("limit", 50))
    offset = int(request.GET.get("offset", 0))
    
    query = f"SELECT * FROM {table_name}"
    params = []
    
    conditions = []
    if status and status != "all":
        conditions.append("status = ?")
        params.append(status)
        
    if batch_id:
        conditions.append("upload_batch_id = ?")
        params.append(batch_id)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    count_query = query.replace("SELECT *", "SELECT COUNT(*)")
    total = conn.execute(count_query, params).fetchone()[0]
    
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    # Fetch results as dict
    df = conn.execute(query, params).df()
    
    # Fill NaN values to None so it can be JSON serialized
    df = df.where(df.notnull(), None)
    
    # DuckDB timestamps might need conversion to string for JSON serialization
    for col in df.select_dtypes(include=['datetime64[ns]']).columns:
        df[col] = df[col].astype(str).replace('NaT', None)

    data = df.to_dict(orient="records")
    
    return Response({"data": data, "total": total})

@api_view(["POST"])
def review_records(request, file_type):
    conn = get_connection()
    table_name = f"{file_type}_data"
    
    record_ids = request.data.get("record_ids", [])
    action = request.data.get("action") # 'approve' or 'reject'
    
    if not record_ids or not action:
        return Response({"error": "Missing record_ids or action"}, status=400)
        
    new_status = "approved" if action == "approve" else "rejected"
    
    placeholders = ", ".join(["?"] * len(record_ids))
    params = [new_status] + record_ids
    
    try:
        conn.execute(f"UPDATE {table_name} SET status = ? WHERE id IN ({placeholders})", params)
        return Response({"message": f"Successfully updated {len(record_ids)} records to {new_status}"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
