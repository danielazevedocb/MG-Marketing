"use client";

import { Star } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  active: boolean;
  disabled?: boolean;
  label?: string;
  onToggle: () => Promise<{ success: boolean; error?: string }>;
  onChanged?: () => void;
  size?: "sm" | "default" | "icon";
};

export function FavoriteButton({
  active,
  disabled,
  label = "Favorito",
  onToggle,
  onChanged,
  size = "icon",
}: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await onToggle();
      if (result.success) {
        toast.success(active ? "Removido dos favoritos" : "Adicionado aos favoritos");
        onChanged?.();
        return;
      }
      toast.error(result.error ?? "Não foi possível atualizar o favorito.");
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      disabled={disabled || isPending}
      aria-label={active ? `Remover ${label}` : `Favoritar ${label}`}
      aria-pressed={active}
      onClick={handleClick}
      className={cn(active && "text-amber-500 hover:text-amber-600")}
    >
      <Star
        className={cn("size-4", active && "fill-amber-400 text-amber-500")}
      />
      {size !== "icon" ? <span>{active ? "Favorito" : "Favoritar"}</span> : null}
    </Button>
  );
}
