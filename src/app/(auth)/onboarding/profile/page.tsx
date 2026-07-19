"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Retired route. Onboarding is a single 3-step wizard (Resume → Profile → Matches)
 * living at /onboarding/resume — see Flow 1 in the User Flows guide. This page used
 * to be a second, conflicting profile-first flow; it now just forwards there so old
 * links don't 404 and the two flows can't loop into each other.
 */
export default function OnboardingProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding/resume");
  }, [router]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 40%, var(--color-primary-600) 100%)",
      }}
    >
      <Loader2 className="w-8 h-8 animate-spin text-white/80" />
    </div>
  );
}
