"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion, useSpring, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

type NumberTickerProps = {
  value: number;
  className?: string;
  duration?: number;
  delay?: number;
};

/**
 * Magic UI — Number Ticker.
 * Anima a contagem até o valor final. Respeita `prefers-reduced-motion`.
 */
export function NumberTicker({
  value,
  className,
  duration = 1.2,
  delay = 0,
}: NumberTickerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <span className={cn("tabular-nums", className)}>
        {value.toLocaleString("pt-BR")}
      </span>
    );
  }

  return (
    <AnimatedNumberTicker
      value={value}
      className={className}
      duration={duration}
      delay={delay}
    />
  );
}

function AnimatedNumberTicker({
  value,
  className,
  duration = 1.2,
  delay = 0,
}: Required<Pick<NumberTickerProps, "value">> &
  Pick<NumberTickerProps, "className" | "duration" | "delay">) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString("pt-BR"),
  );

  React.useEffect(() => {
    if (!isInView) return;
    const timeout = window.setTimeout(() => {
      spring.set(value);
    }, delay * 1000);
    return () => window.clearTimeout(timeout);
  }, [delay, isInView, spring, value]);

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </motion.span>
  );
}
