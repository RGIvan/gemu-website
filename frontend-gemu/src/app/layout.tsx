"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { Session } from "next-auth";
import { kv } from "@/libs/kvMock";
import { revalidatePath } from "next/cache";
import { prisma } from "@/libs/prisma";

export type Wishlist = {
  userId: string;
  items: Array<{
    productId: string; // guardamos como string
  }>;
};

// -----------------------------
// Agregar item al wishlist
// -----------------------------
export async function addItem(productId: string) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user._id;
  if (!userId) return;

  let wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);

  if (!wishlist) {
    wishlist = { userId, items: [{ productId }] };
  } else {
    const exists = wishlist.items.some((item) => item.productId === productId);
    if (!exists) wishlist.items.push({ productId });
  }

  await kv.set(`wishlist-${userId}`, wishlist);
  revalidatePath("/wishlist");
}

// -----------------------------
// Obtener items del wishlist
// -----------------------------
export async function getItems(userId: string) {
  if (!userId) return [];
  const wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);
  if (!wishlist) return [];
  const productIds = wishlist.items.map((item) => item.productId);

  if (productIds.length === 0) return [];

  try {
    const products = await prisma.videojuegos.findMany({
      where: { id: { in: productIds.map((id) => BigInt(id)) } },
    });
    return products;
  } catch (error) {
    console.error("Error getting wishlist products:", error);
    return [];
  }
}

// -----------------------------
// Obtener total de items del wishlist
// -----------------------------
export async function getTotalWishlist(
  session: Session | null
): Promise<number> {
  const userId = session?.user._id;
  if (!userId) return 0;

  const wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);
  return wishlist?.items.length || 0;
}

// -----------------------------
// Eliminar item del wishlist
// -----------------------------
export async function delItem(productId: string) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user._id;
  if (!userId) return;

  const wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);
  if (!wishlist) return;

  wishlist.items = wishlist.items.filter(
    (item) => item.productId !== productId
  );
  await kv.set(`wishlist-${userId}`, wishlist);
  revalidatePath("/wishlist");
}
