"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  createTemplateAction,
  updateTemplateAction,
  type TemplateDto,
} from "@/actions/templates";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TemplateEditor } from "@/features/templates/components/template-editor";
import { TemplatePreview } from "@/features/templates/components/template-preview";
import { TemplateType } from "@/generated/prisma/enums";
import {
  TEMPLATE_TYPE_LABELS,
  templateFormSchema,
  type TemplateFormInput,
} from "@/schemas/template";

const defaultContent: TemplateFormInput["conteudo"] = {
  titulo: "",
  subtitulo: "",
  corpo: "",
  ctaTexto: "",
  ctaUrl: "",
  bannerUrl: "",
  precoOriginal: "",
  precoPromocional: "",
  validade: "",
  nomeProduto: "",
  preco: "",
  destaque: "",
};

type TemplateFormProps = {
  mode: "create" | "edit";
  initialData?: TemplateDto;
};

export function TemplateForm({ mode, initialData }: TemplateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<TemplateFormInput>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      type: initialData?.type ?? TemplateType.Geral,
      category: initialData?.category ?? "",
      favorite: initialData?.favorite ?? false,
      conteudo: initialData?.conteudo ?? defaultContent,
    },
  });

  const watchedType = form.watch("type");
  const watchedContent = form.watch("conteudo");

  function onSubmit(values: TemplateFormInput) {
    setServerError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createTemplateAction(values)
          : await updateTemplateAction(initialData!.id, values);

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      router.push("/templates");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]"
      >
        <div className="space-y-5">
          {serverError ? (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {serverError}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome do template</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Promoção de verão"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(event.target.value as TemplateType)
                      }
                      disabled={isPending}
                    >
                      {Object.values(TemplateType).map((type) => (
                        <option key={type} value={type}>
                          {TEMPLATE_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Sazonal"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <TemplateEditor disabled={isPending} />

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar template"
                  : "Salvar alterações"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/templates">Cancelar</Link>
            </Button>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-8 lg:self-start">
          <div>
            <h2 className="text-sm font-medium">Pré-visualização</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Atualiza em tempo real conforme você edita os campos.
            </p>
          </div>
          <TemplatePreview type={watchedType} content={watchedContent} />
        </aside>
      </form>
    </Form>
  );
}
