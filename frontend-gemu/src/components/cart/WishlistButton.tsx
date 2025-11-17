"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Session } from "next-auth";
import { toast } from "sonner";

interface WishlistButtonProps {
  session: Session | null;
  productId: string;
}

const WishlistButton = ({ session, productId }: WishlistButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Leer favoritos desde API cuando el componente se monta
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user?._id) return;
      try {
        const res = await fetch(`/api/favorites?userId=${session.user._id}`);
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data: { favorites: string[] } = await res.json();
        setIsFavorite(data.favorites.includes(productId));
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavorites();
  }, [session, productId]);

  const handleFavorites = useCallback(async () => {
    if (!session?.user?._id) {
      toast.warning(
        "Debes registrarte para poder añadir productos a favoritos."
      );
      return;
    }

    try {
      const method = isFavorite ? "DELETE" : "POST";
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user._id,
          productId,
        }),
      });
      if (!res.ok) throw new Error("Failed to update favorites");

      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite
          ? "Producto eliminado de favoritos"
          : "Producto añadido a favoritos"
      );
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
