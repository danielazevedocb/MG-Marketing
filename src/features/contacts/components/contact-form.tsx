"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  createContactAction,
  listGroupsAction,
  listTagsAction,
  updateContactAction,
  type ContactDto,
} from "@/actions/contacts";
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
import { ContactStatus } from "@/generated/prisma/enums";
import {
  contactFormSchema,
  type ContactFormInput,
} from "@/schemas/contact";

type ContactFormProps = {
  mode: "create" | "edit";
  initialData?: ContactDto;
};

export function ContactForm({ mode, initialData }: ContactFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [groups, setGroups] = useState<{ id: string; nome: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; nome: string }[]>([]);

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      empresa: initialData?.empresa ?? "",
      telefone: initialData?.telefone ?? "",
      email: initialData?.email ?? "",
      status: initialData?.status ?? ContactStatus.Ativo,
      groupIds: initialData?.groupIds ?? [],
      tagIds: initialData?.tagIds ?? [],
    },
  });

  useEffect(() => {
    async function loadOptions() {
      const [groupsResult, tagsResult] = await Promise.all([
        listGroupsAction(),
        listTagsAction(),
      ]);
      if (groupsResult.success) {
        setGroups(groupsResult.data.map((group) => ({
          id: group.id,
          nome: group.nome,
        })));
      }
      if (tagsResult.success) {
        setTags(tagsResult.data.map((tag) => ({
          id: tag.id,
          nome: tag.nome,
        })));
      }
    }

    void loadOptions();
  }, []);

  function onSubmit(values: ContactFormInput) {
    setServerError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createContactAction(values)
          : await updateContactAction(initialData!.id, values);

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      router.push("/contacts");
      router.refresh();
    });
  }

  function toggleId(
    field: "groupIds" | "tagIds",
    id: string,
    checked: boolean,
  ) {
    const current = form.getValues(field);
    const next = checked
      ? [...current, id]
      : current.filter((value) => value !== id);
    form.setValue(field, next, { shouldValidate: true });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-2xl gap-5">
        {serverError ? (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
            {serverError}
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="empresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa" disabled={isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do contato</FormLabel>
              <FormControl>
                <Input placeholder="Opcional" autoComplete="off" dir="ltr" disabled={isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-0000" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contato@empresa.com"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(event.target.value as ContactStatus)
                  }
                  disabled={isPending}
                >
                  <option value={ContactStatus.Ativo}>Ativo</option>
                  <option value={ContactStatus.Inativo}>Inativo</option>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Grupos</legend>
          {groups.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum grupo cadastrado. Crie grupos na listagem de contatos.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {groups.map((group) => (
                <label
                  key={group.id}
                  className="border-input flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.watch("groupIds").includes(group.id)}
                    onChange={(event) =>
                      toggleId("groupIds", group.id, event.target.checked)
                    }
                    disabled={isPending}
                  />
                  {group.nome}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Tags</legend>
          {tags.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma tag cadastrada. Crie tags na listagem de contatos.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="border-input flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.watch("tagIds").includes(tag.id)}
                    onChange={(event) =>
                      toggleId("tagIds", tag.id, event.target.checked)
                    }
                    disabled={isPending}
                  />
                  {tag.nome}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : mode === "create"
                ? "Criar contato"
                : "Salvar alterações"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contacts">Cancelar</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
