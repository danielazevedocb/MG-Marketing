"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { changePasswordAction, updateProfileAction } from "@/actions/profile";
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
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "@/schemas/profile";

type ProfilePageClientProps = {
  name: string | null | undefined;
  email: string;
};

export function ProfilePageClient({ name, email }: ProfilePageClientProps) {
  return (
    <div className="grid max-w-2xl gap-8">
      <PersonalDataForm initialName={name ?? ""} email={email} />
      <ChangePasswordForm />
    </div>
  );
}

function PersonalDataForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: initialName },
  });

  function onSubmit(values: UpdateProfileInput) {
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        "Nome atualizado. Pode levar até o próximo login para refletir no menu.",
      );
    });
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Dados pessoais</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input value={email} disabled readOnly />
            </FormControl>
            <p className="text-muted-foreground text-xs">
              O e-mail é o identificador de login e não pode ser alterado aqui.
            </p>
          </FormItem>

          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}

function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const result = await changePasswordAction(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Senha alterada com sucesso.");
    });
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Alterar senha</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha atual</FormLabel>
                <FormControl>
                  <Input type="password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input type="password" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nova senha</FormLabel>
                  <FormControl>
                    <Input type="password" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Alterando..." : "Alterar senha"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
