import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import SchemaEditor, { FileSchema } from "./SchemaEditor";
import { fetchSchema, saveSchema } from "../api/ingestion";

const emptySchema = (name: string): FileSchema => ({
  name,
  columns: [],
});

export default function SchemasPage() {
  const [fuelSchema, setFuelSchema] = useState<FileSchema>(emptySchema("Fuel and Procurement"));
  const [electricitySchema, setElectricitySchema] = useState<FileSchema>(emptySchema("Electricity Bills"));
  const [travelSchema, setTravelSchema] = useState<FileSchema>(emptySchema("Travel Details"));
  const [schemaTab, setSchemaTab] = useState<"fuel" | "electricity" | "travel">("fuel");

  useEffect(() => {
    const loadSchemas = async () => {
      try {
        const fuel = await fetchSchema("fuel");
        setFuelSchema(fuel);
      } catch (e) { /* use default */ }
      try {
        const electricity = await fetchSchema("electricity");
        setElectricitySchema(electricity);
      } catch (e) { /* use default */ }
      try {
        const travel = await fetchSchema("travel");
        setTravelSchema(travel);
      } catch (e) { /* use default */ }
    };
    loadSchemas();
  }, []);

  const setSchemaForType = async (
    type: "fuel" | "electricity" | "travel",
    schema: FileSchema
  ) => {
    try {
      await saveSchema(type, schema);
      if (type === "fuel") setFuelSchema(schema);
      else if (type === "electricity") setElectricitySchema(schema);
      else setTravelSchema(schema);
    } catch (error) {
      console.error("Failed to save schema", error);
      alert("Failed to save schema to database");
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schema Management</h1>
          <p className="text-muted-foreground mt-2">
            Define and manage data schemas for your file uploads
          </p>
        </div>

        <Tabs value={schemaTab} onValueChange={(v) => setSchemaTab(v as "fuel" | "electricity" | "travel")} className="flex flex-col md:flex-row gap-6">
          <TabsList className="flex flex-col h-fit self-start items-stretch justify-start w-48 bg-muted/50 p-2 space-y-1">
            <TabsTrigger value="fuel" className="justify-start">Fuel & Procurement</TabsTrigger>
            <TabsTrigger value="electricity" className="justify-start">Electricity</TabsTrigger>
            <TabsTrigger value="travel" className="justify-start">Travel</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="fuel" className="mt-0">
              <SchemaEditor
                fileType="fuel"
                schema={fuelSchema}
                onSave={(schema) => setSchemaForType("fuel", schema)}
              />
            </TabsContent>

            <TabsContent value="electricity" className="mt-0">
              <SchemaEditor
                fileType="electricity"
                schema={electricitySchema}
                onSave={(schema) => setSchemaForType("electricity", schema)}
              />
            </TabsContent>

            <TabsContent value="travel" className="mt-0">
              <SchemaEditor
                fileType="travel"
                schema={travelSchema}
                onSave={(schema) => setSchemaForType("travel", schema)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
