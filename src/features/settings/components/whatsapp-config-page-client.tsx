"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  getWhatsAppConfigAction,
  updateWhatsAppConfigAction,
} from "@/actions/whatsapp-config";
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
import { toast } from "@/lib/toast";
import {
  whatsappConfigUpdateSchema,
  type WhatsAppConfigUpdateInput,
} from "@/schemas/whatsapp-config";
import { formatPhoneBR } from "@/utils/format-phone";

type WhatsAppConfigPageClientProps = {
  canWrite: boolean;
};

const QUERY_KEY = ["whatsapp-config"];

export function WhatsAppConfigPageClient({
  canWrite,
}: WhatsAppConfigPageClientProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const configQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const result = await getWhatsAppConfigAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  const form = useForm<WhatsAppConfigUpdateInput>({
    resolver: zodResolver(whatsappConfigUpdateSchema),
    defaultValues: { displayName: "", phoneNumber: "", signature: "" },
  });

  useEffect(() => {
    if (configQuery.data) {
      form.reset({
        displayName: configQuery.data.displayName,
        phoneNumber: configQuery.data.phoneNumber,
        signature: configQuery.data.signature ?? "",
      });
    }
  }, [configQuery.data, form]);

  function onSubmit(values: WhatsAppConfigUpdateInput) {
    startTransition(async () => {
      const result = await updateWhatsAppConfigAction(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Configuração de WhatsApp salva.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    });
  }

  if (configQuery.isLoading) {
    return (
      <p className="text-muted-foreground text-sm">
        Carregando configuração...
      </p>
    );
  }

  if (configQuery.error) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
        {configQuery.error.message}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-2xl gap-5"
      >
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de exibição</FormLabel>
              <FormControl>
                <Input
                  placeholder="MG Marketing"
                  disabled={!canWrite || isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input
                  placeholder="(11) 99999-0000"
                  disabled={!canWrite || isPending}
                  {...field}
                  onChange={(event) =>
                    field.onChange(formatPhoneBR(event.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="signature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assinatura (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Equipe MG Marketing"
                  disabled={!canWrite || isPending}
                  {...field}
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                Anexada como último bloco das mensagens WhatsApp enviadas em
                campanhas.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {canWrite ? (
          <div className="pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        ) : null}
      </form>
    </Form>
  );
}
