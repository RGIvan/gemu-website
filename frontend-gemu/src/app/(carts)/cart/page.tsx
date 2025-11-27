import { Products } from "@/components/products/Products";
import Link from "next/link";
import { getItems } from "./action";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { Suspense } from "react";
import { Loader } from "@/components/common/Loader";
import dynamic from "next/dynamic";
import { EnrichedProduct } from "@/types/types";

const ButtonCheckout = dynamic(
  () => import("../../../components/cart/ButtonCheckout"),
  {
    ssr: false,
    loading: () => (
      <p className="flex items-center justify-center w-full h-full text-sm">
        Continuar
      </p>
    ),
  }
);

export async function generateMetadata() {
  return {
    title: "Cart | Prisma E-commerce",
    description: `Cart page using Prisma + Next.js`,
  };
}

const CartPage = async () => {
  const session: Session | null = await getServerSession(authOptions);

  if (session?.user) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[calc(100vh-91px)]">
            <Loader height={30} width={30} />
          </div>
        }
      >
        <ProductsCart session={session} />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-91px)] gap-2 px-4">
      <h1 className="mb-6 text-4xl font-bold">TU CARRITO ESTÁ VACÍO</h1>
      <p className="mb-4 text-lg">
        Debes iniciar sesión para ver los productos en tu carrito.
      </p>
      <Link
        className="flex font-medium items-center bg-[#0C0C0C] justify-center text-sm min-w-[160px] max-w-[160px] h-[40px] px-[10px] rounded-md border border-solid border-[#2E2E2E] transition-all hover:bg-[#1F1F1F] hover:border-[#454545]"
        href="/login"
      >
        Login
      </Link>
    </div>
  );
};

const ProductsCart = async ({ session }: { session: Session }) => {
  // ✅ Llamamos al action que obtiene el carrito con los videojuegos desde Prisma
  const enrichedCart: EnrichedProduct[] | undefined = await getItems(
    String(session.user.id) // Prisma usa BigInt, session usa string
  );

  const calculateTotalPrice = (cart: EnrichedProduct[] | undefined) => {
    if (!cart || cart.length === 0) return 0;
    return cart
      .reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0)
      .toFixed(2);
  };

  const totalPrice = calculateTotalPrice(enrichedCart);

  if (enrichedCart && enrichedCart.length > 0) {
    return (
      <div className="pt-12">
        <h2 className="mb-5 text-xl font-bold sm:text-2xl">TU CARRITO</h2>

        {/* ✅ Renderizado del componente de productos */}
        <Products
          products={enrichedCart.map((item) => ({
            id: item.id,
            productId: item.id.toString(), // BigInt a string
            _id: item.id.toString(),
            name: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            image: item.image || "/placeholder.png",
          }))}
          session={session}
          extraClassname="cart-ord-mobile"
        />

        {/* ✅ Barra inferior fija */}
        <div className="fixed left-[50%] translate-x-[-50%] bottom-4 w-[90%] z-10 sm:w-[360px] rounded-xl overflow-hidden flex bg-black border border-solid border-border-primary h-min">
          <div className="flex flex-col p-2.5 justify-center w-1/2 gap-2 text-center">
            <div className="flex gap-2.5 justify-center text-sm">
              <span>Total:</span>
              <span>{totalPrice}€</span>
            </div>
            <span className="text-xs">+ TAX INCL.</span>
          </div>
          <div className="w-1/2 border-l border-solid bg-background-secondary border-border-primary">
            <ButtonCheckout session={session} cartWithProducts={enrichedCart} />
          </div>
        </div>
      </div>
    );
  }

  // ✅ Si el carrito está vacío
  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-91px)] gap-2 px-4">
      <h1 className="mb-6 text-4xl font-bold">TU CARRITO ESTÁ VACÍO</h1>
      <p className="mb-4 text-lg">
        Parece que no has añadido ningún producto a tu carrito aún.
      </p>
      <Link
        className="flex font-medium items-center bg-[#0C0C0C] justify-center text-sm min-w-[160px] max-w-[160px] h-[40px] px-[10px] rounded-md border border-solid border-[#2E2E2E] transition-all hover:bg-[#1F1F1F] hover:border-[#454545]"
        href="/"
      >
        Ir a la tienda
      </Link>
    </div>
  );
};

export default CartPage;
