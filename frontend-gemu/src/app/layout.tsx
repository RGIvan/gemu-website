import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Providers from "./Providers";
import { Navbar } from "../components/common/Navbar";
import { Footer } from "../components/common/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { getTotalItems } from "./(carts)/cart/action";
import { getTotalWishlist } from "./(carts)/wishlist/action";

import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Gemu - Tu tienda de videojuegos en línea",
  description:
    "Descubre y compra los mejores videojuegos en nuestra tienda en línea. Ofertas exclusivas, lanzamientos y clásicos para todas las plataformas.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id ?? "";

  const totalItemsCart = session ? await getTotalItems(session) : 0;
  const totalItemsWishlists = userId ? await getTotalWishlist(userId) : 0;

  return (
    <html lang="en">
      <Providers>
        <body className={GeistSans.className}>
          <Navbar
            session={session}
            totalItemsCart={totalItemsCart}
            totalWishlists={totalItemsWishlists}
          />
          <main className="pointer-events-auto">
            {children}
            <Toaster position="top-right" duration={2000} />
            <Analytics />
            <SpeedInsights />
          </main>
          <Footer />
        </body>
      </Providers>
    </html>
  );
}
