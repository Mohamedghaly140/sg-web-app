import { CartContent } from "@/features/cart/components/cart-content";

export default function CartFeature() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
        Shopping Cart
      </h1>
      <CartContent />
    </div>
  );
}
