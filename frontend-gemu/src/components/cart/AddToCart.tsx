"use client";

import {
  useState,
  useTransition,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { CartItem, EnrichedProduct } from "@/types/types";
import { addItem } from "@/app/(carts)/cart/action";
import { Loader } from "../common/Loader";
import { Session } from "next-auth";
import { toast } from "sonner";

interface AddToCartProps {
  product: EnrichedProduct;
  session: Session | null;
  selectedVariant: EnrichedProduct | null;
  setSelectedVariant: Dispatch<SetStateAction<EnrichedProduct | null>>;
  sizes?: string[];
}

export default function AddToCart({
  product,
  session,
  selectedVariant,
  setSelectedVariant,
  sizes = [],
}: AddToCartProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = useCallback(() => {
    if (!session) {
      toast.info("You must be registered to add a product to the cart.");
      return;
    }
    if (!selectedVariant?.color) {
      toast.info("You have to select a color to add the product.");
      return;
    }
    if (!selectedSize) {
      toast.info("You have to select a size to add the product.");
      return;
    }

    const newItem: CartItem = {
      productId: product.productId,
      quantity: 1,
      price: product.price,
      size: selectedSize,
      color: selectedVariant.color,
      image: selectedVariant.images || [],
    };

    startTransition(() =>
      addItem(newItem.productId, newItem.size, newItem.color, newItem.price)
    );
  }, [session, selectedVariant, selectedSize, product]);

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

      <button
        onClick={handleAddToCart}
        className="w-full p-2 mt-4 border rounded"
      >
        {isPending ? <Loader height={20} width={20} /> : "Add To Cart"}
      </button>
    </div>
  );
}
