"use client";

import { useCallback } from "react";
import { CartItem } from "@/types/types";
import { addItem, delOneItem } from "@/app/(carts)/cart/action";
import { toast } from "sonner";

interface Props {
  product: CartItem;
}

const ProductCartInfo = ({ product }: Props) => {
  const { productId, quantity, price } = product;

  const handleAddItem = useCallback(() => {
    try {
      addItem(productId, price); // size/color opcionales
      toast.success("Producto añadido al carrito");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("No se pudo añadir el producto al carrito");
    }
  }, [productId, price]);

  const handleDelItem = useCallback(() => {
    try {
      delOneItem(productId, undefined, undefined); // size/color opcionales
      toast.success("Producto eliminado del carrito");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("No se pudo eliminar el producto del carrito");
    }
  }, [productId]);

  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b">
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelItem}
          className="px-2 py-1 border rounded hover:bg-red-100"
        >
          -
        </button>
        <span>{quantity}</span>
        <button
          onClick={handleAddItem}
          className="px-2 py-1 border rounded hover:bg-green-100"
        >
          +
        </button>
      </div>

      <div className="font-semibold">{(price * quantity).toFixed(2)} €</div>
    </div>
  );
};

export default ProductCartInfo;
