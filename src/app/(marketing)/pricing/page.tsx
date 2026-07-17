"use client";

import React from "react";
import Link from "next/link";
import { PricingTable } from "@/features/payment/components/pricing-table";
import { usePlans } from "@/features/payment/hooks/use-payment";
import { Skeleton } from "@/shared/components/feedback/skeleton";

export default function PricingPage() {
  const { data: plans = [], isLoading } = usePlans();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Simple, transparent pricing
        </h1>
        <p className="text-base mt-3 max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
          Start free. Upgrade when you&apos;re ready to accelerate your search.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
        </div>
      ) : (
        <PricingTable plans={plans} currentPlanId="free" />
      )}

      <p className="text-center text-sm mt-10" style={{ color: "var(--color-text-tertiary)" }}>
        Prices in USD. Cancel anytime.{" "}
        <Link href="/signup" className="font-semibold hover:underline" style={{ color: "var(--color-primary-600)" }}>
          Create a free account
        </Link>
      </p>
    </div>
  );
}
