"use client";

import { useCallback } from "react";
import { CartItem } from "@/types/types";
import { addItem, delOneItem } from "@/app/(carts)/cart/action";

interface Props {
  product: CartItem;
}

const ProductCartInfo = ({ product }: Props) => {
  const { productId, quantity, price, size, color } = product;

  const handleAddItem = useCallback(() => {
    addItem({ ...product, quantity: 1 });
  }, [product]);

  const handleDelItem = useCallback(() => {
    delOneItem({ ...product, quantity: 1 });
  }, [product]);

  return (
    <div className="flex items-center justify-between">
      <div>
        {size && <span>{size}</span>} {color && <span>{color}</span>}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleDelItem}>-</button>
        <span>{quantity}</span>
        <button onClick={handleAddItem}>+</button>
      </div>
      <div>{(price * quantity).toFixed(2)} €</div>
    </div>
  );
};

export default ProductCartInfo;
