import { getCategories } from "@/features/home/queries/get-categories";

export default async function HomeFeature() {
  const categories = await getCategories();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <li key={category.id} className="text-sm text-foreground">
              {category.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
