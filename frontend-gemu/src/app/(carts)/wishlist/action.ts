"use server";

import { prisma } from "@/libs/prisma";
import { revalidatePath } from "next/cache";

// Tipo de favoritos
export type Favorites = {
  userId: string;
  favorites: string[];
};

// -----------------------------
// Obtener favoritos de un usuario
// -----------------------------
export async function getFavorites(userId: string): Promise<Favorites> {
  if (!userId) return { userId: "unknown", favorites: [] };

  try {
    const favs = await prisma.favoritos.findMany({
      where: { usuario_id: BigInt(userId) },
      select: { videojuego_id: true },
    });

    return {
      userId,
      favorites: favs.map((f) => f.videojuego_id.toString()),
    };
  } catch (err) {
    console.error("Error fetching favorites:", err);
    return { userId, favorites: [] };
  }
}

// -----------------------------
// Obtener el total de favoritos
// -----------------------------
export async function getTotalWishlist(userId: string): Promise<number> {
  const favs = await getFavorites(userId);
  return favs.favorites.length;
}

// -----------------------------
// Añadir producto a favoritos
// -----------------------------
export async function addFavorite(
  userId: string,
  productId: string
): Promise<Favorites> {
  if (!userId || !productId) return { userId, favorites: [] };

  try {
    await prisma.favoritos.upsert({
      where: {
        usuario_id_videojuego_id: {
          usuario_id: BigInt(userId),
          videojuego_id: BigInt(productId),
        },
      },
      update: {},
      create: {
        usuario_id: BigInt(userId),
        videojuego_id: BigInt(productId),
      },
    });
  } catch (err) {
    console.error("Error adding favorite:", err);
  }

  revalidatePath("/");
  revalidatePath("/wishlist");

  return getFavorites(userId);
}

// -----------------------------
// Eliminar producto de favoritos
// -----------------------------
export async function removeFavorite(
  userId: string,
  productId: string
): Promise<Favorites> {
  if (!userId || !productId) return { userId, favorites: [] };

  try {
    await prisma.favoritos.deleteMany({
      where: {
        usuario_id: BigInt(userId),
        videojuego_id: BigInt(productId),
      },
    });
  } catch (err) {
    console.error("Error removing favorite:", err);
  }

  revalidatePath("/");
  revalidatePath("/wishlist");

  return getFavorites(userId);
}
