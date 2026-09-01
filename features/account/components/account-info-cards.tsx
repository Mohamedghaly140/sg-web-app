import Link from "next/link";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CurrentUser } from "@/features/account/types/user";
import type { Address } from "@/features/addresses/types/address";

type AccountInfoCardsProps = {
  defaultAddress: Address | undefined;
  user: CurrentUser;
  clerkDisplayName: string;
};

const cardLinkClassName =
  "text-xs text-accent-strong underline-offset-3 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function AccountInfoCards({
  defaultAddress,
  user,
  clerkDisplayName,
}: AccountInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <p className="text-kicker">Default address</p>
          <CardAction>
            <Link href="/account/addresses" className={cardLinkClassName}>
              Manage
            </Link>
          </CardAction>
          {defaultAddress ? (
            <CardTitle className="text-[19px] font-normal">
              {defaultAddress.alias}
            </CardTitle>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          {defaultAddress ? (
            <>
              <p className="text-muted-foreground">
                {[
                  defaultAddress.addressLine1,
                  defaultAddress.area,
                  defaultAddress.city,
                  defaultAddress.governorate,
                ].join(", ")}
              </p>
              <p className="text-muted-foreground">{defaultAddress.phone}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No default address yet.{" "}
              <Link href="/account/addresses" className={cardLinkClassName}>
                Add address
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-kicker">Profile</p>
          <CardAction>
            <Link href="/account/profile" className={cardLinkClassName}>
              Edit
            </Link>
          </CardAction>
          <CardTitle className="text-[19px] font-normal">
            {clerkDisplayName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p className="text-muted-foreground">{user.email}</p>
          {user.phone ? (
            <p className="text-muted-foreground">{user.phone}</p>
          ) : null}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Email is managed by your sign-in
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
