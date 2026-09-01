"use client";

import { useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function ManageAccountButton() {
  const { openUserProfile } = useClerk();

  return (
    <Button type="button" variant="outline" onClick={() => openUserProfile()}>
      Manage account
    </Button>
  );
}
