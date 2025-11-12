import { Products } from "@/components/products/Products";
import Link from "next/link";
import { getItems } from "./action";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { Suspense } from "react";
import { Loader } from "@/components/common/Loader";

export async function generateMetadata() {
  return {
    title: "Wishlist | Ecommerce Template",
    description: `Wishlist at e-commerce template made by Marcos Cámara`,
  };
}

const Wishlists = async () => {
  const session: Session | null = await getServerSession(authOptions);

  // 🔹 Usuario autenticado
  if (session?.user?.id) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[calc(100vh-91px)]">
            <Loader height={30} width={30} />
          </div>
        }
      >
        <ProductsWishlist session={session} />
      </Suspense>
    );
  }

  // 🔹 Usuario no autenticado
  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-91px)] gap-2 px-4">
      <h1 className="mb-6 text-4xl font-bold">YOUR WISHLIST IS EMPTY</h1>
      <p className="mb-4 text-lg text-center">
        Not registered? You must be in order to save your favorite products.
      </p>
      <Link
        href="/login"
        className="flex font-medium items-center bg-[#0C0C0C] justify-center text-sm min-w-[160px] max-w-[160px] h-[40px] px-[10px] rounded-md border border-solid border-[#2E2E2E] transition-all hover:bg-[#1F1F1F] hover:border-[#454545]"
      >
        Login
      </Link>
    </div>
  );
};

const ProductsWishlist = async ({ session }: { session: Session }) => {
  const userId = String(session.user.id);
  const filteredWishlist = await getItems(userId);

  if (filteredWishlist && filteredWishlist.length > 0) {
    return (
      <div className="pt-12">
        <h2 className="mb-5 text-xl font-bold sm:text-2xl">YOUR WISHLIST</h2>
        <Products
          products={filteredWishlist}
          extraClassname={"colums-mobile"}
        />
      </div>
    );
  }

  // 🔹 Wishlist vacía
  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-91px)] gap-2 px-4">
      <h1 className="mb-6 text-4xl font-bold">YOUR WISHLIST IS EMPTY</h1>
      <p className="mb-4 text-lg text-center">
        When you have added something to your wishlist, it will appear here.
        Want to get started?
      </p>
      <Link
        href="/"
        className="flex font-medium items-center bg-[#0C0C0C] justify-center text-sm min-w-[160px] max-w-[160px] h-[40px] px-[10px] rounded-md border border-solid border-[#2E2E2E] transition-all hover:bg-[#1F1F1F] hover:border-[#454545]"
      >
        Start
      </Link>
    </div>
  );
};

export default Wishlists;
