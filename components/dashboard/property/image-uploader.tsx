"use client";

import { useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: "uploading" | "done" | "error";
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 8,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);

  async function handleFiles(files: FileList) {
    const remaining = maxFiles - value.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;

    const ids = toUpload.map(() => Math.random().toString(36).slice(2));
    setUploading((prev) => [
      ...prev,
      ...ids.map((id, i) => ({
        id,
        name: toUpload[i].name,
        progress: "uploading" as const,
      })),
    ]);

    const newUrls: string[] = [];

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const id = ids[i];
      try {
        // Get presigned URL
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
          }),
        });
        const { uploadUrl, publicUrl } = await res.json();

        // Upload to R2
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        newUrls.push(publicUrl);
        setUploading((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: "done" } : u)),
        );
      } catch {
        setUploading((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: "error" } : u)),
        );
      }
    }

    onChange([...value, ...newUrls]);
    setUploading((prev) => prev.filter((u) => u.progress !== "done"));
  }

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url) => (
            <div
              key={url}
              className="relative group aspect-square rounded-md overflow-hidden border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Property image"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploading indicators */}
      {uploading.map((u) => (
        <div
          key={u.id}
          className={cn(
            "flex items-center gap-2 text-sm px-3 py-2 rounded-md border",
            u.progress === "error"
              ? "border-destructive text-destructive"
              : "text-muted-foreground",
          )}
        >
          {u.progress === "uploading" && (
            <Loader2 className="size-4 animate-spin shrink-0" />
          )}
          {u.progress === "error" && <X className="size-4 shrink-0 text-destructive" />}
          <span className="truncate">{u.name}</span>
          {u.progress === "error" && (
            <span className="ml-auto text-xs">Failed</span>
          )}
        </div>
      ))}

      {/* Upload button */}
      {value.length < maxFiles && (
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="size-4" />
            Upload Images
            <span className="text-xs text-muted-foreground">
              ({value.length}/{maxFiles})
            </span>
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="images" value={JSON.stringify(value)} />
    </div>
  );
}
