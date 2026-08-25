import { CartContent } from "@/features/cart/components/cart-content";

export default function CartFeature() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6">
      <h1 className="sr-only">Shopping cart</h1>
      <CartContent />
    </div>
  );
}
