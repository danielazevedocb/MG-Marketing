"use client";

import { useFormContext } from "react-hook-form";

import { DualPreviewLazy } from "@/components/marketing/dual-preview-lazy";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { CampaignWizardStateInput } from "@/schemas/campaign";

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      {...props}
    />
  );
}

export function CampaignPreviewStep() {
  const form = useFormContext<CampaignWizardStateInput>();
  const fieldContent = form.watch("field");

  return (
    <div className="space-y-6" data-testid="campaign-preview-step">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Ajustes finais</h3>
          <p className="text-muted-foreground text-sm">
            Alterações abaixo atualizam os previews em tempo real.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="field.titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="field.subtitulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="field.texto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <DualPreviewLazy content={fieldContent} />
    </div>
  );
}
