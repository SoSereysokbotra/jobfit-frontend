"use client";

import React, { useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { AvatarUploadModal } from "./avatar-upload-modal";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface ProfileAvatarProps {
  photoUrl?: string | null;
  name?: string;
  initials?: string;
  size?: AvatarSize;
  editable?: boolean;
  onUploadClick?: () => void;
  className?: string;
  showBorder?: boolean;
}

const SIZE_MAP: Record<AvatarSize, { container: string; text: string; camera: string; iconSize: number }> = {
  xs: { container: "w-7 h-7", text: "text-[10px]", camera: "w-3.5 h-3.5", iconSize: 9 },
  sm: { container: "w-8 h-8", text: "text-xs", camera: "w-4 h-4", iconSize: 10 },
  md: { container: "w-12 h-12", text: "text-sm", camera: "w-5 h-5", iconSize: 12 },
  lg: { container: "w-16 h-16", text: "text-lg", camera: "w-6 h-6", iconSize: 14 },
  xl: { container: "w-20 h-20", text: "text-2xl", camera: "w-7 h-7", iconSize: 16 },
  "2xl": { container: "w-24 h-24", text: "text-3xl", camera: "w-8 h-8", iconSize: 18 },
};

export function ProfileAvatar({
  photoUrl,
  name = "User",
  initials = "JD",
  size = "md",
  editable = false,
  onUploadClick,
  className = "",
  showBorder = false,
}: ProfileAvatarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const config = SIZE_MAP[size] || SIZE_MAP.md;
  const hasPhoto = Boolean(photoUrl) && !imgError;

  const handleClick = () => {
    if (!editable) return;
    if (onUploadClick) {
      onUploadClick();
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative inline-flex shrink-0 select-none group",
          editable && "cursor-pointer",
          className
        )}
        onClick={handleClick}
        role={editable ? "button" : undefined}
        tabIndex={editable ? 0 : undefined}
        aria-label={editable ? `Change profile photo for ${name}` : `${name}'s profile photo`}
        onKeyDown={(e) => {
          if (editable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div
          className={cn(
            "rounded-full overflow-hidden flex items-center justify-center font-bold text-white transition-all duration-200",
            config.container,
            config.text,
            showBorder && "ring-2 ring-white/80 shadow-sm",
            editable && "group-hover:opacity-90 group-hover:scale-[1.02] active:scale-[0.98]"
          )}
          style={{
            background: hasPhoto ? "var(--color-card)" : "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
          }}
        >
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl!}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* ── Camera Badge Overlay for Editable Avatars ── */}
        {editable && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 group-hover:scale-110",
              config.camera
            )}
            style={{
              background: "var(--color-primary-600)",
              border: "2px solid var(--color-card, #ffffff)",
            }}
            title="Change photo"
          >
            <Camera size={config.iconSize} />
          </div>
        )}
      </div>

      {/* Internal Modal when not externally controlled */}
      {editable && !onUploadClick && (
        <AvatarUploadModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          currentPhotoUrl={photoUrl}
          initials={initials}
          userName={name}
        />
      )}
    </>
  );
}
