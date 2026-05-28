import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadFile } from "../api/ingestion";

interface FileUpload {
  type: "fuel" | "electricity" | "travel";
  file: File | null;
  errors: string[];
  validated: boolean;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<FileUpload[]>([
    { type: "fuel", file: null, errors: [], validated: false },
    { type: "electricity", file: null, errors: [], validated: false },
    { type: "travel", file: null, errors: [], validated: false },
  ]);

  const handleFileChange = (index: number, file: File | null) => {
    const newUploads = [...uploads];
    newUploads[index].file = file;
    newUploads[index].errors = [];
    newUploads[index].validated = false;
    setUploads(newUploads);
  };

  const validateFile = async (index: number) => {
    const upload = uploads[index];
    if (!upload.file) return;

    setUploads(prev => {
      const next = [...prev];
      next[index] = { ...next[index], validated: false, errors: [] };
      return next;
    });

    const errors: string[] = [];
    const fileExtension = upload.file.name.split(".").pop()?.toLowerCase() || "";

    if (upload.type === "fuel" && fileExtension !== "csv") {
      errors.push("Fuel and procurement file must be a CSV");
    }

    if (upload.type === "electricity" && fileExtension !== "csv") {
      errors.push("Electricity bills must be CSV");
    }

    if (upload.type === "travel" && fileExtension !== "csv") {
      errors.push("Travel details must be CSV");
    }

    if (upload.file.size > 10 * 1024 * 1024) {
      errors.push("File size must be less than 10MB");
    }

    if (errors.length > 0) {
      setUploads(prev => {
        const next = [...prev];
        next[index] = { ...next[index], validated: false, errors };
        return next;
      });
      return;
    }

    try {
      await uploadFile(upload.file, upload.type);

      setUploads(prev => {
        const next = [...prev];
        next[index] = { ...next[index], validated: true, errors: [] };
        return next;
      });

    } catch (error) {
      const raw = error instanceof Error ? error.message : "Upload failed";

      let errs = [raw];
      try {
        const parsed = JSON.parse(raw);
        if (parsed.type === "validation_errors") {
          errs = parsed.errors;
        }
      } catch (e) {
        const match = raw.match(/VALIDATION ERRORS:\s*\[(.+)\]/);
        if (match) {
          errs = match[1]
            .split(",")
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
        }
      }

      setUploads(prev => {
        const next = [...prev];
        next[index] = { ...next[index], validated: false, errors: errs };
        return next;
      });
    }
  };

  const allFilesValid = uploads.every((u) => u.validated && u.errors.length === 0 && u.file !== null);

  const getUploadTitle = (type: string) => {
    switch (type) {
      case "fuel":
        return "Fuel and Procurement CSV";
      case "electricity":
        return "Electricity Bills";
      case "travel":
        return "Travel Details";
      default:
        return type;
    }
  };

  const handleContinue = () => {
    navigate("/review");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload your files to validate and process data before proceeding to review.
          </p>
        </div>

        <div className="space-y-4">
          {uploads.map((upload, index) => (
            <Card key={upload.type}>
              <CardHeader>
                <CardTitle>{getUploadTitle(upload.type)}</CardTitle>
                <CardDescription>
                  {upload.type === "fuel" && "Upload CSV file with fuel and procurement data"}
                  {upload.type === "electricity" && "Upload electricity bill (CSV)"}
                  {upload.type === "travel" && "Upload travel details (CSV)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id={`file-${upload.type}`}
                    className="hidden"
                    accept=".csv"
                    onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                  />
                  <label htmlFor={`file-${upload.type}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => document.getElementById(`file-${upload.type}`)?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                  </label>

                  {upload.file && (
                    <span className="text-sm text-muted-foreground">{upload.file.name}</span>
                  )}

                  {upload.file && (
                    <Button onClick={() => validateFile(index)}>
                      {upload.validated ? "Re-validate" : "Validate"}
                    </Button>
                  )}

                  {upload.validated && upload.errors.length === 0 && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Validated
                    </span>
                  )}
                </div>

                {upload.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {upload.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleContinue} disabled={!allFilesValid} size="lg">
            Continue to Review
          </Button>
        </div>
      </div>
    </div>
  );
}
