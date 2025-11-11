"use client";

import { useCallback } from "react";
import { CartItem } from "@/types/types";
import { delItem } from "@/app/(carts)/cart/action";

interface Props {
  product: CartItem;
}

const DeleteButton = ({ product }: Props) => {
  const handleDelete = useCallback(() => {
    delItem(product);
  }, [product]);

  return (
    <button onClick={handleDelete} aria-label="Delete item">
      🗑️
    </button>
  );
};

export default DeleteButton;
