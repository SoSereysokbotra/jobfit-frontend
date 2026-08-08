"use client";

import React from "react";
import { MessageSquare, User } from "lucide-react";
import { Modal } from "@/shared/components/ui/modal";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { useEmployerOffer } from "../hooks/use-employer-offer";
import type { EmployerOfferDto } from "../api/employer-offer.api";

interface OfferThreadModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: string | null;
  candidateName: string;
}

const CANDIDATE_PREFIX = "[Candidate]";

interface ThreadEntry {
  from: "employer" | "candidate";
  text: string;
}

/**
 * Split the offer's `notes` column into who said what.
 *
 * The backend stores the thread as one string: the employer's note from when they extended
 * the offer, then each candidate message appended on its own line as `[Candidate] …`. That
 * is the actual format, so this parses it rather than inventing a schema for it.
 */
export function parseThread(notes: string | null): ThreadEntry[] {
  if (!notes?.trim()) return [];
  return notes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line.startsWith(CANDIDATE_PREFIX)
        ? { from: "candidate" as const, text: line.slice(CANDIDATE_PREFIX.length).trim() }
        : { from: "employer" as const, text: line },
    );
}

const money = (n: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

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
  const thread = parseThread(offer?.notes ?? null);
  const negotiating = offer?.status === "NEGOTIATING";

  return (
    <Modal open={open} onClose={onClose} title="Offer" subtitle={candidateName}>
      <div className="space-y-4">
        {isLoading && <Skeleton className="h-28 rounded-md" />}

        {isError && (
          <Alert variant="info">No offer has been extended on this application yet.</Alert>
        )}

        {offer && (
          <>
            {negotiating && (
              <Alert variant="warning">
                {candidateName} has asked for different terms. Reply by extending a revised
                offer — that reopens it for them to accept or decline.
              </Alert>
            )}

            <div className="rounded-md border border-border p-3">
              <Terms offer={offer} />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-content-tertiary">
                Conversation
              </h4>

              {thread.length === 0 ? (
                <p className="text-xs text-content-tertiary">
                  No notes on this offer yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {thread.map((entry, i) => (
                    <li
                      key={i}
                      className={
                        entry.from === "candidate"
                          ? "rounded-md p-2.5 text-xs flex gap-2 bg-primary-50 border border-primary-100"
                          : "rounded-md p-2.5 text-xs flex gap-2 bg-background-secondary border border-border"
                      }
                    >
                      {entry.from === "candidate" ? (
                        <User size={13} className="shrink-0 mt-0.5 text-primary-600" />
                      ) : (
                        <MessageSquare size={13} className="shrink-0 mt-0.5 text-content-tertiary" />
                      )}
                      <span>
                        <span className="font-bold block mb-0.5 text-content">
                          {entry.from === "candidate" ? candidateName : "You"}
                        </span>
                        <span className="text-content-secondary">{entry.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
