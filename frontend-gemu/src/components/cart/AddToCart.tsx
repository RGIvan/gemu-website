"use client";

import { useTransition, useCallback } from "react";
import { addItem } from "@/app/(carts)/cart/action";
import { Loader } from "../common/Loader";
import { Session } from "next-auth";
import { toast } from "sonner";
import { EnrichedProduct } from "@/types/types";

interface AddToCartProps {
  product: EnrichedProduct;
  session: Session | null;
}

export default function AddToCart({ product, session }: AddToCartProps) {
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = useCallback(() => {
    if (!session) {
      toast.info("Debes estar registrado para añadir un producto al carrito.");
      return;
    }

    const productId = product.productId;
    const price = product.price;

    startTransition(async () => {
      try {
        await addItem(productId, price);
        toast.success("¡Producto añadido al carrito!");
      } catch (err) {
        console.error(err);
        toast.error("Hubo un error al añadir al carrito");
      }
    });
  }, [session, product]);

  return (
    <button
      onClick={handleAddToCart}
      className="w-full p-2 mt-4 transition-colors border rounded hover:bg-gray-800"
      disabled={isPending}
    >
      {isPending ? <Loader height={20} width={20} /> : "Añadir al carrito"}
    </button>
  );
}
