"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { Session } from "next-auth";
import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import { prisma } from "@/libs/prisma";

export type Wishlist = {
  userId: string;
  items: Array<{
    productId: number;
  }>;
};

export async function addItem(productId: number) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user._id) {
    console.error("User ID not found.");
    return;
  }

  const userId = session.user._id;
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

export async function getItems(userId: string) {
  if (!userId) {
    console.error("User ID not found.");
    return null;
  }

  const wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);
  if (!wishlist) {
    console.error("Wishlist not found.");
    return [];
  }

  const productIds = wishlist.items.map((item) => Number(item.productId));

  if (productIds.length === 0) return [];

  try {
    const products = await prisma.videojuegos.findMany({
      where: {
        id: { in: productIds },
      },
    });

    return products;
  } catch (error) {
    console.error("Error getting wishlist products:", error);
    return [];
  }
}

export async function getTotalWishlist() {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user._id) return 0;

  const wishlist: Wishlist | null = await kv.get(
    `wishlist-${session.user._id}`
  );
  return wishlist?.items.length || 0;
}

export async function delItem(productId: number) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user._id;

  if (!userId) {
    console.error("User not found.");
    return;
  }

  const wishlist: Wishlist | null = await kv.get(`wishlist-${userId}`);

  if (wishlist && wishlist.items) {
    const updatedWishlist = {
      userId,
      items: wishlist.items.filter((item) => item.productId !== productId),
    };

    await kv.set(`wishlist-${userId}`, updatedWishlist);
    revalidatePath("/wishlist");
  }
}
