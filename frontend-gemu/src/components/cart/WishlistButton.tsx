"use client";

import React, { useMemo, useCallback } from "react";
import { Session } from "next-auth";
import { toast } from "sonner";
import { addItem, delItem, Wishlists } from "@/app/(carts)/wishlist/action";

interface WishlistButtonProps {
  session: Session | null;
  productId: string; // viene del frontend como string
  wishlistString: string;
}

const WishlistButton = ({
  session,
  productId,
  wishlistString,
}: WishlistButtonProps) => {
  const productIdBigInt = BigInt(productId);

  const isFavorite = useMemo(() => {
    if (session && wishlistString) {
      const wishlist: Wishlists = JSON.parse(wishlistString);
      return wishlist.items.some((item) => item.productId === productIdBigInt);
    }
    return false;
  }, [session, wishlistString, productIdBigInt]);

  const handleFavorites = useCallback(async () => {
    if (!session?.user) {
      toast.warning("You must be registered to add a product to the wishlist.");
      return;
    }

    try {
      if (isFavorite) {
        await delItem(productIdBigInt); // ahora es bigint
      } else {
        await addItem(productIdBigInt); // ahora es bigint
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating your wishlist.");
    }
  }, [isFavorite, productIdBigInt, session?.user]);

  return (
    <button
      onClick={handleFavorites}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
};

export default WishlistButton;
