"use client";

import React, { useState } from "react";
import { Send, User, Briefcase } from "lucide-react";
import { Modal } from "@/shared/components/ui/modal";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { ApiError } from "@/lib/api/client";
import { useEmployerOffer, usePostOfferMessage } from "../hooks/use-employer-offer";
import type { EmployerOfferDto } from "../api/employer-offer.api";

interface OfferThreadModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: string | null;
  candidateName: string;
}

const money = (n: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function Terms({ offer }: { offer: EmployerOfferDto }) {
  const rows: [string, string][] = [
    ["Base salary", money(offer.baseSalary, offer.currency)],
    ...(offer.signingBonus ? ([["Signing bonus", money(offer.signingBonus, offer.currency)]] as [string, string][]) : []),
    ...(offer.annualBonusPct ? ([["Annual bonus", `${offer.annualBonusPct}%`]] as [string, string][]) : []),
    ...(offer.startDate ? ([["Start date", new Date(offer.startDate).toLocaleDateString()]] as [string, string][]) : []),
    ...(offer.responseDeadline
      ? ([["Responds by", new Date(offer.responseDeadline).toLocaleDateString()]] as [string, string][])
      : []),
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
      {rows.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt className="text-content-tertiary">{label}</dt>
          <dd className="font-semibold text-content text-right tabular-nums">{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

/** The offer on an application and the conversation about it. */
export function OfferThreadModal({ open, onClose, applicationId, candidateName }: OfferThreadModalProps) {
  const { data: offer, isLoading, isError } = useEmployerOffer(open ? applicationId : null);
  const post = usePostOfferMessage(applicationId);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const negotiating = offer?.status === "NEGOTIATING";
  const canReply = offer && ["EXTENDED", "NEGOTIATING"].includes(offer.status);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setError(null);
    post.mutate(body, {
      onSuccess: () => setDraft(""),
      onError: (e) => setError(e instanceof ApiError ? e.message : "Could not send your reply."),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Offer" subtitle={candidateName}>
      <div className="space-y-4">
        {isLoading && <Skeleton className="h-28 rounded-md" />}
        {isError && <Alert variant="info">No offer has been extended on this application yet.</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

        {offer && (
          <>
            {negotiating && (
              <Alert variant="warning">
                {candidateName} has asked for different terms. Reply below, or put revised
                terms on the table by extending the offer again.
              </Alert>
            )}

            <div className="rounded-md border border-border p-3">
              <Terms offer={offer} />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-content-tertiary">
                Conversation
              </h4>

              {offer.messages.length === 0 ? (
                <p className="text-xs text-content-tertiary">Nothing said yet.</p>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {offer.messages.map((m) => {
                    const fromCandidate = m.authorRole === "CANDIDATE";
                    return (
                      <li
                        key={m.id}
                        className={
                          fromCandidate
                            ? "rounded-md p-2.5 text-xs flex gap-2 bg-primary-50 border border-primary-100"
                            : "rounded-md p-2.5 text-xs flex gap-2 bg-background-secondary border border-border"
                        }
                      >
                        {fromCandidate ? (
                          <User size={13} className="shrink-0 mt-0.5 text-primary-600" />
                        ) : (
                          <Briefcase size={13} className="shrink-0 mt-0.5 text-content-tertiary" />
                        )}
                        <span className="min-w-0">
                          <span className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-bold text-content">
                              {fromCandidate ? candidateName : "You"}
                            </span>
                            <span className="text-content-disabled">{when(m.createdAt)}</span>
                          </span>
                          <span className="text-content-secondary whitespace-pre-line break-words">{m.body}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {canReply && (
              <div className="space-y-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder={`Reply to ${candidateName}…`}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-content text-sm outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="flex justify-end">
                  <button
                    onClick={send}
                    disabled={!draft.trim() || post.isPending}
                    className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-95 inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={12} /> {post.isPending ? "Sending…" : "Send reply"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
