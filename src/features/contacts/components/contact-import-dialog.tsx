"use client";

import { FileUp, Server } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import {
  importContactsCsvAction,
  importContactsErpMgAction,
} from "@/actions/contacts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ContactImportResult } from "@/services/contact-import/types";

type ContactImportDialogProps = {
  onImported: () => void;
};

export function ContactImportDialog({ onImported }: ContactImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ContactImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCsvImport() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Selecione um arquivo CSV antes de importar.");
      return;
    }

    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const response = await importContactsCsvAction(formData);
      if (!response.success) {
        setError(response.error);
        return;
      }
      setResult(response.data);
      onImported();
    });
  }

  function handleErpImport() {
    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await importContactsErpMgAction();
      if (!response.success) {
        setError(response.error);
        return;
      }
      setResult(response.data);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileUp className="size-4" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar contatos</DialogTitle>
          <DialogDescription>
            Envie um CSV com as colunas empresa, telefone, email, status e nome.
            Linhas inválidas serão reportadas sem impedir as válidas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="csv-file">
              Arquivo CSV
            </label>
            <input
              id="csv-file"
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button disabled={isPending} onClick={handleCsvImport}>
              <FileUp className="size-4" />
              {isPending ? "Importando..." : "Importar CSV"}
            </Button>
            <Button
              variant="secondary"
              disabled={isPending}
              onClick={handleErpImport}
            >
              <Server className="size-4" />
              ERP MG (em breve)
            </Button>
          </div>

          {error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : null}

          {result ? (
            <div className="bg-muted/40 space-y-2 rounded-md border p-3 text-sm">
              <p>
                <strong>{result.imported}</strong> importado(s),{" "}
                <strong>{result.skipped}</strong> ignorado(s).
              </p>
              {result.message ? <p>{result.message}</p> : null}
              {result.errors.length > 0 ? (
                <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                  {result.errors.slice(0, 8).map((item) => (
                    <li key={`${item.line}-${item.message}`}>
                      Linha {item.line}: {item.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
