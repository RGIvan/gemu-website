"use server";

import { kv } from "@/libs/kvMock";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { Session } from "next-auth";
import { Cart, CartItem } from "@/types/types";

// -----------------------------
// Obtener items del carrito
// -----------------------------
export async function getItems(
  userId: string
): Promise<CartItem[] | undefined> {
  if (!userId) return undefined;
  const cart: Cart | null = await kv.get(`cart-${userId}`);
  return cart?.items || [];
}

// -----------------------------
// Obtener total de items en el carrito
// -----------------------------
export async function getTotalItems(session: Session | null): Promise<number> {
  const userId = session?.user._id;
  if (!userId) return 0;

  const cart: Cart | null = await kv.get(`cart-${userId}`);
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

// -----------------------------
// Agregar un item al carrito
// -----------------------------
export async function addItem(item: CartItem) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user._id;
  if (!userId) return;

  let cart: Cart | null = await kv.get(`cart-${userId}`);

  if (!cart) {
    cart = { userId, items: [item] };
  } else {
    const existingItem = cart.items.find(
      (i) =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
  }

  await kv.set(`cart-${userId}`, cart);
  revalidatePath("/cart");
}

// -----------------------------
// Eliminar un item completo del carrito
// -----------------------------
export async function delItem(item: CartItem) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user._id;
  if (!userId) return;

  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) return;

  cart.items = cart.items.filter(
    (i) =>
      !(
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
      )
  );

  await kv.set(`cart-${userId}`, cart);
  revalidatePath("/cart");
}

// -----------------------------
// Eliminar una unidad de un item
// -----------------------------
export async function delOneItem(item: CartItem) {
  const session: Session | null = await getServerSession(authOptions);
  const userId = session?.user._id;
  if (!userId) return;

  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) return;

  cart.items = cart.items
    .map((i) => {
      if (
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
      ) {
        if (i.quantity > 1) return { ...i, quantity: i.quantity - 1 };
        return null; // eliminar si queda 0
      }
      return i;
    })
    .filter(Boolean) as CartItem[];

  await kv.set(`cart-${userId}`, cart);
  revalidatePath("/cart");
}

// -----------------------------
// Vaciar carrito completo
// -----------------------------
export async function emptyCart(userId: string) {
  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (cart) {
    cart.items = [];
    await kv.set(`cart-${userId}`, cart);
    revalidatePath("/cart");
  }
}
