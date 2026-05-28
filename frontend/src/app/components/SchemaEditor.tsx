import { useState, useEffect } from "react";
import { getLookups } from "../api/ingestion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export interface ColumnSchema {
  name: string;
  aliases: string[];
  type: "string" | "number" | "date" | "enum" | "lookup";
  dateFormat?: string;
  numberFormat?: string;
  enumValues?: string[];
  lookupName?: string;
}

export interface FileSchema {
  name: string;
  columns: ColumnSchema[];
}

interface SchemaEditorProps {
  fileType: "fuel" | "electricity" | "travel";
  schema: FileSchema;
  onSave: (schema: FileSchema) => void;
}

export default function SchemaEditor({ fileType, schema, onSave }: SchemaEditorProps) {
  const [editMode, setEditMode] = useState<"visual" | "json">("visual");
  const [localSchema, setLocalSchema] = useState<FileSchema>(schema);
  const [jsonValue, setJsonValue] = useState(JSON.stringify(schema, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [availableLookups, setAvailableLookups] = useState<any[]>([]);
  useEffect(() => {
    getLookups().then(setAvailableLookups).catch(console.error);
  }, []);

  const handleAddColumn = () => {
    const newColumn: ColumnSchema = {
      name: "",
      aliases: [],
      type: "string",
    };
    setLocalSchema({
      ...localSchema,
      columns: [...localSchema.columns, newColumn],
    });
  };

  const handleDeleteColumn = (index: number) => {
    const newColumns = localSchema.columns.filter((_, i) => i !== index);
    setLocalSchema({
      ...localSchema,
      columns: newColumns,
    });
  };

  const handleColumnChange = (index: number, field: keyof ColumnSchema, value: any) => {
    const newColumns = [...localSchema.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setLocalSchema({
      ...localSchema,
      columns: newColumns,
    });
  };

  const handleAddAlias = (columnIndex: number, alias: string) => {
    if (!alias.trim()) return;
    const newColumns = [...localSchema.columns];
    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      aliases: [...(newColumns[columnIndex].aliases || []), alias.trim()],
    };
    setLocalSchema({
      ...localSchema,
      columns: newColumns,
    });
  };

  const handleRemoveAlias = (columnIndex: number, aliasIndex: number) => {
    const newColumns = [...localSchema.columns];
    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      aliases: newColumns[columnIndex].aliases?.filter((_, i) => i !== aliasIndex) || [],
    };
    setLocalSchema({
      ...localSchema,
      columns: newColumns,
    });
  };

  const handleAddEnumValue = (columnIndex: number, value: string) => {
    if (!value.trim()) return;
    const newColumns = [...localSchema.columns];
    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      enumValues: [...(newColumns[columnIndex].enumValues || []), value.trim()],
    };
    setLocalSchema({
      ...localSchema,
      columns: newColumns,
    });
  };

  const handleRemoveEnumValue = (columnIndex: number, enumIndex: number) => {
    const newColumns = [...localSchema.columns];
    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      enumValues: newColumns[columnIndex].enumValues?.filter((_, i) => i !== enumIndex) || [],
    };
    setLocalSchema({
      ...localSchema,
      columns: newColumns,
    });
  };

  const handleSaveVisual = () => {
    const updated = { ...localSchema };
    setJsonValue(JSON.stringify(updated, null, 2));
    onSave(updated);
  };

  const handleSave = () => {
    if (editMode === "json") {
      try {
        const parsed = JSON.parse(jsonValue);
        setLocalSchema(parsed);
        setJsonError(null);
        onSave(parsed);
      } catch (e) {
        setJsonError("Invalid JSON format");
      }
    } else {
      setJsonValue(JSON.stringify(localSchema, null, 2));
      onSave(localSchema);
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    setJsonError(null);
  };

  const handleTabChange = (v: string) => {
    if (v === "visual") {
      try {
        const parsed = JSON.parse(jsonValue);
        setLocalSchema(parsed);
        setJsonError(null);
        setEditMode("visual");
      } catch (e) {
        setJsonError("Invalid JSON format - cannot switch to Visual Editor.");
      }
    } else {
      setJsonValue(JSON.stringify(localSchema, null, 2));
      setEditMode("json");
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={editMode} onValueChange={handleTabChange}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium">Schema for {fileType.charAt(0).toUpperCase() + fileType.slice(1)}</h3>
            <p className="text-sm text-muted-foreground">
              Define columns, aliases, and validation rules
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <TabsList>
              <TabsTrigger value="visual">Visual Editor</TabsTrigger>
              <TabsTrigger value="json">JSON Editor</TabsTrigger>
            </TabsList>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Schema
            </Button>
          </div>
        </div>

        <TabsContent value="visual" className="space-y-4">
          <Button onClick={handleAddColumn} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Column
          </Button>

          <div className="space-y-4">
            {localSchema.columns.map((column, index) => (
              <Card key={index}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <CardTitle className="text-base">Column {index + 1}</CardTitle>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteColumn(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Column Name</Label>
                      <Input
                        value={column.name}
                        onChange={(e) => handleColumnChange(index, "name", e.target.value)}
                        placeholder="e.g., date, amount, category"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data Type</Label>
                      <Select
                        value={column.type}
                        onValueChange={(v) => handleColumnChange(index, "type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="enum">Enum (Fixed Values)</SelectItem>
                          <SelectItem value="lookup">Lookup Table</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {column.type === "date" && (
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Input
                        value={column.dateFormat || ""}
                        onChange={(e) => handleColumnChange(index, "dateFormat", e.target.value)}
                        placeholder="e.g., YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY"
                      />
                      <p className="text-xs text-muted-foreground">
                        Examples: YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY HH:mm:ss
                      </p>
                    </div>
                  )}

                  {column.type === "number" && (
                    <div className="space-y-2">
                      <Label>Number Format</Label>
                      <Input
                        value={column.numberFormat || ""}
                        onChange={(e) =>
                          handleColumnChange(index, "numberFormat", e.target.value)
                        }
                        placeholder="e.g., #,##0.00, 0.000, #,###"
                      />
                      <p className="text-xs text-muted-foreground">
                        Examples: #,##0.00 (with commas), 0.000 (3 decimals)
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Column Aliases</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add alias (e.g., 'Date', 'Transaction Date')"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddAlias(index, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          handleAddAlias(index, input.value);
                          input.value = "";
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {column.aliases?.map((alias, aliasIndex) => (
                        <Badge key={aliasIndex} variant="secondary">
                          {alias}
                          <button
                            onClick={() => handleRemoveAlias(index, aliasIndex)}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {column.type === "enum" && (
                    <div className="space-y-2">
                      <Label>Valid Values (Enum)</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add valid value"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddEnumValue(index, e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            handleAddEnumValue(index, input.value);
                            input.value = "";
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {column.enumValues?.map((value, enumIndex) => (
                          <Badge key={enumIndex} variant="outline">
                            {value}
                            <button
                              onClick={() => handleRemoveEnumValue(index, enumIndex)}
                              className="ml-2 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {column.type === "lookup" && (
                    <div className="space-y-2">
                      <Label>Lookup Table</Label>
                      <Select
                        value={column.lookupName}
                        onValueChange={(v) => handleColumnChange(index, "lookupName", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lookup table" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLookups.map(l => (
                             <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Values will be validated against keys and aliases in the lookup table, and replaced with the canonical value.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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
            onChange={(e) => handleJsonChange(e.target.value)}
            className="font-mono min-h-[500px]"
            placeholder="Enter JSON schema..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
