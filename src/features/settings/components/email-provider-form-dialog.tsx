"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Zap } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  createEmailProviderAction,
  testEmailProviderConnectionAction,
  updateEmailProviderAction,
} from "@/actions/email-providers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { EmailProviderCreateInput } from "@/schemas/email-provider";
import { ProviderType } from "@/generated/prisma/enums";
import type { EmailProviderDto } from "@/services/email-providers";

const providerOptions = [
  { value: ProviderType.SMTP, label: "SMTP" },
  { value: ProviderType.Resend, label: "Resend" },
  { value: ProviderType.SendGrid, label: "SendGrid" },
  { value: ProviderType.SES, label: "Amazon SES" },
  { value: ProviderType.Mailgun, label: "Mailgun" },
  { value: ProviderType.Postmark, label: "Postmark" },
] as const;

const formSchema = z
  .object({
    provider: z.nativeEnum(ProviderType),
    name: z.string().trim().min(1, "Informe um nome para o provedor."),
    fromName: z.string().trim().min(1, "Informe o nome do remetente."),
    fromEmail: z.string().trim().email("Email do remetente inválido."),
    host: z.string().optional(),
    port: z.string().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
    secure: z.boolean(),
    apiKey: z.string().optional(),
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
    region: z.string().optional(),
    domain: z.string().optional(),
    serverToken: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    switch (values.provider) {
      case ProviderType.SMTP:
        if (!values.host?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Informe o host SMTP.",
            path: ["host"],
          });
        }
        if (!values.port?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Informe a porta SMTP.",
            path: ["port"],
          });
        }
        if (!values.user?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Informe o usuário SMTP.",
            path: ["user"],
          });
        }
        break;
      case ProviderType.Resend:
      case ProviderType.SendGrid:
        break;
      case ProviderType.SES:
        if (!values.accessKeyId?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Informe o Access Key ID.",
            path: ["accessKeyId"],
          });
        }
        if (!values.region?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Informe a região AWS.",
            path: ["region"],
          });
        }
        break;
      case ProviderType.Mailgun:
        if (!values.domain?.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Informe o domínio do Mailgun.",
            path: ["domain"],
          });
        }
        break;
      case ProviderType.Postmark:
        break;
    }
  });

type FormValues = z.infer<typeof formSchema>;

type EmailProviderFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EmailProviderDto | null;
  onSaved: () => void;
};

function defaultValues(provider: ProviderType = ProviderType.SMTP): FormValues {
  return {
    provider,
    name: "",
    fromName: "",
    fromEmail: "",
    host: "",
    port: "587",
    user: "",
    password: "",
    secure: false,
    apiKey: "",
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-east-1",
    domain: "",
    serverToken: "",
  };
}

function buildCredentials(values: FormValues) {
  switch (values.provider) {
    case ProviderType.SMTP:
      return {
        host: values.host!.trim(),
        port: Number(values.port),
        user: values.user!.trim(),
        password: values.password ?? "",
        secure: values.secure,
      };
    case ProviderType.Resend:
    case ProviderType.SendGrid:
      return { apiKey: values.apiKey ?? "" };
    case ProviderType.SES:
      return {
        accessKeyId: values.accessKeyId!.trim(),
        secretAccessKey: values.secretAccessKey ?? "",
        region: values.region!.trim(),
      };
    case ProviderType.Mailgun:
      return {
        apiKey: values.apiKey ?? "",
        domain: values.domain!.trim(),
      };
    case ProviderType.Postmark:
      return { serverToken: values.serverToken ?? "" };
    default:
      return {};
  }
}

function buildCreatePayload(values: FormValues) {
  return {
    provider: values.provider,
    name: values.name.trim(),
    fromName: values.fromName.trim(),
    fromEmail: values.fromEmail.trim(),
    credentials: buildCredentials(values),
  };
}

function buildUpdatePayload(values: FormValues) {
  const credentials = buildCredentials(values);
  const payload: Record<string, unknown> = {
    provider: values.provider,
    name: values.name.trim(),
    fromName: values.fromName.trim(),
    fromEmail: values.fromEmail.trim(),
    credentials: {},
  };

  switch (values.provider) {
    case ProviderType.SMTP:
      payload.credentials = {
        host: credentials.host,
        port: credentials.port,
        user: credentials.user,
        secure: credentials.secure,
        ...(values.password ? { password: values.password } : {}),
      };
      break;
    case ProviderType.Resend:
    case ProviderType.SendGrid:
    case ProviderType.Mailgun:
      payload.credentials = values.apiKey ? { apiKey: values.apiKey } : {};
      break;
    case ProviderType.SES:
      payload.credentials = {
        accessKeyId: credentials.accessKeyId,
        region: credentials.region,
        ...(values.secretAccessKey
          ? { secretAccessKey: values.secretAccessKey }
          : {}),
      };
      break;
    case ProviderType.Postmark:
      payload.credentials = values.serverToken
        ? { serverToken: values.serverToken }
        : {};
      break;
  }

  return payload;
}

export function EmailProviderFormDialog({
  open,
  onOpenChange,
  initialData,
  onSaved,
}: EmailProviderFormDialogProps) {
  const isEdit = Boolean(initialData);
  const [serverError, setServerError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(),
  });

  const selectedProvider = form.watch("provider");

  useEffect(() => {
    if (!open) {
      return;
    }

    setServerError(null);
    setTestMessage(null);

    if (initialData) {
      form.reset({
        provider: initialData.provider,
        name: initialData.name,
        fromName: initialData.fromName,
        fromEmail: initialData.fromEmail,
        host: initialData.credentialsMeta.host ?? "",
        port: initialData.credentialsMeta.port?.toString() ?? "587",
        user: initialData.credentialsMeta.user ?? "",
        password: "",
        secure: initialData.credentialsMeta.secure ?? false,
        apiKey: "",
        accessKeyId: "",
        secretAccessKey: "",
        region: initialData.credentialsMeta.region ?? "us-east-1",
        domain: initialData.credentialsMeta.domain ?? "",
        serverToken: "",
      });
    } else {
      form.reset(defaultValues());
    }
  }, [open, initialData, form]);

  function onSubmit(values: FormValues) {
    setServerError(null);
    setTestMessage(null);

    startTransition(async () => {
      if (isEdit && initialData) {
        const result = await updateEmailProviderAction(
          initialData.id,
          buildUpdatePayload(values) as Parameters<
            typeof updateEmailProviderAction
          >[1],
        );

        if (!result.success) {
          setServerError(result.error);
          return;
        }
      } else {
        const payload = buildCreatePayload(values);
        if (
          values.provider === ProviderType.SMTP &&
          !payload.credentials.password
        ) {
          setServerError("Informe a senha SMTP.");
          return;
        }
        if (
          (values.provider === ProviderType.Resend ||
            values.provider === ProviderType.SendGrid ||
            values.provider === ProviderType.Mailgun) &&
          !("apiKey" in payload.credentials && payload.credentials.apiKey)
        ) {
          setServerError("Informe a API key.");
          return;
        }
        if (
          values.provider === ProviderType.SES &&
          !payload.credentials.secretAccessKey
        ) {
          setServerError("Informe o Secret Access Key.");
          return;
        }
        if (
          values.provider === ProviderType.Postmark &&
          !payload.credentials.serverToken
        ) {
          setServerError("Informe o Server Token.");
          return;
        }

        const result = await createEmailProviderAction(
          payload as EmailProviderCreateInput,
        );

        if (!result.success) {
          setServerError(result.error);
          return;
        }
      }

      onSaved();
      onOpenChange(false);
    });
  }

  function handleTestConnection() {
    setServerError(null);
    setTestMessage(null);

    void form.trigger().then((valid) => {
      if (!valid) {
        return;
      }

      const values = form.getValues();

      startTransition(async () => {
        const payload = buildCreatePayload(values);

        if (isEdit && initialData) {
          const secretMissing =
            (values.provider === ProviderType.SMTP && !values.password) ||
            ((values.provider === ProviderType.Resend ||
              values.provider === ProviderType.SendGrid ||
              values.provider === ProviderType.Mailgun) &&
              !values.apiKey) ||
            (values.provider === ProviderType.SES &&
              !values.secretAccessKey) ||
            (values.provider === ProviderType.Postmark && !values.serverToken);

          if (secretMissing) {
            const result = await testEmailProviderConnectionAction({
              mode: "saved",
              providerId: initialData.id,
            });

            if (!result.success) {
              setTestMessage({ success: false, message: result.error });
              return;
            }

            setTestMessage(result.data);
            return;
          }
        }

        const result = await testEmailProviderConnectionAction({
          mode: "inline",
          config: payload as EmailProviderCreateInput,
        });

        if (!result.success) {
          setTestMessage({ success: false, message: result.error });
          return;
        }

        setTestMessage(result.data);
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar provedor" : "Novo provedor de email"}
          </DialogTitle>
          <DialogDescription>
            Configure remetente e credenciais. Segredos nunca são exibidos após
            salvar — deixe em branco para manter o valor atual.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      disabled={isEdit}
                      onChange={(event) => {
                        field.onChange(event.target.value as ProviderType);
                      }}
                    >
                      {providerOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome interno</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: SMTP principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fromName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do remetente</FormLabel>
                    <FormControl>
                      <Input placeholder="MG Marketing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fromEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do remetente</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="marketing@mg.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedProvider === ProviderType.SMTP ? (
              <>
                <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                  <FormField
                    control={form.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porta</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="587" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="usuario@smtp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Senha{isEdit ? " (deixe vazio para manter)" : ""}
                      </FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secure"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) =>
                            field.onChange(event.target.checked)
                          }
                          className="size-4 rounded border"
                        />
                      </FormControl>
                      <FormLabel className="mt-0!">SSL/TLS</FormLabel>
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            {selectedProvider === ProviderType.Resend ||
            selectedProvider === ProviderType.SendGrid ||
            selectedProvider === ProviderType.Mailgun ? (
              <>
                {selectedProvider === ProviderType.Mailgun ? (
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domínio</FormLabel>
                        <FormControl>
                          <Input placeholder="mg.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        API key{isEdit ? " (deixe vazio para manter)" : ""}
                      </FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            {selectedProvider === ProviderType.SES ? (
              <>
                <FormField
                  control={form.control}
                  name="accessKeyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Key ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secretAccessKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Secret Access Key
                        {isEdit ? " (deixe vazio para manter)" : ""}
                      </FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Região AWS</FormLabel>
                      <FormControl>
                        <Input placeholder="us-east-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            {selectedProvider === ProviderType.Postmark ? (
              <FormField
                control={form.control}
                name="serverToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Server Token{isEdit ? " (deixe vazio para manter)" : ""}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {serverError ? (
              <p className="text-destructive text-sm">{serverError}</p>
            ) : null}

            {testMessage ? (
              <p
                className={
                  testMessage.success
                    ? "text-sm text-emerald-600"
                    : "text-destructive text-sm"
                }
              >
                {testMessage.message}
              </p>
            ) : null}

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleTestConnection}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Zap className="size-4" />
                )}
                Testar conexão
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
