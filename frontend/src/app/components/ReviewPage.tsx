import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Check, X, Filter } from "lucide-react";
import { getRecords, reviewRecords } from "../api/ingestion";

interface DataRow {
  id: string;
  status: "pending" | "approved" | "failed";
  error_message?: string;
  [key: string]: any;
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "fuel";
  const batchId = searchParams.get("batch_id") || undefined;

  const [activeTab, setActiveTab] = useState(initialType);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [currentData, setCurrentData] = useState<DataRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      // Fetch specifically for this batchId if provided
      const response = await getRecords(activeTab, statusFilter, itemsPerPage, offset, batchId);
      setCurrentData(response.data || []);
      setTotalRecords(response.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      setCurrentData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setSelectedRows(new Set());
  }, [activeTab, statusFilter, currentPage, batchId]);

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(currentData.map((row) => row.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleAction = async (ids: string[], action: "approve" | "reject") => {
    try {
      await reviewRecords(activeTab, ids, action);
      // Reload data to reflect new status
      loadData();
      setSelectedRows(new Set());
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  const allSelected = currentData.length > 0 && currentData.every((row) => selectedRows.has(row.id));

  // Determine dynamic columns based on the data
  const dataColumns = useMemo(() => {
    if (currentData.length === 0) return [];
    // Exclude internal columns
    const exclude = ["id", "status", "error_message", "upload_batch_id"];
    const allKeys = Object.keys(currentData[0]);
    return allKeys.filter((k) => !exclude.includes(k));
  }, [currentData]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1>Review Data</h1>
              <p className="text-muted-foreground mt-1">
                {batchId ? (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium mr-2">
                    Session: {batchId.substring(0, 8)}...
                  </span>
                ) : null}
                Review and approve or discard uploaded data
              </p>
            </div>
          </div>

          {selectedRows.size > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleAction(Array.from(selectedRows), "approve")}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve Selected ({selectedRows.size})
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction(Array.from(selectedRows), "reject")}
              >
                <X className="mr-2 h-4 w-4" />
                Reject Selected ({selectedRows.size})
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v);
          setCurrentPage(1);
        }}>
          <TabsList>
            <TabsTrigger value="fuel">Fuel & Procurement</TabsTrigger>
            <TabsTrigger value="electricity">Electricity</TabsTrigger>
            <TabsTrigger value="travel">Travel</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="failed">Failed / Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    {dataColumns.map(col => (
                      <TableHead key={col} className="capitalize">{col}</TableHead>
                    ))}
                    <TableHead>Error Message</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                       <TableCell colSpan={dataColumns.length + 4} className="text-center py-8">Loading...</TableCell>
                     </TableRow>
                  ) : currentData.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={dataColumns.length + 4} className="text-center py-8">No records found.</TableCell>
                     </TableRow>
                  ) : currentData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(row.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "approved"
                              ? "default"
                              : row.status === "failed" || row.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      {dataColumns.map(col => (
                        <TableCell key={col}>{row[col] !== null ? String(row[col]) : "-"}</TableCell>
                      ))}
                      <TableCell className="text-xs text-red-500 max-w-[200px] truncate" title={row.error_message}>
                        {row.error_message}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction([row.id], "approve")}
                            disabled={row.status === "approved"}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction([row.id], "reject")}
                            disabled={row.status === "failed" || row.status === "rejected"}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {currentData.length} rows (Total: {totalRecords})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2 text-sm">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
