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
import { TemplateType } from "@/generated/prisma/enums";
import type { TemplateFormInput } from "@/schemas/template";

type TemplateEditorProps = {
  disabled?: boolean;
};

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

export function TemplateEditor({ disabled = false }: TemplateEditorProps) {
  const form = useFormContext<TemplateFormInput>();
  const type = form.watch("type");

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="conteudo.titulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input
                placeholder="Título principal da mensagem"
                disabled={disabled}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="conteudo.subtitulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subtítulo</FormLabel>
            <FormControl>
              <Input
                placeholder="Complemento opcional"
                disabled={disabled}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {type === TemplateType.Novidade ? (
        <FormField
          control={form.control}
          name="conteudo.destaque"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destaque</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex.: Lançamento exclusivo"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      {type === TemplateType.Promocao ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="conteudo.precoOriginal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço original</FormLabel>
                <FormControl>
                  <Input placeholder="R$ 199,90" disabled={disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="conteudo.precoPromocional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço promocional</FormLabel>
                <FormControl>
                  <Input placeholder="R$ 149,90" disabled={disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="conteudo.validade"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Validade</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Até 31/12/2026"
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : null}

      {type === TemplateType.Produto ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="conteudo.nomeProduto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do produto</FormLabel>
                <FormControl>
                  <Input placeholder="Nome comercial" disabled={disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="conteudo.preco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input placeholder="R$ 89,90" disabled={disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : null}

      <FormField
        control={form.control}
        name="conteudo.corpo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Texto principal</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva a mensagem que será enviada aos contatos"
                disabled={disabled}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="conteudo.bannerUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Banner</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <FileDropzone
                  assetType={FileAssetType.banner}
                  disabled={disabled}
                  label="Arraste o banner ou clique para enviar"
                  description="JPEG, PNG ou WebP. O upload é validado no servidor."
                  onUploadComplete={(fileAsset) => {
                    field.onChange(fileAsset.url);
                  }}
                />
                {field.value ? (
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                    placeholder="URL do banner"
                  />
                ) : null}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="conteudo.ctaTexto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto do botão</FormLabel>
              <FormControl>
                <Input placeholder="Saiba mais" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="conteudo.ctaUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do botão</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
