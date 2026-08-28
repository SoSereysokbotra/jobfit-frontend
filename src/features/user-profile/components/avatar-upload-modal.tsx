"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Trash2, Check, AlertCircle, Camera, Image as ImageIcon } from "lucide-react";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import { toast } from "@/stores/toast-store";
import { useUpdateProfile } from "../hooks/use-profile";

interface AvatarUploadModalProps {
  open: boolean;
  onClose: () => void;
  currentPhotoUrl?: string | null;
  initials?: string;
  userName?: string;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Optimizes an image file by drawing it to a canvas with max dimension 512x512
 * and returning a lightweight, high-resolution Base64 data URL.
 */
function processAndOptimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image format."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDimension = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback to raw data url if 2d context unavailable
          resolve(event.target?.result as string);
          return;
        }

        // Draw and compress with high visual quality
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AvatarUploadModal({
  open,
  onClose,
  currentPhotoUrl,
  initials = "JD",
  userName = "User",
}: AvatarUploadModalProps) {
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  // Reset state when closing/opening
  const handleClose = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setErrorMessage("");
    setIsRemoving(false);
    onClose();
  };

  const handleFile = async (file: File) => {
    setErrorMessage("");
    setIsRemoving(false);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage("Please upload a valid image (JPEG, PNG, WebP, or GIF).");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setErrorMessage("Image size must be smaller than 5 MB.");
      return;
    }

    try {
      const optimized = await processAndOptimizeImage(file);
      setSelectedFile(file);
      setPreviewUrl(optimized);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not process image.");
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  }, []);

  const handleSave = async () => {
    setErrorMessage("");

    try {
      if (isRemoving) {
        await updateProfile.mutateAsync({ photoUrl: "" });
        toast.success("Profile photo removed.");
        handleClose();
        return;
      }

      if (previewUrl) {
        await updateProfile.mutateAsync({ photoUrl: previewUrl });
        toast.success("Profile photo updated successfully!");
        handleClose();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update profile photo.");
    }
  };

  const handleRemovePhoto = () => {
    setIsRemoving(true);
    setPreviewUrl(null);
    setSelectedFile(null);
    setErrorMessage("");
  };

  const effectivePhoto = isRemoving ? null : previewUrl ?? currentPhotoUrl;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Profile Picture"
      subtitle="Upload a clear photo to personalize your profile and applications"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          {currentPhotoUrl && !isRemoving ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={updateProfile.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} /> Remove photo
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={updateProfile.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={updateProfile.isPending}
              loadingText="Saving…"
              disabled={(!previewUrl && !isRemoving) || updateProfile.isPending}
            >
              <Check size={14} /> Save Photo
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {errorMessage && (
          <div
            className="p-3 rounded-lg border flex items-start gap-2 text-xs font-medium"
            style={{
              background: "var(--color-error-50)",
              borderColor: "var(--color-error-200)",
              color: "var(--color-error-700)",
            }}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Visual Preview Area ── */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl border" style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}>
          <div className="relative group mb-2">
            <div
              className="w-28 h-28 rounded-full overflow-hidden border-2 shadow-md flex items-center justify-center transition-all duration-300"
              style={{
                borderColor: previewUrl ? "var(--color-primary-500)" : "var(--color-border)",
                background: "var(--color-card)",
              }}
            >
              {effectivePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={effectivePhoto}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))" }}
                >
                  {initials}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white transition-transform duration-200 hover:scale-110 active:scale-95"
              style={{ background: "var(--color-primary-600)" }}
              title="Select image"
              aria-label="Select image"
            >
              <Camera size={15} />
            </button>
          </div>

          <p className="text-xs font-bold" style={{ color: "var(--color-text-primary)" }}>
            {isRemoving
              ? "Photo will be removed (initials avatar will be used)"
              : previewUrl
                ? "New photo preview"
                : currentPhotoUrl
                  ? "Current profile photo"
                  : "No photo uploaded yet"}
          </p>
        </div>

        {/* ── Dropzone & Upload Action ── */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary-500 bg-primary-50/50"
              : "hover:border-primary-400 hover:bg-[var(--color-surface-hover)]"
          }`}
          style={{
            borderColor: isDragging ? "var(--color-primary-500)" : "var(--color-border)",
            background: isDragging ? "var(--color-primary-50)" : "transparent",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <div
            className="w-10 h-10 rounded-full mx-auto mb-2.5 flex items-center justify-center text-primary-600"
            style={{ background: "var(--color-primary-50)" }}
          >
            <Upload size={18} />
          </div>

          <p className="text-xs font-bold" style={{ color: "var(--color-text-primary)" }}>
            Click to upload <span className="font-normal text-neutral-500">or drag and drop</span>
          </p>
          <p className="text-[11px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            PNG, JPG, WebP or GIF up to 5 MB
          </p>
        </div>
      </div>
    </Modal>
  );
}
