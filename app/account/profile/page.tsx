import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManageAccountButton } from "@/features/account/components/manage-account-button";
import { getCurrentUser } from "@/features/account/queries/get-current-user";
import { formatMonthYear } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const [user, clerkUser] = await Promise.all([
    getCurrentUser(),
    currentUser(),
  ]);
  const displayName = clerkUser?.fullName ?? user.name;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-[19px] font-normal">
          {displayName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <p className="text-muted-foreground">{user.email}</p>
        {user.phone ? (
          <p className="text-muted-foreground">{user.phone}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Member since {formatMonthYear(user.createdAt)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Email is managed by your sign-in
        </p>
        <div className="mt-2">
          <ManageAccountButton />
        </div>
      </CardContent>
    </Card>
  );
}
