"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { FileDropzone } from "@/components/forms/file-dropzone";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
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
              <DatePicker
                disabled={disabled}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
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
              <FormDescription>
                Deixe em branco para gerar automaticamente a página pública da
                campanha (botão &quot;Saiba mais&quot;).
              </FormDescription>
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

const MAX_GALLERY_IMAGES = 8;

function GalleryField({ disabled }: { disabled: boolean }) {
  const form = useFormContext<CampaignWizardStateInput>();
  const [manualUrl, setManualUrl] = useState("");

  return (
    <FormField
      control={form.control}
      name="field.imagens"
      render={({ field }) => {
        const images = field.value ?? [];
        const isFull = images.length >= MAX_GALLERY_IMAGES;

        const addUrl = (url: string) => {
          const trimmed = url.trim();
          if (!trimmed || isFull) return;
          field.onChange([...images, trimmed]);
        };

        const removeAt = (index: number) => {
          field.onChange(images.filter((_, i) => i !== index));
        };

        return (
          <FormItem className="min-w-0 lg:col-span-2">
            <FormLabel>
              Galeria da página pública ({images.length}/{MAX_GALLERY_IMAGES})
            </FormLabel>
            <FormControl>
              <div className="min-w-0 space-y-3">
                <FileDropzone
                  assetType={FileAssetType.imagem}
                  className="w-full min-w-0"
                  disabled={disabled || isFull}
                  label="Arraste fotos ou clique para adicionar à galeria"
                  description={
                    isFull
                      ? "Limite de imagens atingido. Remova uma para adicionar outra."
                      : "As fotos aparecem em grade na página pública da campanha."
                  }
                  onUploadComplete={(asset) => addUrl(asset.url)}
                />

                <div className="flex gap-2">
                  <Input
                    disabled={disabled || isFull}
                    placeholder="Ou cole a URL da imagem"
                    value={manualUrl}
                    onChange={(event) => setManualUrl(event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || isFull || !manualUrl.trim()}
                    onClick={() => {
                      addUrl(manualUrl);
                      setManualUrl("");
                    }}
                  >
                    Adicionar imagem
                  </Button>
                </div>

                {images.length > 0 ? (
                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {images.map((url, index) => (
                      <li
                        key={`${url}-${index}`}
                        className="group bg-muted relative aspect-square overflow-hidden rounded-md border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Imagem ${index + 1} da galeria`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => removeAt(index)}
                          aria-label={`Remover imagem ${index + 1} da galeria`}
                          className="bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground absolute top-1 right-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        >
                          <X className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export function CampaignImageEditor({
  disabled = false,
}: CampaignImageEditorProps) {
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

      <GalleryField disabled={disabled} />
    </div>
  );
}
