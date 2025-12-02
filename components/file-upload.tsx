"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);
      setProgress(0);
      setStatus("Uploading file...");

      try {
        const formData = new FormData();
        formData.append("file", file);

        setProgress(20);
        setStatus("Processing document...");

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        setProgress(60);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        setProgress(80);
        setStatus("Generating embeddings...");

        const data = await res.json();

        setProgress(100);
        setStatus("Complete!");

        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          setStatus("");
          router.refresh();
        }, 1000);
      } catch (error) {
        console.error("Upload error:", error);
        setStatus(error instanceof Error ? error.message : "Upload failed");
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          setStatus("");
        }, 3000);
      }
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          uploading && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        ) : isDragActive ? (
          <Upload className="h-10 w-10 text-primary" />
        ) : (
          <FileText className="h-10 w-10 text-muted-foreground" />
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the file here"
            : "Drag & drop a file here, or click to select"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">PDF or TXT up to 10MB</p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-center text-sm text-muted-foreground">{status}</p>
        </div>
      )}
    </div>
  );
}
