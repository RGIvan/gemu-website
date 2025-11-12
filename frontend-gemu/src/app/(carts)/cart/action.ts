"use server";

import { kv } from "@/libs/kvMock";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { Session } from "next-auth";
import { prisma } from "@/libs/prisma";
import { Cart, CartItem, EnrichedProduct, Videojuego } from "@/types/types";

// -----------------------------
// Obtener los items del carrito con info del producto
// -----------------------------
export async function getItems(userId: string): Promise<EnrichedProduct[]> {
  if (!userId) {
    console.error("User ID not found");
    return [];
  }

  const cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart || !cart.items?.length) return [];

  const productIds = cart.items.map((item) => Number(item.productId));

  // Traemos los productos desde Prisma
  const productos = await prisma.videojuegos.findMany({
    where: { id: { in: productIds } },
  });

  // Mapeamos el carrito con la info completa
  const enriched: EnrichedProduct[] = cart.items.map((item) => {
    const producto = productos.find(
      (p: Videojuego) => p.id === BigInt(item.productId)
    );
    return {
      ...item,
      productId: item.productId.toString(),
      id: producto?.id || BigInt(0),
      name: producto?.nombre || "Desconocido",
      category: producto?.categoria || "N/A",
      image: producto?.imagenUrl ? [producto.imagenUrl] : [],
      price: producto?.precio || 0,
      total: (producto?.precio || 0) * item.quantity,
      purchased: false,
      _id: item.productId.toString(),
      quantity: item.quantity,
    };
  });

  return enriched;
}

// -----------------------------
// Obtener el total de items del carrito
// -----------------------------
export async function getTotalItems(session: Session | null) {
  if (!session?.user?.id) return 0;

  const cart: Cart | null = await kv.get(`cart-${session.user.id}`);
  const total = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return total;
}

// -----------------------------
// Agregar item al carrito
// -----------------------------
export async function addItem(
  productId: string,
  size: string | undefined,
  color: string | undefined,
  price: number
) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    console.error("User ID not found.");
    return;
  }

  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) {
    cart = { userId, items: [] };
  }

  const existingItem = cart.items.find(
    (i) => i.productId === productId && i.size === size && i.color === color
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      productId,
      size,
      color,
      quantity: 1,
      price,
    });
  }

  await kv.set(`cart-${userId}`, cart);
  revalidatePath(`/product/${productId}`);
}

// -----------------------------
// Eliminar un item completo
// -----------------------------
export async function delItem(
  productId: string,
  size?: string,
  color?: string
) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return;

  const cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) return;

  const updatedCart = {
    userId,
    items: cart.items.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.size === size &&
          item.color === color
        )
    ),
  };

  await kv.set(`cart-${userId}`, updatedCart);
  revalidatePath("/cart");
}

// -----------------------------
// Eliminar una unidad de un item
// -----------------------------
export async function delOneItem(
  productId: string,
  size?: string,
  color?: string
) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return;

  const cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) return;

  const updatedCart = {
    userId,
    items: cart.items
      .map((item) => {
        if (
          item.productId === productId &&
          item.size === size &&
          item.color === color
        ) {
          if (item.quantity > 1) item.quantity -= 1;
          else return null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[],
  };

  await kv.set(`cart-${userId}`, updatedCart);
  revalidatePath("/cart");
}

// -----------------------------
// Vaciar carrito completo
// -----------------------------
export async function emptyCart(userId: string) {
  if (!userId) return;
  await kv.set(`cart-${userId}`, { userId, items: [] });
  revalidatePath("/cart");
}
