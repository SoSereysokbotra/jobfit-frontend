/**
 * AI generation (Phase 4) — interview coaching. Cover letters live on the
 * application feature (POST /applications/{id}/cover-letter). Both are premium-only.
 */

import { apiClient } from "@/lib/api/client";

export interface InterviewQuestion {
  question: string;
  category: string;
  guidance: string;
}

export interface InterviewResult {
  questions: InterviewQuestion[];
  feedback: string | null;
  generatedBy: "ai" | "static";
}

export const generationApi = {
  /** POST /generate/interview (kind=questions) — tailored questions for a job. */
  interviewQuestions: (jobId: string, level: string) =>
    apiClient.post<InterviewResult>("/generate/interview", {
      jobId,
      level,
      kind: "questions",
    }),

  /** POST /generate/interview (kind=feedback) — feedback on a candidate answer. */
  interviewFeedback: (jobId: string, level: string, answer: string) =>
    apiClient.post<InterviewResult>("/generate/interview", {
      jobId,
      level,
      kind: "feedback",
      answer,
    }),
};
