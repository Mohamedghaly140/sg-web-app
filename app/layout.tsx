import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import Providers from "./providers";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getInitialCart } from "@/features/cart/queries/get-initial-cart";
import { getInitialWishlist } from "@/features/wishlist/queries/get-initial-wishlist";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Safa Ghaly",
  description: "Elegant couture, delivered to your door.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialCart, initialWishlist] = await Promise.all([
    getInitialCart(),
    getInitialWishlist(),
  ]);

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        cormorantGaramond.variable,
        lora.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers
          initialCart={initialCart}
          initialWishlist={initialWishlist}
        >
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
