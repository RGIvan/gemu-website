"use server";

import { kv } from "@/libs/kvMock";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { Session } from "next-auth";
import { prisma } from "@/libs/prisma";
import { EnrichedProducts } from "@/types/types";

export type Cart = {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
};

export async function getItems(userId: string) {
  if (!userId) {
    console.error("User ID not found.");
    return undefined;
  }

  const cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) return undefined;

  const updatedCart: EnrichedProducts[] = [];

  for (const cartItem of cart.items) {
    try {
      const productId = BigInt(cartItem.productId);

      const product = await prisma.videojuegos.findUnique({
        where: { id: productId },
      });

      if (!product) {
        console.warn(`Producto no encontrado con ID ${productId}`);
        continue;
      }

      const updatedCartItem: EnrichedProducts = {
        ...cartItem,
        name: product.nombre,
        category: product.categoria,
        price: product.precio,
        image: [],
        purchased: false,
        _id: product.id.toString(),
      };

      updatedCart.push(updatedCartItem);
    } catch (error) {
      console.error("Error obteniendo producto:", error);
    }
  }

  return updatedCart;
}

export async function getTotalItems(session: Session | null) {
  const cart: Cart | null = await kv.get(`cart-${session?.user._id}`);
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

export async function addItem(
  category: string,
  productId: bigint,
  price: number
) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user._id) {
    console.error("User ID not found.");
    return;
  }

  const userId = session.user._id;
  let cart: Cart | null = await kv.get(`cart-${userId}`);

  const productIdStr = productId.toString();

  if (!cart) {
    cart = {
      userId,
      items: [
        {
          productId: productIdStr,
          quantity: 1,
          price,
        },
      ],
    };
  } else {
    const existingItem = cart.items.find(
      (item) => item.productId === productIdStr
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        productId: productIdStr,
        quantity: 1,
        price,
      });
    }
  }

  await kv.set(`cart-${userId}`, cart);
  revalidatePath(`/${category}/${productId}`);
}

export async function delItem(productId: bigint) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user._id;
  if (!userId) return;

  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) return;

  const productIdStr = productId.toString();

  cart.items = cart.items.filter((item) => item.productId !== productIdStr);
  await kv.set(`cart-${userId}`, cart);
  revalidatePath("/cart");
}

export async function delOneItem(productId: bigint) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user._id;
  if (!userId) return;

  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) return;

  const productIdStr = productId.toString();

  cart.items = cart.items
    .map((item) => {
      if (item.productId === productIdStr) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          return item;
        } else {
          return null;
        }
      }
      return item;
    })
    .filter(Boolean) as Cart["items"];

  await kv.set(`cart-${userId}`, cart);
  revalidatePath("/cart");
}

export async function emptyCart(userId: string) {
  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (cart) {
    cart.items = [];
    await kv.set(`cart-${userId}`, cart);
    revalidatePath("/cart");
  }
}
