"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { Plan } from "../api/payment.api";

interface PricingTableProps {
  plans: Plan[];
  currentPlanId?: Plan["id"];
  onSelect?: (plan: Plan) => void;
}

export function PricingTable({ plans, currentPlanId, onSelect }: PricingTableProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId;
        return (
          <div
            key={plan.id}
            className={cn("rounded-xl border p-6 flex flex-col")}
            style={{
              background: "var(--color-card)",
              borderColor: plan.highlighted ? "var(--color-primary-400)" : "var(--color-border)",
              boxShadow: plan.highlighted ? "var(--shadow-md)" : "var(--shadow-sm)",
            }}
          >
            {plan.highlighted && (
              <span
                className="self-start text-xs font-bold px-2.5 py-0.5 rounded-full mb-3"
                style={{ background: "var(--color-primary-600)", color: "#fff" }}
              >
                Most popular
              </span>
            )}
            <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>{plan.name}</h3>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>{plan.tagline}</p>

            <div className="mt-4 mb-5">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                ${plan.priceMonthly}
              </span>
              <span className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>/month</span>
            </div>

            <ul className="space-y-2.5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <Check size={16} className="shrink-0 mt-0.5" style={{ color: "var(--color-success-500)" }} />
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled={isCurrent}
              onClick={() => onSelect?.(plan)}
              className={cn(
                "mt-6 w-full py-2.5 rounded-md text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-default",
              )}
              style={
                plan.highlighted
                  ? { background: "var(--color-primary-600)", color: "#fff" }
                  : { background: "var(--color-primary-50)", color: "var(--color-primary-700)" }
              }
            >
              {isCurrent ? "Current plan" : plan.cta}
            </button>
          </div>
        );
      })}
    </div>
  );
}
