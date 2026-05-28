import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getSessions } from "../api/ingestion";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface Session {
  id: string;
  file_type: string;
  original_filename: string;
  created_at: string;
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await getSessions();
        setSessions(response.data || []);
      } catch (error) {
        console.error("Failed to load sessions", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Upload History</h1>
          <p className="text-muted-foreground mt-2">
            View all past upload sessions and revisit them for review
          </p>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>File Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Loading sessions...
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No upload sessions found.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      {session.created_at ? new Date(session.created_at).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="capitalize">{session.file_type}</TableCell>
                    <TableCell>{session.original_filename}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/review?type=${session.file_type}&batch_id=${session.id}`)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
