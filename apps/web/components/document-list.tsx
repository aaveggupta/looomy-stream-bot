"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/date";

interface Document {
  id: string;
  filename: string;
  isEmbedded: boolean;
  createdAt: Date;
}

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete document");
    } finally {
      setDeleting(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{doc.filename}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(doc.createdAt))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {doc.isEmbedded ? (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Embedded</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-yellow-600">
                <Clock className="h-4 w-4" />
                <span>Processing</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(doc.id)}
              disabled={deleting === doc.id}
            >
              {deleting === doc.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
