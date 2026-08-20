import type { Metadata } from "next";
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import Providers from "./providers";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getInitialCart } from "@/features/cart/queries/get-initial-cart";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  const initialCart = await getInitialCart();

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        inter.variable,
        playfairDisplay.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers initialCart={initialCart}>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
