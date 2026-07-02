"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  advanceCampaignWizardStepAction,
  createCampaignDraftAction,
  saveCampaignDraftAction,
  scheduleCampaignAction,
  sendCampaignAction,
  type CampaignDto,
} from "@/actions/campaigns";
import { listContactsAction, listGroupsAction } from "@/actions/contacts";
import { listTemplatesAction } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAutosave } from "@/hooks/use-autosave";
import { toast } from "@/lib/toast";
import {
  CampaignContentEditor,
  CampaignImageEditor,
} from "@/features/campaigns/components/campaign-content-editor";
import { CampaignPreviewStep } from "@/features/campaigns/components/campaign-preview-step";
import { WIZARD_STEP_META } from "@/features/campaigns/lib/wizard-steps";
import { Channel } from "@/generated/prisma/enums";
import {
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_LABELS,
  emptyFieldInput,
  getPreviousWizardStep,
  WIZARD_STEPS,
  type CampaignWizardStateInput,
  type WizardStep,
} from "@/schemas/campaign";
import { CampaignType } from "@/generated/prisma/enums";

type CampaignWizardProps = {
  mode: "create" | "edit";
  initialCampaign?: CampaignDto;
  canSend: boolean;
};

function buildDefaultValues(campaign?: CampaignDto): CampaignWizardStateInput {
  if (!campaign) {
    return {
      nome: "",
      type: CampaignType.Geral,
      templateId: "",
      field: emptyFieldInput(),
      recipientContactIds: [],
      recipientGroupIds: [],
      channels: [],
      wizardStep: "criar",
      scheduledAt: "",
    };
  }

  return {
    nome: campaign.nome,
    type: campaign.type,
    templateId: campaign.templateId ?? "",
    field: {
      titulo: campaign.field?.titulo ?? "",
      subtitulo: campaign.field?.subtitulo ?? "",
      texto: campaign.field?.texto ?? "",
      banner: campaign.field?.banner ?? "",
      imagem: campaign.field?.imagem ?? "",
      link: campaign.field?.link ?? "",
      botao: campaign.field?.botao ?? "",
      preco: campaign.field?.preco ?? "",
      desconto: campaign.field?.desconto ?? "",
      validade: campaign.field?.validade
        ? campaign.field.validade.slice(0, 10)
        : "",
      observacoes: campaign.field?.observacoes ?? "",
    },
    recipientContactIds: campaign.recipientContactIds,
    recipientGroupIds: campaign.recipientGroupIds,
    channels: campaign.channels,
    wizardStep: campaign.wizardStep ?? "criar",
    scheduledAt: campaign.scheduledAt ?? "",
  };
}

export function CampaignWizard({
  mode,
  initialCampaign,
  canSend,
}: CampaignWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [campaignId, setCampaignId] = useState<string | null>(
    initialCampaign?.id ?? null,
  );
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    initialCampaign?.wizardStep ?? "criar",
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [autosaveMessage, setAutosaveMessage] = useState<string | null>(null);

  const form = useForm<CampaignWizardStateInput>({
    defaultValues: buildDefaultValues(initialCampaign),
    mode: "onChange",
    // Mantém contatos/grupos selecionados ao trocar de etapa (campos desmontados).
    shouldUnregister: false,
  });

  const templatesQuery = useQuery({
    queryKey: ["templates", "wizard"],
    queryFn: async () => {
      const result = await listTemplatesAction({ page: 1, pageSize: 100 });
      if (!result.success) throw new Error(result.error);
      return result.data.items;
    },
  });

  const contactsQuery = useQuery({
    queryKey: ["contacts", "wizard"],
    queryFn: async () => {
      const result = await listContactsAction({ page: 1, pageSize: 200 });
      if (!result.success) throw new Error(result.error);
      return result.data.items;
    },
  });

  const groupsQuery = useQuery({
    queryKey: ["groups", "wizard"],
    queryFn: async () => {
      const result = await listGroupsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const persistDraft = useCallback(
    async (values: CampaignWizardStateInput) => {
      if (!campaignId) return false;
      const result = await saveCampaignDraftAction(campaignId, {
        ...values,
        wizardStep: currentStep,
      });
      return result.success;
    },
    [campaignId, currentStep],
  );

  const watchedValues = form.watch();

  useAutosave(watchedValues, {
    enabled: Boolean(campaignId),
    delay: 1500,
    onSave: persistDraft,
    onSuccess: () => {
      setAutosaveMessage("Rascunho salvo");
      toast.success("Rascunho salvo automaticamente");
      setTimeout(() => setAutosaveMessage(null), 2000);
    },
    onError: () => {
      toast.error("Não foi possível salvar o rascunho.");
    },
  });

  function getStepPayload(step: WizardStep, values: CampaignWizardStateInput) {
    switch (step) {
      case "criar":
        return { nome: values.nome };
      case "tipo":
        return { type: values.type };
      case "template":
        return { templateId: values.templateId };
      case "conteudo":
        return { field: values.field };
      case "imagem":
        return {
          field: { banner: values.field.banner, imagem: values.field.imagem },
        };
      case "contatos":
        return { recipientContactIds: values.recipientContactIds ?? [] };
      case "grupos":
        return {
          recipientGroupIds: values.recipientGroupIds ?? [],
          recipientContactIds: values.recipientContactIds ?? [],
        };
      case "canal":
        return { channels: values.channels };
      case "preview":
        return {};
      case "enviar":
        return { scheduledAt: values.scheduledAt };
      default:
        return {};
    }
  }

  function handleAdvance() {
    setServerError(null);
    const values = form.getValues();

    startTransition(async () => {
      let id = campaignId;

      if (currentStep === "criar" && !id) {
        const created = await createCampaignDraftAction(values.nome);
        if (!created.success) {
          setServerError(created.error);
          return;
        }
        id = created.data.id;
        setCampaignId(id);
      }

      if (!id) {
        setServerError("Campanha não encontrada");
        return;
      }

      const payload = getStepPayload(currentStep, values);
      const result = await advanceCampaignWizardStepAction(
        id,
        currentStep,
        payload,
      );

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      if (result.data.campaign.field) {
        const field = result.data.campaign.field;
        form.setValue("field", {
          titulo: field.titulo ?? "",
          subtitulo: field.subtitulo ?? "",
          texto: field.texto ?? "",
          banner: field.banner ?? "",
          imagem: field.imagem ?? "",
          link: field.link ?? "",
          botao: field.botao ?? "",
          preco: field.preco ?? "",
          desconto: field.desconto ?? "",
          validade: field.validade ? field.validade.slice(0, 10) : "",
          observacoes: field.observacoes ?? "",
        });
      }

      if (result.data.nextStep) {
        setCurrentStep(result.data.nextStep);
        form.setValue("wizardStep", result.data.nextStep);
      }
    });
  }

  function handleBack() {
    const previous = getPreviousWizardStep(currentStep);
    if (previous) {
      setCurrentStep(previous);
      form.setValue("wizardStep", previous);
    }
  }

  function handleSaveDraft() {
    setServerError(null);
    const values = form.getValues();
    startTransition(async () => {
      if (!campaignId) {
        const created = await createCampaignDraftAction(values.nome);
        if (!created.success) {
          setServerError(created.error);
          return;
        }
        setCampaignId(created.data.id);
        setAutosaveMessage("Rascunho criado");
        return;
      }

      const result = await saveCampaignDraftAction(campaignId, {
        ...values,
        wizardStep: currentStep,
      });
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      setAutosaveMessage("Rascunho salvo");
    });
  }

  function handleSendNow() {
    if (!campaignId) return;

    startTransition(async () => {
      const result = await sendCampaignAction(campaignId);
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      router.push("/campaigns");
      router.refresh();
    });
  }

  function handleSchedule() {
    if (!campaignId) return;
    const scheduledAt = form.getValues("scheduledAt");
    if (!scheduledAt) {
      setServerError("Informe data e hora para agendar");
      return;
    }

    startTransition(async () => {
      const result = await scheduleCampaignAction(campaignId!, scheduledAt);
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      router.push("/campaigns");
      router.refresh();
    });
  }

  const stepMeta = WIZARD_STEP_META[currentStep];
  const stepIndex = WIZARD_STEPS.indexOf(currentStep);

  return (
    <Form {...form}>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-sm">
                Etapa {stepIndex + 1} de {WIZARD_STEPS.length}
              </p>
              <h2 className="text-xl font-semibold">{stepMeta.title}</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {stepMeta.description}
              </p>
            </div>
            {autosaveMessage ? (
              <span className="text-muted-foreground text-sm">
                {autosaveMessage}
              </span>
            ) : null}
          </div>

          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all"
              style={{
                width: `${((stepIndex + 1) / WIZARD_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {serverError ? (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
            {serverError}
          </div>
        ) : null}

        <div className="space-y-6">
          {currentStep === "criar" ? (
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da campanha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Promoção de inverno"
                      autoComplete="off"
                      dir="ltr"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {currentStep === "tipo" ? (
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isPending}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {Object.entries(CAMPAIGN_TYPE_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {currentStep === "template" ? (
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isPending || templatesQuery.isLoading}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="">Selecione um template</option>
                      {(templatesQuery.data ?? []).map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.nome}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {currentStep === "conteudo" ? (
            <CampaignContentEditor disabled={isPending} />
          ) : null}

          {currentStep === "imagem" ? (
            <CampaignImageEditor disabled={isPending} />
          ) : null}

          {currentStep === "contatos" ? (
            <FormField
              control={form.control}
              name="recipientContactIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contatos</FormLabel>
                  <FormControl>
                    <div className="border-border max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                      {(contactsQuery.data ?? []).map((contact) => {
                        const checked = field.value.includes(contact.id);
                        return (
                          <label
                            key={contact.id}
                            className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isPending}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? [...field.value, contact.id]
                                  : field.value.filter(
                                      (id) => id !== contact.id,
                                    );
                                field.onChange(next);
                              }}
                            />
                            <span>
                              {contact.empresa}
                              {contact.nome ? ` · ${contact.nome}` : ""}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {currentStep === "grupos" ? (
            <FormField
              control={form.control}
              name="recipientGroupIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupos</FormLabel>
                  <FormControl>
                    <div className="border-border max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                      {(groupsQuery.data ?? []).map((group) => {
                        const checked = field.value.includes(group.id);
                        return (
                          <label
                            key={group.id}
                            className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isPending}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? [...field.value, group.id]
                                  : field.value.filter((id) => id !== group.id);
                                field.onChange(next);
                              }}
                            />
                            <span>
                              {group.nome} ({group._count.contacts} contatos)
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {currentStep === "canal" ? (
            <FormField
              control={form.control}
              name="channels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canais de envio</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(CHANNEL_LABELS).map(([value, label]) => {
                      const channel = value as Channel;
                      const isWhatsApp = channel === Channel.WhatsApp;
                      const checked = field.value.includes(channel);
                      return (
                        <label
                          key={value}
                          className={`border-input flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${isWhatsApp ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                          title={
                            isWhatsApp
                              ? "Integração em desenvolvimento"
                              : undefined
                          }
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isPending || isWhatsApp}
                            onChange={(event) => {
                              const next = event.target.checked
                                ? [...field.value, channel]
                                : field.value.filter(
                                    (item) => item !== channel,
                                  );
                              field.onChange(next);
                            }}
                          />
                          {label}
                          {isWhatsApp ? (
                            <span className="text-muted-foreground text-xs">
                              (em breve)
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {currentStep === "preview" ? <CampaignPreviewStep /> : null}

          {currentStep === "enviar" ? (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agendar envio</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        disabled={isPending || !canSend}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-muted-foreground text-sm">
                Envie agora ou agende para depois. Campanhas agendadas são
                enviadas automaticamente no horário definido.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/campaigns">Cancelar</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleSaveDraft}
            >
              Salvar rascunho
            </Button>
          </div>

          <div className="flex gap-2">
            {getPreviousWizardStep(currentStep) ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleBack}
              >
                Voltar
              </Button>
            ) : null}

            {currentStep === "enviar" ? (
              <>
                <Button
                  type="button"
                  disabled={isPending || !canSend}
                  onClick={handleSendNow}
                >
                  Enviar agora
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending || !canSend}
                  onClick={handleSchedule}
                >
                  Agendar campanha
                </Button>
              </>
            ) : (
              <Button
                type="button"
                disabled={isPending}
                onClick={handleAdvance}
              >
                {mode === "create" && currentStep === "criar"
                  ? "Criar e continuar"
                  : "Avançar"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}
