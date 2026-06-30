"use client";

// Componente reutilizável de Drag & Drop para upload de arquivos.
// Dispara Server Action no servidor — credenciais R2 nunca chegam ao cliente.
import { useCallback, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { FileUp, Loader2, Upload, X } from "lucide-react";

import {
  uploadFileAction,
  type FileAssetDto,
} from "@/actions/file-upload";
import { Button } from "@/components/ui/button";
import { FileAssetType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { getMaxFileSizeForAssetType } from "@/schemas/file-upload";

type FileDropzoneProps = {
  assetType: FileAssetType;
  onUploadComplete?: (fileAsset: FileAssetDto) => void;
  onError?: (message: string) => void;
  className?: string;
  disabled?: boolean;
  accept?: string;
  label?: string;
  description?: string;
};

const DEFAULT_ACCEPT_BY_TYPE: Partial<Record<FileAssetType, string>> = {
  [FileAssetType.banner]: "image/jpeg,image/png,image/webp,image/gif",
  [FileAssetType.logo]: "image/jpeg,image/png,image/webp,image/svg+xml",
  [FileAssetType.imagem]: "image/jpeg,image/png,image/webp,image/gif",
  [FileAssetType.catalogo]: "application/pdf,image/jpeg,image/png,image/webp",
  [FileAssetType.pdf]: "application/pdf",
};

export function FileDropzone({
  assetType,
  onUploadComplete,
  onError,
  className,
  disabled = false,
  accept,
  label = "Arraste um arquivo ou clique para selecionar",
  description = "O upload é processado no servidor com validação de tipo e tamanho.",
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<FileAssetDto | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const acceptValue = accept ?? DEFAULT_ACCEPT_BY_TYPE[assetType] ?? undefined;

  const uploadFile = useCallback(
    (file: File) => {
      setLocalError(null);

      const maxSize = getMaxFileSizeForAssetType(assetType);
      if (file.size > maxSize) {
        const message = `Arquivo excede o limite de ${Math.round(maxSize / (1024 * 1024))} MB`;
        setLocalError(message);
        onError?.(message);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", assetType);

      startTransition(async () => {
        const result = await uploadFileAction(formData);
        if (!result.success) {
          setLocalError(result.error);
          onError?.(result.error);
          return;
        }
        setPreview(result.fileAsset);
        onUploadComplete?.(result.fileAsset);
      });
    },
    [assetType, onError, onUploadComplete],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length || disabled || isPending) return;
      uploadFile(files[0]!);
    },
    [disabled, isPending, uploadFile],
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled && !isPending) setIsDragging(true);
    },
    [disabled, isPending],
  );

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const showImagePreview =
    preview?.mimeType?.startsWith("image/") && preview.url;

  return (
    <div className={cn("w-full min-w-0 space-y-3", className)}>
      <div
        role="button"
        tabIndex={disabled || isPending ? -1 : 0}
        aria-disabled={disabled || isPending}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => {
          if (!disabled && !isPending) inputRef.current?.click();
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "border-input bg-muted/30 hover:bg-muted/50 focus-visible:ring-ring flex min-h-40 w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none",
          isDragging && "border-primary bg-primary/5",
          (disabled || isPending) && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={acceptValue}
          disabled={disabled || isPending}
          onChange={(event) => handleFiles(event.target.files)}
        />

        {isPending ? (
          <>
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
            <p className="text-sm font-medium">Enviando arquivo...</p>
          </>
        ) : (
          <>
            <div className="bg-background flex size-12 items-center justify-center rounded-full border">
              <Upload className="text-muted-foreground size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-muted-foreground text-xs">{description}</p>
            </div>
            <Button type="button" variant="outline" size="sm" disabled={disabled}>
              <FileUp className="size-4" />
              Selecionar arquivo
            </Button>
          </>
        )}
      </div>

      {localError ? (
        <p role="alert" className="text-destructive text-sm">
          {localError}
        </p>
      ) : null}

      {preview ? (
        <div className="border-input flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-lg border p-3">
          {showImagePreview ? (
            <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md">
              <Image
                src={preview.url}
                alt={preview.filename ?? "Preview"}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            </div>
          ) : (
            <div className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-md">
              <FileUp className="text-muted-foreground size-6" />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-medium">
              {preview.filename ?? "Arquivo enviado"}
            </p>
            <p className="text-muted-foreground truncate text-xs">{preview.url}</p>
            {preview.size ? (
              <p className="text-muted-foreground text-xs">
                {(preview.size / 1024).toFixed(1)} KB
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Limpar preview"
            onClick={(event) => {
              event.stopPropagation();
              clearPreview();
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
