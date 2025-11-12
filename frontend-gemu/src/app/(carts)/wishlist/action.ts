// app/(carts)/wishlist/action.ts
"use server";

import { kv } from "@vercel/kv";
import { Favorites } from "@/types/types";

// Obtener favoritos de un usuario
export async function getFavorites(userId: string): Promise<Favorites> {
  const data = await kv.get<Favorites>(`favorites-${userId}`);
  return data ?? { userId, favorites: [] };
}

// Añadir producto a favoritos
export async function addFavorite(userId: string, productId: string) {
  const favs = await getFavorites(userId);
  if (!favs.favorites.includes(productId)) {
    favs.favorites.push(productId);
    await kv.set(`favorites-${userId}`, favs);
  }
  return favs;
}

// Eliminar producto de favoritos
export async function removeFavorite(userId: string, productId: string) {
  const favs = await getFavorites(userId);
  favs.favorites = favs.favorites.filter((id) => id !== productId);
  await kv.set(`favorites-${userId}`, favs);
  return favs;
}
