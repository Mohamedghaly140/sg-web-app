"use client";

import { useSyncExternalStore } from "react";
import { LucideShare2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  title: string;
  url?: string;
};

function subscribeToShareSupport() {
  return () => undefined;
}

function getShareSupportSnapshot() {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

function getServerShareSupportSnapshot() {
  return false;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const canShare = useSyncExternalStore(
    subscribeToShareSupport,
    getShareSupportSnapshot,
    getServerShareSupportSnapshot,
  );

  if (!canShare) {
    return null;
  }

  async function handleShare() {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.share !== "function"
    ) {
      return;
    }

    try {
      await navigator.share({
        title,
        url: url ?? window.location.href,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleShare}>
      <LucideShare2 data-icon="inline-start" />
      Share
    </Button>
  );
}
