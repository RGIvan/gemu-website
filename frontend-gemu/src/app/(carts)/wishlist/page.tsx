import { Products } from "@/components/products/Products";
import Link from "next/link";
import { getFavorites } from "./action";
import { prisma } from "@/libs/prisma";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { Suspense } from "react";
import { Loader } from "@/components/common/Loader";
import type { EnrichedProduct, Videojuego } from "@/types/types";

export async function generateMetadata() {
  return {
    title: "Wishlists | Ecommerce Template",
    description: `Wishlist at e-commerce template`,
  };
}

const WishlistPage = async () => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-91px)] gap-2 px-4">
        <h1 className="mb-6 text-4xl font-bold">YOUR WISHLIST IS EMPTY</h1>
        <p className="mb-4 text-lg">
          You must be registered to save your favorite products.
        </p>
        <Link
          className="flex font-medium items-center bg-black justify-center text-sm min-w-[160px] max-w-[160px] h-[40px] px-2 rounded-md border border-solid border-gray-600 hover:bg-gray-900"
          href="/login"
        >
          Login
        </Link>
      </div>
    );
  }

  const userId = session.user._id;
  const favorites = await getFavorites(userId);

  // Traemos los productos favoritos desde Prisma
  const productsFromDb = await prisma.videojuegos.findMany({
    where: { id: { in: favorites.favorites.map(BigInt) } },
  });

  if (productsFromDb.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-91px)] gap-2 px-4">
        <h1 className="mb-6 text-4xl font-bold">YOUR WISHLIST IS EMPTY</h1>
        <p className="mb-4 text-lg">Start adding products to your wishlist!</p>
        <Link
          className="flex font-medium items-center bg-black justify-center text-sm min-w-[160px] max-w-[160px] h-[40px] px-2 rounded-md border border-solid border-gray-600 hover:bg-gray-900"
          href="/"
        >
          Start
        </Link>
      </div>
    );
  }

  // Mapear los productos de Prisma a EnrichedProduct
  const products: EnrichedProduct[] = productsFromDb.map((p: Videojuego) => ({
    _id: p.id.toString(),
    productId: p.id.toString(),
    name: p.nombre,
    category: p.categoria,
    price: p.precio,
    quantity: 1,
    total: p.precio,
    purchased: false,
    image: p.imagenUrl ? [p.imagenUrl] : [],
    size: undefined,
    color: undefined,
  }));

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-91px)]">
          <Loader height={30} width={30} />
        </div>
      }
    >
      <div className="pt-12">
        <h2 className="mb-5 text-xl font-bold sm:text-2xl">YOUR WISHLIST</h2>
        <Products products={products} extraClassname="colums-mobile" />
      </div>
    </Suspense>
  );
};

export default WishlistPage;
