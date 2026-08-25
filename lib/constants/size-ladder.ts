/**
 * The canonical size ladder the storefront renders.
 *
 * This is a hardcoded list, not a facet source — `GET /products` returns no
 * available-size facets (**GAP-9**) and `GET /products/:slug` returns only a
 * flat `sizes[]` with no per-variant stock. Rendering the full ladder and
 * disabling the entries a product does not list is therefore a truthful
 * statement ("this product is not offered in L"), not an inferred availability
 * claim.
 *
 * Shared by the listing's filter drawer and the product page's size control so
 * the two never drift apart. Replace with a real facet source if the backend
 * ever exposes one.
 */
export const SIZE_LADDER = ["XS", "S", "M", "L", "XL"] as const;

export type Size = (typeof SIZE_LADDER)[number];
