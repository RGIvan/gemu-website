"use client";

import { useCallback } from "react";
import { CartItem } from "@/types/types";
import { delItem } from "@/app/(carts)/cart/action";

interface Props {
  product: CartItem;
}

const DeleteButton = ({ product }: Props) => {
  const handleDelete = useCallback(() => {
    if (!product.size || !product.color) return; // seguridad
    delItem(product.productId, product.size, product.color);
  }, [product]);

  return (
    <button onClick={handleDelete} aria-label="Delete item">
      🗑️
    </button>
  );
};

export default DeleteButton;
