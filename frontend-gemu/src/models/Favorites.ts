"use server";

import { kv } from "@/libs/kvMock";
import { revalidatePath } from "next/cache";
import { prisma } from "@/libs/prisma"; // opcional si quieres mezclar datos

export type Favorites = {
  userId: string;
  items: Array<{ productId: string }>;
};

// Agregar favorito
export async function addFavorite(userId: string, productId: string) {
  if (!userId) return;

  let favorite: Favorites | null = await kv.get(`favorite-${userId}`);

  if (!favorite) {
    favorite = { userId, items: [{ productId }] };
  } else {
    const exists = favorite.items.some((item) => item.productId === productId);
    if (!exists) favorite.items.push({ productId });
  }

  await kv.set(`favorite-${userId}`, favorite);
  revalidatePath("/favorites");
}

// Obtener favoritos
export async function getFavoriteItems(userId: string) {
  if (!userId) return [];
  const favorite: Favorites | null = await kv.get(`favorite-${userId}`);
  if (!favorite) return [];

  const productIds = favorite.items.map((item) => item.productId);
  if (productIds.length === 0) return [];

  try {
    const products = await prisma.videojuegos.findMany({
      where: { id: { in: productIds.map((id) => BigInt(id)) } },
    });
    return products;
  } catch (error) {
    console.error("Error getting favorite products:", error);
    return [];
  }
}

// Eliminar favorito
export async function removeFavorite(userId: string, productId: string) {
  if (!userId) return;

  const favorite: Favorites | null = await kv.get(`favorite-${userId}`);
  if (!favorite) return;

  favorite.items = favorite.items.filter(
    (item) => item.productId !== productId
  );
  await kv.set(`favorite-${userId}`, favorite);
  revalidatePath("/favorites");
}

// Total favoritos
export async function getTotalFavorites(userId: string): Promise<number> {
  if (!userId) return 0;
  const favorite: Favorites | null = await kv.get(`favorite-${userId}`);
  return favorite?.items.length || 0;
}
