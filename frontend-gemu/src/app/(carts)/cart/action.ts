"use server";

import { kv } from "@/libs/kvMock";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { Session } from "next-auth";
import { prisma } from "@/libs/prisma";
import { EnrichedProduct } from "@/types/types";

export type Cart = {
  userId: string;
  items: Array<{
    productId: string; // almacenamos como string
    quantity: number;
    price: number;
  }>;
};

// Obtener los items del carrito y enriquecerlos con datos del producto
export async function getItems(
  userId: string
): Promise<EnrichedProduct[] | undefined> {
  if (!userId) {
    console.error("User ID not found.");
    return undefined;
  }

  const cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart || cart.items.length === 0) return [];

  const updatedCart: EnrichedProduct[] = [];

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

      // Creamos el objeto completo de EnrichedProduct explícitamente
      const updatedCartItem: EnrichedProduct = {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: product.precio,
        name: product.nombre,
        category: product.categoria,
        image: [], // vacía por ahora
        total: cartItem.quantity * product.precio,
        id: product.id,
        _id: product.id.toString(),
      };

      updatedCart.push(updatedCartItem);
    } catch (error) {
      console.error("Error obteniendo producto:", error);
    }
  }

  return updatedCart;
}

// Obtener el total de items del carrito
export async function getTotalItems(session: Session | null): Promise<number> {
  const cart: Cart | null = await kv.get(`cart-${session?.user._id}`);
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

// Agregar un item al carrito
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

// Eliminar un item completamente del carrito
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

// Eliminar una unidad de un item
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
          return { ...item, quantity: item.quantity - 1 };
        }
        return null; // eliminar si queda 0
      }
      return item;
    })
    .filter(Boolean) as Cart["items"];

  await kv.set(`cart-${userId}`, cart);
  revalidatePath("/cart");
}

// Vaciar el carrito completo
export async function emptyCart(userId: string) {
  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (cart) {
    cart.items = [];
    await kv.set(`cart-${userId}`, cart);
    revalidatePath("/cart");
  }
}
