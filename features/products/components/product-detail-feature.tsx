import { notFound } from "next/navigation";

import { RatingSummary } from "@/components/shared/rating-summary";
import { Breadcrumb } from "@/features/products/components/breadcrumb";
import { Gallery } from "@/features/products/components/gallery";
import { PriceBlock } from "@/features/products/components/price-block";
import { RelatedProducts } from "@/features/products/components/related-products";
import { ShareButton } from "@/features/products/components/share-button";
import { StickyAddToCartBar } from "@/features/products/components/sticky-add-to-cart-bar";
import { VariantSelectors } from "@/features/products/components/variant-selectors";
import { getProduct } from "@/features/products/queries/get-product";
import { getProducts } from "@/features/products/queries/get-products";
import type { ProductSummary } from "@/features/products/types/product";
import ReviewsFeature from "@/features/reviews";

const RELATED_PRODUCTS_LIMIT = 8;

type ProductDetailFeatureProps = {
  slug: string;
  searchParams: Record<string, string | string[] | undefined>;
};

// Named `ProductDetailFeature` (per docs/screens/product-detail.md) rather than the
// phase-tracker's shorthand "ProductFeature", because features/products/index.tsx is
// already the products-LIST feature (`ProductsFeature`).
// No dedicated related endpoint (docs/screens/product-detail.md §6): reuse the
// catalog list filtered to this category, then drop the current product. Filtering
// one id out of an 8-item page can leave 7 cards — expected, not a bug.
// Fetched in its own async section so it runs concurrently with the reviews read
// instead of blocking it (both are independent once the product id/category exist).
async function RelatedProductsSection({
  categorySlug,
  excludeProductId,
}: {
  categorySlug: string;
  excludeProductId: string;
}) {
  const related = await getProducts({
    category: categorySlug,
    limit: RELATED_PRODUCTS_LIMIT,
  });
  const relatedProducts: ProductSummary[] = related.data.filter(
    (candidate) => candidate.id !== excludeProductId,
  );

  return (
    <RelatedProducts products={relatedProducts} categorySlug={categorySlug} />
  );
}

export default async function ProductDetailFeature({
  slug,
  searchParams,
}: ProductDetailFeatureProps) {
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const isSoldOut = product.quantity <= 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-8 sm:px-6 sm:pb-8 lg:px-8">
      <Breadcrumb
        category={product.category}
        subCategory={product.subCategories[0]}
        productName={product.name}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <Gallery
          images={product.images}
          fallbackImageUrl={product.imageUrl}
          productName={product.name}
        />

        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {product.name}
          </h1>
          <RatingSummary
            ratingsAverage={product.ratingsAverage}
            ratingsQuantity={product.ratingsQuantity}
          />
          <PriceBlock
            price={product.price}
            discount={product.discount}
            priceAfterDiscount={product.priceAfterDiscount}
          />
          {/* Stock badge is rendered beside the quantity stepper in VariantSelectors. */}
          <VariantSelectors
            sizes={product.sizes}
            colors={product.colors}
            quantity={product.quantity}
          />
          <ShareButton title={product.name} />
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Description
        </h2>
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {product.description}
        </p>
      </section>

      <ReviewsFeature
        productId={product.id}
        ratingsAverage={product.ratingsAverage}
        ratingsQuantity={product.ratingsQuantity}
        searchParams={searchParams}
      />

      <RelatedProductsSection
        categorySlug={product.category.slug}
        excludeProductId={product.id}
      />

      <StickyAddToCartBar
        priceAfterDiscount={product.priceAfterDiscount}
        soldOut={isSoldOut}
      />
    </div>
  );
}
