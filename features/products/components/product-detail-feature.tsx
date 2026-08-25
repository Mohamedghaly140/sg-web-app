import { notFound } from "next/navigation";

import { RatingSummary } from "@/components/shared/rating-summary";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/features/products/components/breadcrumb";
import { Gallery } from "@/features/products/components/gallery";
import { PriceBlock } from "@/features/products/components/price-block";
import { ProductKicker } from "@/features/products/components/product-kicker";
import { ProductMetaRows } from "@/features/products/components/product-meta-rows";
import { ProductPurchaseProvider } from "@/features/products/components/product-purchase-provider";
import { RelatedProducts } from "@/features/products/components/related-products";
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
  const productSummary: ProductSummary = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    price: product.price,
    discount: product.discount,
    priceAfterDiscount: product.priceAfterDiscount,
    ratingsAverage: product.ratingsAverage,
    ratingsQuantity: product.ratingsQuantity,
    featured: product.featured,
    sizes: product.sizes,
    colors: product.colors,
    quantity: product.quantity,
  };

  return (
    <ProductPurchaseProvider
      productId={product.id}
      sizes={product.sizes}
      colors={product.colors}
      quantity={product.quantity}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pt-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
        <Breadcrumb
          category={product.category}
          subCategory={product.subCategories[0]}
          productName={product.name}
        />

        {/* The designed 1fr/380px pair is a desktop composition: the buy box is
            a fixed rail, so holding it below `lg` pins 380px against a viewport
            narrower than that and scrolls the page sideways. Stack instead. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <Gallery
            images={product.images}
            fallbackImageUrl={product.imageUrl}
            productName={product.name}
          />

          <div className="flex flex-col gap-3 self-start">
            <ProductKicker
              category={product.category}
              subCategory={product.subCategories[0]}
            />
            {/* The handoff's frame heading is not part of the real page, so the
                product name is the page's single h1. */}
            <h1 className="font-heading text-[31px] text-foreground">
              {product.name}
            </h1>
            <PriceBlock
              price={product.price}
              discount={product.discount}
              priceAfterDiscount={product.priceAfterDiscount}
            />
            <RatingSummary
              variant="compact"
              ratingsAverage={product.ratingsAverage}
              ratingsQuantity={product.ratingsQuantity}
            />
            <Separator className="my-2" />
            <VariantSelectors
              product={productSummary}
              sizes={product.sizes}
              colors={product.colors}
              quantity={product.quantity}
            />
            <p className="whitespace-pre-line text-justify text-xs text-muted-foreground">
              {product.description}
            </p>
            <Separator className="my-2" />
            <ProductMetaRows />
          </div>
        </div>

        <ReviewsFeature
          productId={product.id}
          slug={slug}
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
    </ProductPurchaseProvider>
  );
}
