"use client";

import { useState, useTransition, useCallback } from "react";
import { CartItem } from "@/types/types";
import { colorMapping } from "@/helpers/colorMapping";
import { addItem } from "@/app/(carts)/cart/action";
import { Loader } from "../common/Loader";
import { Session } from "next-auth";
import { toast } from "sonner";

interface Variant {
  color: string;
  priceId: string; // identificador de precio/variante
}

interface AddToCartProps {
  productId: string;
  price: number;
  image?: string[];
  sizes?: string[];
  variants?: Variant[];
  session: Session | null;
}

export default function AddToCart({
  productId,
  price,
  image,
  sizes = [],
  variants = [],
  session,
}: AddToCartProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = useCallback(() => {
    if (!session) {
      toast.info("You must be registered to add a product to the cart.");
      return;
    }
    if (!selectedVariant) {
      toast.info("You have to select a color to add the product.");
      return;
    }
    if (!selectedSize) {
      toast.info("You have to select a size to add the product.");
      return;
    }

    const newItem: CartItem = {
      productId,
      quantity: 1,
      price,
      size: selectedSize,
      color: selectedVariant.color,
      image,
    };

    startTransition(() => addItem(newItem));
  }, [session, selectedVariant, selectedSize, productId, price, image]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-2.5">
        {sizes.map((size) => (
          <button
            key={size}
            className={`px-2 py-1 border rounded ${
              selectedSize === size
                ? "bg-white text-black"
                : "bg-black text-white"
            }`}
            onClick={() => setSelectedSize(size)}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2.5 mt-4">
        {variants.map((variant) => (
          <button
            key={variant.color}
            className={`w-8 h-8 rounded ${
              selectedVariant?.color === variant.color
                ? "border-2 border-white"
                : ""
            }`}
            style={{ backgroundColor: colorMapping[variant.color] }}
            onClick={() => setSelectedVariant(variant)}
          />
        ))}
      </div>
      <button
        onClick={handleAddToCart}
        className="w-full p-2 mt-4 border rounded"
      >
        {isPending ? <Loader height={20} width={20} /> : "Add To Cart"}
      </button>
    </div>
  );
}
