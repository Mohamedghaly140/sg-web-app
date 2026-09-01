import { currentUser } from "@clerk/nextjs/server";

import { AccountClaimOrderCard } from "@/features/account/components/account-claim-order-card";
import { AccountEarlierOrders } from "@/features/account/components/account-earlier-orders";
import { AccountGreeting } from "@/features/account/components/account-greeting";
import { AccountInfoCards } from "@/features/account/components/account-info-cards";
import { AccountInProgressOrderCard } from "@/features/account/components/account-in-progress-order-card";
import { getCurrentUser } from "@/features/account/queries/get-current-user";
import { getAddresses } from "@/features/addresses/queries/get-addresses";
import { getOrder } from "@/features/orders/queries/get-order";
import { getOrders } from "@/features/orders/queries/get-orders";
import { handleAuthError } from "@/lib/api/handle-auth-error";

export default async function AccountFeature() {
  const [user, orders, addresses, clerkUser] = await Promise.all([
    getCurrentUser(),
    getOrders({ limit: 3 }),
    getAddresses().catch(handleAuthError),
    currentUser(),
  ]);

  const inProgressOrder = orders.data.find(
    (order) =>
      order.status === "PENDING" ||
      order.status === "PROCESSING" ||
      order.status === "SHIPPED",
  );
  const inProgressItems = inProgressOrder
    ? (await getOrder(inProgressOrder.id)).items.slice(0, 2)
    : [];
  const earlierOrders = orders.data.filter(
    (order) => order.id !== inProgressOrder?.id,
  );
  const defaultAddress = addresses.find((address) => address.isDefault);
  const clerkName = clerkUser?.firstName ?? clerkUser?.fullName ?? "there";
  const clerkDisplayName = clerkUser?.fullName ?? user.name;

  return (
    <div className="flex flex-col gap-6">
      <AccountGreeting user={user} clerkName={clerkName} />
      {inProgressOrder ? (
        <AccountInProgressOrderCard
          order={inProgressOrder}
          items={inProgressItems}
        />
      ) : null}
      <AccountInfoCards
        defaultAddress={defaultAddress}
        user={user}
        clerkDisplayName={clerkDisplayName}
      />
      <AccountEarlierOrders orders={earlierOrders} />
      <AccountClaimOrderCard />
    </div>
  );
}
