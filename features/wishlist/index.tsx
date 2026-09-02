import { WishlistList } from "@/features/wishlist/components/wishlist-list";

export default function WishlistFeature() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 border-b border-border pb-3">
        <h1 className="font-heading text-2xl font-normal text-foreground">
          Wishlist
        </h1>
      </header>
      <WishlistList />
    </div>
  );
}
