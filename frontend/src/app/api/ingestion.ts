import { FileSchema } from "../components/SchemaEditor";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function uploadFile(
    file: File,
    type: string
) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        if (error.errors && Array.isArray(error.errors)) {
            throw new Error(JSON.stringify({ type: "validation_errors", errors: error.errors }));
        }
        throw new Error(error.error || "Upload failed");
    }

    return response.json();
}

export async function saveSchema(type: string, schema: FileSchema) {
    const response = await fetch(`${API_BASE}/schemas/${type}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schema),
    });
    if (!response.ok) throw new Error("Failed to save schema");
    return response.json();
}

export async function fetchSchema(type: string): Promise<FileSchema> {
    const response = await fetch(`${API_BASE}/schemas/${type}/`);
    if (!response.ok) throw new Error("Schema not found");
    return response.json();
}

export async function getRecords(type: string, status?: string, limit = 50, offset = 0, batchId?: string) {
    let url = `${API_BASE}/records/${type}/?limit=${limit}&offset=${offset}`;
    if (status && status !== 'all') {
        url += `&status=${status}`;
    }
    if (batchId) {
        url += `&batch_id=${batchId}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch records");
    return response.json();
}

export async function reviewRecords(type: string, recordIds: string[], action: "approve" | "reject") {
    const response = await fetch(`${API_BASE}/records/${type}/review/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record_ids: recordIds, action }),
    });
    if (!response.ok) throw new Error("Failed to review records");
    return response.json();
}

export async function getSessions() {
    const response = await fetch(`${API_BASE}/sessions/`);
    if (!response.ok) throw new Error("Failed to fetch sessions");
    return response.json();
}

export async function getLookups() {
    const response = await fetch(`${API_BASE}/lookups/`);
    if (!response.ok) throw new Error("Failed to fetch lookups");
    return response.json();
}

export async function getLookup(name: string) {
    const response = await fetch(`${API_BASE}/lookups/${name}/`);
    if (!response.ok) throw new Error("Failed to fetch lookup");
    return response.json();
}

export async function saveLookup(name: string, description: string, data: any[]) {
    const response = await fetch(`${API_BASE}/lookups/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, data }),
    });
    if (!response.ok) throw new Error("Failed to save lookup");
    return response.json();
}