import { getShippingFee } from "@/features/checkout/queries/get-shipping-fee";
import { formatEGP } from "@/lib/format";

export async function DeliveryRow() {
  // Cairo is a display default because a product page has no destination. The
  // API exposes no delivery-day range, so no delivery-time promise is shown.
  const shipping = await getShippingFee({
    country: "Egypt",
    governorate: "Cairo",
  });

  return (
    <span className="figures text-foreground">
      {formatEGP(shipping.fee)}
    </span>
  );
}
