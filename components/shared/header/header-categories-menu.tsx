"use client";

import Link from "next/link";

import type { Category } from "@/features/categories/types/category";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

type HeaderCategoriesMenuProps = {
  categories: Category[];
};

export function HeaderCategoriesMenu({
  categories,
}: HeaderCategoriesMenuProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              navigationMenuTriggerStyle(),
              "text-eyebrow h-auto bg-transparent px-0 py-0 text-foreground hover:bg-transparent focus:bg-transparent data-open:bg-transparent data-open:hover:bg-transparent data-open:focus:bg-transparent data-popup-open:bg-transparent data-popup-open:hover:bg-transparent",
            )}
          >
            Categories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex w-64 flex-col gap-1 p-2">
              {categories.map((category) => (
                <li key={category.id} className="flex flex-col gap-0.5">
                  <NavigationMenuLink
                    render={
                      <Link href={`/categories/${category.slug}`} />
                    }
                    className="text-sm font-medium text-foreground hover:bg-transparent hover:text-accent focus:bg-transparent focus:text-accent data-active:bg-transparent data-active:text-accent"
                  >
                    {category.name}
                  </NavigationMenuLink>
                  {category.subCategories.map((subCategory) => (
                    <NavigationMenuLink
                      key={subCategory.id}
                      render={
                        <Link href={`/categories/${subCategory.slug}`} />
                      }
                      className="ps-4 text-sm text-muted-foreground hover:bg-transparent hover:text-accent focus:bg-transparent focus:text-accent data-active:bg-transparent data-active:text-accent"
                    >
                      {subCategory.name}
                    </NavigationMenuLink>
                  ))}
                </li>
              ))}
              <li>
                <NavigationMenuLink
                  render={<Link href="/categories" />}
                  className="mt-1 border-t border-border pt-2 text-sm font-medium text-foreground hover:bg-transparent hover:text-accent focus:bg-transparent focus:text-accent data-active:bg-transparent data-active:text-accent"
                >
                  View all categories
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
