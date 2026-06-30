"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type MagicCardProps = {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
};

/**
 * Magic UI — Magic Card.
 * Destaque sutil com gradiente que segue o cursor. Respeita `prefers-reduced-motion`.
 */
export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "var(--color-primary)",
  gradientOpacity = 0.12,
}: MagicCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const background = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, color-mix(in oklch, ${gradientColor} ${gradientOpacity * 100}%, transparent), transparent 80%)`;

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  function handlePointerLeave() {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }

  return (
    <div
      className={cn(
        "bg-card text-card-foreground group relative overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {!prefersReducedMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background }}
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}
