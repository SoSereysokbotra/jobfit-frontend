"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";
import { useExtendOffer } from "../hooks/use-employer-offer";
import type { ExtendOfferInput } from "../api/employer-offer.api";

interface MakeOfferModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
}

const INPUT = "w-full px-3 py-2 rounded-md border border-border bg-background text-content text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent";

/** Employer form to extend a compensation offer on an application. */
export function MakeOfferModal({ open, onClose, applicationId, candidateName }: MakeOfferModalProps) {
  const extend = useExtendOffer();
  const [baseSalary, setBaseSalary] = useState("");
  const [signingBonus, setSigningBonus] = useState("");
  const [annualBonusPct, setAnnualBonusPct] = useState("");
  const [equityShares, setEquityShares] = useState("");
  const [equityPrice, setEquityPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setBaseSalary(""); setSigningBonus(""); setAnnualBonusPct("");
    setEquityShares(""); setEquityPrice(""); setStartDate("");
    setResponseDeadline(""); setNotes(""); setError(null);
  };

  const submit = () => {
    const base = Number(baseSalary);
    if (!base || base <= 0) { setError("Base salary is required."); return; }
    setError(null);
    const input: ExtendOfferInput = {
      baseSalary: Math.round(base),
      ...(signingBonus && { signingBonus: Math.round(Number(signingBonus)) }),
      ...(annualBonusPct && { annualBonusPct: Number(annualBonusPct) }),
      ...(equityShares && { equityShares: Math.round(Number(equityShares)) }),
      ...(equityPrice && { equityPrice: Number(equityPrice) }),
      ...(startDate && { startDate }),
      ...(responseDeadline && { responseDeadline }),
      ...(notes.trim() && { notes: notes.trim() }),
    };
    extend.mutate(
      { applicationId, input },
      { onSuccess: () => { reset(); onClose(); }, onError: (e) => setError(e instanceof ApiError ? e.message : "Could not extend the offer.") },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Make an offer"
      subtitle={`To ${candidateName}`}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-md text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={extend.isPending}
            className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all disabled:opacity-60"
          >
            {extend.isPending ? "Sending…" : "Extend offer"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Base salary (annual, USD) *">
          <input value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} type="number" placeholder="180000" className={INPUT} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Signing bonus"><input value={signingBonus} onChange={(e) => setSigningBonus(e.target.value)} type="number" placeholder="20000" className={INPUT} /></Field>
          <Field label="Annual bonus (% of base)"><input value={annualBonusPct} onChange={(e) => setAnnualBonusPct(e.target.value)} type="number" placeholder="15" className={INPUT} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Equity (shares)"><input value={equityShares} onChange={(e) => setEquityShares(e.target.value)} type="number" placeholder="1000" className={INPUT} /></Field>
          <Field label="Share price (USD)"><input value={equityPrice} onChange={(e) => setEquityPrice(e.target.value)} type="number" placeholder="40" className={INPUT} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date"><input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className={INPUT} /></Field>
          <Field label="Respond by"><input value={responseDeadline} onChange={(e) => setResponseDeadline(e.target.value)} type="date" className={INPUT} /></Field>
        </div>
        <Field label="Note to candidate">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="We're excited to have you join…" className={INPUT} />
        </Field>
        {error && <Alert variant="error">{error}</Alert>}
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-content-tertiary">{label}</label>
      {children}
    </div>
  );
}
