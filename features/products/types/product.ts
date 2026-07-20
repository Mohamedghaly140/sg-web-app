export type ProductImage = {
  id: string;
  imageId: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export type ProductCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: string;
  discount: string;
  priceAfterDiscount: string;
  ratingsAverage: string | null;
  ratingsQuantity: number;
  featured: boolean;
  sizes: string[];
  colors: string[];
  quantity: number;
};

export type ProductDetail = ProductSummary & {
  description: string;
  category: ProductCategoryRef;
  subCategories: ProductCategoryRef[];
  images: ProductImage[];
};
