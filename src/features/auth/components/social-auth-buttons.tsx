"use client";

import React from "react";
import { GoogleIcon, LinkedInIcon } from "./brand-icons";

interface SocialAuthButtonsProps {
  onGoogle: () => void;
  onLinkedIn?: () => void;
  disabled?: boolean;
}

const BUTTON_CLASS =
  "flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 text-neutral-700 font-medium transition-all duration-200 text-sm group disabled:opacity-50 disabled:cursor-not-allowed";

/** Google + LinkedIn OAuth buttons shared by login and signup. */
export function SocialAuthButtons({ onGoogle, onLinkedIn, disabled = false }: SocialAuthButtonsProps) {
  const handleLinkedIn =
    onLinkedIn ?? (() => alert("LinkedIn is not active in this simulation. Only Google is wired up."));

  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={onGoogle} disabled={disabled} className={BUTTON_CLASS} style={{ boxShadow: "var(--shadow-sm)" }}>
        <GoogleIcon className="w-4 h-4 group-hover:scale-105 transition-transform" />
        <span>Google</span>
      </button>
      <button type="button" onClick={handleLinkedIn} disabled={disabled} className={BUTTON_CLASS} style={{ boxShadow: "var(--shadow-sm)" }}>
        <LinkedInIcon className="w-4 h-4 group-hover:scale-105 transition-transform" />
        <span>LinkedIn</span>
      </button>
    </div>
  );
}
