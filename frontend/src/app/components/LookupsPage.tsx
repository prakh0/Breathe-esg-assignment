import { useState, useEffect } from "react";
import { getLookups, getLookup, saveLookup } from "../api/ingestion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";

type LookupRow = Record<string, any>;

export default function LookupsPage() {
  const [lookups, setLookups] = useState<any[]>([]);
  const [selectedLookup, setSelectedLookup] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<LookupRow[]>([]);

  const [editMode, setEditMode] = useState<"visual" | "json">("visual");
  const [jsonValue, setJsonValue] = useState("[]");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const loadList = async () => {
    try {
      const res = await getLookups();
      setLookups(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const selectLookup = async (lname: string) => {
    try {
      const res = await getLookup(lname);
      setName(res.name);
      setDescription(res.description || "");
      setRows(res.data || []);
      setJsonValue(JSON.stringify(res.data || [], null, 2));
      setSelectedLookup(res.name);
      setEditMode("visual");
      setJsonError(null);
    } catch (e) {
      console.error(e);
    }
  };

  const createNew = () => {
    setSelectedLookup("new");
    setName("");
    setDescription("");
    setRows([{ key: "", value: "", aliases: [] }]);
    setJsonValue(JSON.stringify([{ key: "", value: "", aliases: [] }], null, 2));
    setEditMode("visual");
    setJsonError(null);
  };

  const handleTabChange = (mode: string) => {
    if (mode === "visual") {
      try {
        const parsed = JSON.parse(jsonValue);
        setRows(parsed);
        setJsonError(null);
        setEditMode("visual");
      } catch (e) {
        setJsonError("Invalid JSON format - cannot switch to Visual Editor");
      }
    } else {
      setJsonValue(JSON.stringify(rows, null, 2));
      setEditMode("json");
    }
  };

  const handleSave = async () => {
    if (!name) return alert("Name is required");
    
    let currentRows = rows;
    if (editMode === "json") {
      try {
        currentRows = JSON.parse(jsonValue);
        setRows(currentRows);
      } catch (e) {
        setJsonError("Invalid JSON format");
        return;
      }
    }
    
    try {
      await saveLookup(name, description, currentRows);
      alert("Saved successfully!");
      loadList();
      setSelectedLookup(name);
    } catch (e) {
      alert("Failed to save");
    }
  };

  return (
    <div className="p-8 flex h-[calc(100vh-4rem)]">
      <div className="w-64 border-r pr-6 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Lookup Tables</h2>
          <Button size="sm" variant="outline" onClick={createNew}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {lookups.map((l) => (
            <button
              key={l.name}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedLookup === l.name ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
              }`}
              onClick={() => selectLookup(l.name)}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 pl-8 overflow-y-auto">
        {selectedLookup ? (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedLookup === "new" ? "New Lookup Table" : name}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} disabled={selectedLookup !== "new"} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Data Rows</h3>
                {editMode === "visual" && (
                  <Button size="sm" variant="outline" onClick={() => {
                    if (rows.length === 0) {
                      setRows([{ key: "", value: "", aliases: [] }]);
                    } else {
                      const columns = Object.keys(rows[0]);
                      const newRow: Record<string, any> = {};
                      columns.forEach(col => {
                        newRow[col] = Array.isArray(rows[0][col]) ? [] : "";
                      });
                      setRows([...rows, newRow]);
                    }
                  }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Row
                  </Button>
                )}
              </div>

              <Tabs value={editMode} onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                  <TabsTrigger value="visual">Visual Editor</TabsTrigger>
                  <TabsTrigger value="json">JSON Editor</TabsTrigger>
                </TabsList>

                <TabsContent value="visual">
                  <div className="rounded-md border bg-card overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          {rows.length > 0 && Object.keys(rows[0]).map(col => (
                            <th key={col} className="p-3 text-left font-medium">{col}</th>
                          ))}
                          <th className="p-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            {Object.keys(row).map(col => (
                              <td key={col} className="p-2">
                                <Input 
                                  value={Array.isArray(row[col]) ? row[col].join(", ") : (row[col] === null ? "" : row[col])} 
                                  onChange={e => {
                                    const newRows = [...rows];
                                    newRows[i][col] = Array.isArray(row[col]) 
                                      ? e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                      : e.target.value;
                                    setRows(newRows);
                                  }} 
                                />
                              </td>
                            ))}
                            <td className="p-2 text-right">
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">No rows defined</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="json" className="space-y-4">
                  {jsonError && (
                    <Alert variant="destructive">
                      <AlertDescription>{jsonError}</AlertDescription>
                    </Alert>
                  )}
                  <Textarea
                    value={jsonValue}
                    onChange={(e) => {
                      setJsonValue(e.target.value);
                      setJsonError(null);
                    }}
                    className="font-mono min-h-[300px]"
                    placeholder="Enter JSON rows data..."
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Lookup Table</Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a lookup table or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
