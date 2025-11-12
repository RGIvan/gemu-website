"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  // Leer favoritos desde kv cuando el componente se monta
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user?.id) return;
      const favs = await getFavorites(session.user.id);
      setIsFavorite(favs.favorites.includes(productId));
    };
    fetchFavorites();
  }, [session, productId]);

  const handleFavorites = useCallback(async () => {
    if (!session?.user?.id) {
      toast.warning(
        "Debes registrarte para poder añadir productos a favoritos."
      );
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(session.user.id, productId);
        setIsFavorite(false);
      } else {
        await addFavorite(session.user.id, productId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al actualizar tus favoritos.");
    }
  }, [session, isFavorite, productId]);

  return (
    <button
      onClick={handleFavorites}
      title={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
    >
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
};

export default WishlistButton;
