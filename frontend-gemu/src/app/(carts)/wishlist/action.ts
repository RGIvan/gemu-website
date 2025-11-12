"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { Session } from "next-auth";
import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import { prisma } from "@/libs/prisma";

// ----------------------
// Tipado de la Wishlist
// ----------------------
export type WishlistItem = {
  productId: bigint;
};

export type Wishlists = {
  userId: string;
  items: WishlistItem[];
};

// ----------------------
// Añadir un producto
// ----------------------
export async function addItem(productId: bigint) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error("User Id not found.");
    return;
  }

  const userId = String(session.user.id);
  let wishlists: Wishlists | null = await kv.get(`wishlist-${userId}`);

  let myWishlists: Wishlists;

  if (!wishlists || !wishlists.items) {
    myWishlists = {
      userId,
      items: [{ productId }],
    };
  } else {
    const itemExists = wishlists.items.some(
      (item) => item.productId === productId
    );

    myWishlists = itemExists
      ? wishlists
      : {
          ...wishlists,
          items: [...wishlists.items, { productId }],
        };
  }

  await kv.set(`wishlist-${userId}`, myWishlists);
  revalidatePath("/wishlist");
}

// ----------------------
// Obtener productos de wishlist
// ----------------------
export async function getItems(userId: string) {
  if (!userId) {
    console.error("User Id not found.");
    return null;
  }

  const wishlist: Wishlists | null = await kv.get(`wishlist-${userId}`);

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    console.warn("Wishlist not found or empty.");
    return [];
  }

  const products = [];

  for (const wishlistItem of wishlist.items) {
    try {
      const product = await prisma.videojuegos.findUnique({
        where: { id: wishlistItem.productId },
      });

      if (product) {
        products.push({
          id: product.id,
          productId: String(product.id),
          _id: String(product.id),
          name: product.nombre,
          category: product.categoria,
          price: product.precio,
          image: product.imagenUrl ? [product.imagenUrl] : ["/placeholder.png"],
          quantity: 0,
          total: product.precio,
        });
      }
    } catch (error) {
      console.error("Error getting product details:", error);
    }
  }

  return products;
}

// ----------------------
// Obtener wishlist completa (sin productos)
// ----------------------
export async function getTotalWishlist(userId?: string): Promise<number> {
  if (!userId) return 0;

  const wishlists: Wishlists | null = await kv.get(`wishlist-${userId}`);
  return wishlists?.items?.length || 0;
}

// ----------------------
// Eliminar producto de wishlist
// ----------------------
export async function delItem(productId: bigint) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    console.error("User not found.");
    return;
  }

  let wishlists: Wishlists | null = await kv.get(`wishlist-${userId}`);

  if (wishlists && wishlists.items) {
    const updatedWishlist = {
      userId: String(userId),
      items: wishlists.items.filter((item) => item.productId !== productId),
    };

    await kv.set(`wishlist-${userId}`, updatedWishlist);
    revalidatePath("/wishlist");
  }
}
