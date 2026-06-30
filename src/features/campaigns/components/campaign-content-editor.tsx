"use client";

import { useFormContext } from "react-hook-form";

import { FileDropzone } from "@/components/forms/file-dropzone";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileAssetType } from "@/generated/prisma/enums";
import type { CampaignWizardStateInput } from "@/schemas/campaign";

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-28 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      {...props}
    />
  );
}

type CampaignContentEditorProps = {
  disabled?: boolean;
};

export function CampaignContentEditor({
  disabled = false,
}: CampaignContentEditorProps) {
  const form = useFormContext<CampaignWizardStateInput>();

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="field.titulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input disabled={disabled} {...field} />
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
              <Input disabled={disabled} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="field.texto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Texto</FormLabel>
            <FormControl>
              <Textarea disabled={disabled} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="field.preco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="0,00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="field.desconto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desconto</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="0,00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="field.validade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Validade</FormLabel>
            <FormControl>
              <Input type="date" disabled={disabled} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="field.link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="https://" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="field.botao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto do botão</FormLabel>
              <FormControl>
                <Input disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="field.observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea disabled={disabled} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

type CampaignImageEditorProps = {
  disabled?: boolean;
};

export function CampaignImageEditor({ disabled = false }: CampaignImageEditorProps) {
  const form = useFormContext<CampaignWizardStateInput>();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <FormField
        control={form.control}
        name="field.banner"
        render={({ field }) => (
          <FormItem className="min-w-0">
            <FormLabel>Banner</FormLabel>
            <FormControl>
              <div className="min-w-0 space-y-2">
                <FileDropzone
                  assetType={FileAssetType.banner}
                  className="w-full min-w-0"
                  disabled={disabled}
                  label="Arraste o banner ou clique para enviar"
                  onUploadComplete={(asset) => field.onChange(asset.url)}
                />
                <Input
                  disabled={disabled}
                  placeholder="URL do banner"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="field.imagem"
        render={({ field }) => (
          <FormItem className="min-w-0">
            <FormLabel>Imagem</FormLabel>
            <FormControl>
              <div className="min-w-0 space-y-2">
                <FileDropzone
                  assetType={FileAssetType.imagem}
                  className="w-full min-w-0"
                  disabled={disabled}
                  label="Arraste a imagem ou clique para enviar"
                  onUploadComplete={(asset) => field.onChange(asset.url)}
                />
                <Input
                  disabled={disabled}
                  placeholder="URL da imagem"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
