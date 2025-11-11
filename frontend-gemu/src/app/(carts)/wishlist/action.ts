"use server";

import { kv } from "@/libs/kvMock";
import { revalidatePath } from "next/cache";

export type Wishlist = {
  userId: string;
  items: Array<{
    productId: string;
  }>;
};

// Agregar un producto a la wishlist
export async function addItem(productId: string, userId: string) {
  if (!userId) {
    console.error("User ID not provided.");
    return;
  }

  let wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);

  if (!wishlist) {
    wishlist = {
      userId,
      items: [{ productId }],
    };
  } else {
    const alreadyExists = wishlist.items.some(
      (item) => item.productId === productId
    );

    if (!alreadyExists) {
      wishlist.items.push({ productId });
    }
  }

  await kv.set(`wishlist-${userId}`, wishlist);
  revalidatePath("/wishlist");
}

// Eliminar un producto de la wishlist
export async function delItem(productId: string, userId: string) {
  if (!userId) {
    console.error("User ID not provided.");
    return;
  }

  const wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);
  if (!wishlist) return;

  wishlist.items = wishlist.items.filter(
    (item) => item.productId !== productId
  );
  await kv.set(`wishlist-${userId}`, wishlist);
  revalidatePath("/wishlist");
}

// Obtener todos los items de la wishlist
export async function getItems(userId: string) {
  if (!userId) {
    console.error("User ID not provided.");
    return [];
  }

  const wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);
  return wishlist?.items ?? [];
}

// Obtener el total de items en la wishlist
export async function getTotalWishlist(userId: string) {
  if (!userId) return 0;

  const wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);
  return wishlist?.items.length ?? 0;
}
