"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { Session } from "next-auth";
import { toast } from "sonner";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/app/(carts)/wishlist/action";

interface WishlistButtonProps {
  session: Session | null;
  productId: string;
}

const WishlistButton = ({ session, productId }: WishlistButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user?._id) return;
      try {
        const data = await getFavorites(session.user._id);
        setIsFavorite(data.favorites.includes(productId));
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavorites();
  }, [session, productId]);

  const handleFavorites = useCallback(async () => {
    if (!session?.user?._id) {
      toast.info("Debes registrarte para añadir productos a favoritos.");
      return;
    }

    startTransition(async () => {
      try {
        if (isFavorite) {
          await removeFavorite(session.user._id, productId);
          setIsFavorite(false);
          toast.success("Producto eliminado de favoritos");
        } else {
          await addFavorite(session.user._id, productId);
          setIsFavorite(true);
          toast.success("Producto añadido a favoritos");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al actualizar favoritos");
      }
    });
  }, [session, isFavorite, productId]);

  return (
    <button
      onClick={handleFavorites}
      disabled={isPending}
      title={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
      className="text-xl"
    >
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
};

export default WishlistButton;
