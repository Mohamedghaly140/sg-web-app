import { WishlistList } from "@/features/wishlist/components/wishlist-list";

export default function WishlistFeature() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
        Wishlist
      </h1>
      <WishlistList />
    </div>
  );
}
