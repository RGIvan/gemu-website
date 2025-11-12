"use client";

import React, { useMemo, useCallback } from "react";
import { Session } from "next-auth";
import { toast } from "sonner";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "@/app/(carts)/wishlist/action";

interface WishlistButtonProps {
  session: Session | null;
  productId: string;
}

const WishlistButton = ({ session, productId }: WishlistButtonProps) => {
  const userId = session?.user._id;

  const [isFavorite, setIsFavorite] = React.useState(false);

  // Inicializamos el estado del botón
  React.useEffect(() => {
    async function checkFavorite() {
      if (!userId) return;
      const favs = await getFavorites(userId);
      setIsFavorite(favs.favorites.includes(productId));
    }
    checkFavorite();
  }, [userId, productId]);

  const handleFavorites = useCallback(async () => {
    if (!userId) {
      toast.warning("Debes registrarte para poder usar favoritos.");
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(userId, productId);
      } else {
        await addFavorite(userId, productId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error(error);
      toast.error("Ha ocurrido un error al actualizar tus favoritos.");
    }
  }, [userId, isFavorite, productId]);

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
