"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchApplications,
  type Application,
  type ApplicationStatus,
} from "../api/application.api";

export type ApplicationsTab = "All" | ApplicationStatus;
export type ApplicationsSortKey = "recent" | "company" | "match" | "interview";

interface WithdrawalRecord {
  entries: { id: string; prevStatus: ApplicationStatus }[];
  companies: string[];
}

/* Client state for the Applications tracker (Flow 3A): fetching, status tabs,
   search, sorting, bulk selection, withdraw with undo, and per-item edits. */
export function useApplications() {
  const [items, setItems] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<ApplicationsTab>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ApplicationsSortKey>("recent");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** Last withdrawal, kept so the user can undo (spec: soft-delete pattern). */
  const [lastWithdrawal, setLastWithdrawal] = useState<WithdrawalRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchApplications().then((data) => {
      if (!cancelled) {
        setItems(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  /* ── Tab counts (Withdrawn stays out of "All", per spec) ──── */
  const counts = useMemo(() => {
    const c: Record<ApplicationsTab, number> = {
      All: 0, Submitted: 0, Viewed: 0, Interview: 0, Offer: 0, Rejected: 0, Withdrawn: 0,
    };
    for (const app of items) {
      c[app.status] += 1;
      if (app.status !== "Withdrawn") c.All += 1;
    }
    return c;
  }, [items]);

  /* ── Derived list: tab → search → sort ────────────────────── */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tab === "All"
      ? items.filter((a) => a.status !== "Withdrawn")
      : items.filter((a) => a.status === tab);

    if (q) {
      list = list.filter(({ job }) =>
        [job.title, job.company].some((s) => s.toLowerCase().includes(q)),
      );
    }

    return [...list].sort((a, b) => {
      switch (sort) {
        case "company": return a.job.company.localeCompare(b.job.company);
        case "match": return b.job.match - a.job.match;
        case "interview":
          return (a.interview?.inDays ?? Infinity) - (b.interview?.inDays ?? Infinity);
        default: return a.appliedDaysAgo - b.appliedDaysAgo; // most recent first
      }
    });
  }, [items, tab, query, sort]);

  /* ── Header stats & insights ──────────────────────────────── */
  const stats = useMemo(() => {
    const active = items.filter((a) => a.status !== "Withdrawn");
    const interviews = active.filter((a) => a.status === "Interview").length;
    return {
      total: active.length,
      thisMonth: active.filter((a) => a.appliedDaysAgo <= 30).length,
      interviews,
      offers: active.filter((a) => a.status === "Offer").length,
      interviewRate: active.length > 0 ? Math.round((interviews / active.length) * 100) : 0,
    };
  }, [items]);

  /* ── Per-item edits ────────────────────────────────────────── */
  const updateStatus = (id: string, status: ApplicationStatus) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const updateNotes = (id: string, notes: string) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, notes } : a)));
  };

  /* ── Withdraw (single or bulk) with undo ──────────────────── */
  const withdraw = (ids: string[]) => {
    const target = new Set(ids);
    const entries: WithdrawalRecord["entries"] = [];
    const companies: string[] = [];
    setItems((prev) => prev.map((a) => {
      if (!target.has(a.id) || a.status === "Withdrawn") return a;
      entries.push({ id: a.id, prevStatus: a.status });
      companies.push(a.job.company);
      return { ...a, status: "Withdrawn" as const };
    }));
    setLastWithdrawal({ entries, companies });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const undoWithdrawal = () => {
    if (!lastWithdrawal) return;
    const restore = new Map(lastWithdrawal.entries.map((e) => [e.id, e.prevStatus]));
    setItems((prev) => prev.map((a) => {
      const prevStatus = restore.get(a.id);
      return prevStatus ? { ...a, status: prevStatus } : a;
    }));
    setLastWithdrawal(null);
  };

  const dismissUndo = () => setLastWithdrawal(null);

  /* ── Bulk selection ────────────────────────────────────────── */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectMode = () => {
    setSelectMode((on) => {
      if (on) setSelectedIds(new Set());
      return !on;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    isLoading, results, counts, stats,
    tab, setTab,
    query, setQuery,
    sort, setSort,
    selectMode, toggleSelectMode, selectedIds, toggleSelect, clearSelection,
    updateStatus, updateNotes,
    withdraw, lastWithdrawal, undoWithdrawal, dismissUndo,
  };
}
