export type SubCategory = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
  subCategories: SubCategory[];
};
