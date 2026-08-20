export const wishlistKeys = {
  all: (userId: string) => ["wishlist", userId] as const,
  current: (userId: string) => ["wishlist", userId, "current"] as const,
};
