"use client";

import { useCallback } from "react";
import { CartItem } from "@/types/types";
import { delItem } from "@/app/(carts)/cart/action";
import { toast } from "sonner";

interface Props {
  product: CartItem;
}

const DeleteButton = ({ product }: Props) => {
  const handleDelete = useCallback(() => {
    try {
      // Llamar a delItem pasando size y color aunque sean undefined
      delItem(product.productId);
      toast.success("Producto eliminado del carrito");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("No se pudo eliminar el producto del carrito");
    }
  }, [product]);

  return (
    <button
      onClick={handleDelete}
      aria-label="Delete item"
      className="p-1 transition-colors rounded hover:bg-red-200"
    >
      🗑️
    </button>
  );
};

export default DeleteButton;
