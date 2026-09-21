// src/features/auth/components/google-sign-in-button.tsx
//
// "Continue with Google" — the same control on /login and /signup, because the backend
// makes no distinction: POST /auth/google signs an existing account in or creates one,
// and answers `isNewUser` so the client can route.
//
// RENDERS NOTHING WHEN UNCONFIGURED. If NEXT_PUBLIC_GOOGLE_CLIENT_ID is absent the
// button is not drawn at all — a button that opens Google's popup and then fails with
// "not configured" is worse than no button. The provider is mounted here rather than in
// the root layout for the same reason: nothing about Google loads on pages that never
// show the button.

"use client";

import React, { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth, type AuthUser } from "@/providers/auth-provider";
import { ApiError } from "@/lib/api/client";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

/** Exported so pages can decide whether to draw the "or" divider. */
export const GOOGLE_SIGN_IN_ENABLED = CLIENT_ID.length > 0;

export function GoogleSignInButton({
  onSignedIn,
  onError,
  /** "signin_with" on /login, "continue_with" on /signup — Google's own wording. */
  text = "continue_with",
}: {
  onSignedIn: (result: { user: AuthUser; isNewUser: boolean }) => void | Promise<void>;
  onError: (message: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!GOOGLE_SIGN_IN_ENABLED) return null;

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="flex flex-col items-center gap-2" aria-busy={busy}>
        <GoogleLogin
          text={text}
          shape="rectangular"
          size="large"
          width="320"
          onSuccess={async (response) => {
            // `credential` is the ID token. It is a claim until the backend has verified
            // its signature and audience; nothing here trusts its contents.
            if (!response.credential) {
              onError("Google did not return a sign-in token. Please try again.");
              return;
            }
            setBusy(true);
            try {
              const result = await loginWithGoogle(response.credential);
              await onSignedIn(result);
            } catch (err) {
              onError(
                err instanceof ApiError
                  ? err.messages.join(" ")
                  : "Could not sign in with Google. Please try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
          onError={() => onError("Google sign-in was cancelled or failed.")}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
