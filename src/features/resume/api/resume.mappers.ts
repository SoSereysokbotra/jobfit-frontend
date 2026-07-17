/** Backend DTO -> view adapters for the resume feature. */

import type { ResumeDto, ResumeParsingStatus } from "./resume.api";
import { daysSince } from "@/lib/utils/format";

export const PARSING_STATUS_LABELS: Record<ResumeParsingStatus, string> = {
  PENDING: "Queued",
  PROCESSING: "Analysing",
  SUCCESS: "Ready",
  FAILED: "Failed",
};

/** Badge tone per status — keeps every surface consistent. */
export const PARSING_STATUS_TONE: Record<
  ResumeParsingStatus,
  "neutral" | "info" | "success" | "error"
> = {
  PENDING: "neutral",
  PROCESSING: "info",
  SUCCESS: "success",
  FAILED: "error",
};

/** 430 -> "430 B", 1572864 -> "1.5 MB", 5242880 -> "5 MB" */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  // One decimal only below 10, and only when it carries information: a whole
  // number of MB should read "5 MB", not "5.0 MB".
  const rounded = value >= 10 || exponent === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[exponent]}`;
}

/** "Uploaded today" / "Uploaded 3 days ago" */
export function formatUploadedAt(iso: string): string {
  const days = daysSince(iso);
  if (days === 0) return "Uploaded today";
  if (days === 1) return "Uploaded yesterday";
  return `Uploaded ${days} days ago`;
}

export interface ResumeView extends ResumeDto {
  sizeLabel: string;
  uploadedLabel: string;
  statusLabel: string;
  /** Scores only exist once parsing succeeded. */
  isParsed: boolean;
  isProcessing: boolean;
  hasFailed: boolean;
}

export function toResumeView(dto: ResumeDto): ResumeView {
  return {
    ...dto,
    sizeLabel: formatFileSize(dto.fileSize),
    uploadedLabel: formatUploadedAt(dto.createdAt),
    statusLabel: PARSING_STATUS_LABELS[dto.parsingStatus] ?? dto.parsingStatus,
    isParsed: dto.parsingStatus === "SUCCESS",
    isProcessing: dto.parsingStatus === "PENDING" || dto.parsingStatus === "PROCESSING",
    hasFailed: dto.parsingStatus === "FAILED",
  };
}

/** Score -> label/tone used by AtsScoreBadge and the detail page. */
export function scoreTone(score: number): { label: string; tone: "success" | "warning" | "error" } {
  if (score >= 80) return { label: "Strong", tone: "success" };
  if (score >= 60) return { label: "Fair", tone: "warning" };
  return { label: "Needs work", tone: "error" };
}
